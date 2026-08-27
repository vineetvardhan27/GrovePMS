'use server';

import { createClient } from '../supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getCurrentStaff } from '../auth/session';
import {
  BookingStatus,
  PaymentStatus,
  BookingSource,
  PaymentMode,
  RoomStatus,
} from '../types/database.types';
import {
  BookingWithDetails,
  PaymentRecord,
} from './queries';
import { Guest } from '../guests/queries';
import { RoomWithCategory } from '../rooms/queries';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server configuration error: Service role key is missing.');
  }
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface CreateBookingInput {
  room_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  guest_id_type?: string;
  guest_id_number?: string;
  guest_address?: string;
  check_in_date: string; // YYYY-MM-DD
  check_out_date: string; // YYYY-MM-DD
  adults: number;
  children: number;
  rate_per_night: number;
  extra_charges?: number;
  advance_amount: number;
  payment_mode?: PaymentMode;
  source: BookingSource;
  remarks?: string;
}

export interface BookingActionResult {
  success?: boolean;
  error?: string;
  booking?: BookingWithDetails;
}

/**
 * Server-Side Double-Booking Prevention (Rules.md §2)
 */
export async function checkDoubleBooking(
  hotelId: string | undefined,
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeBookingId?: string
): Promise<{ is_available: boolean; conflict?: { booking_number: string; check_in_date: string; check_out_date: string } }> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;

    if (!activeHotelId) {
      return { is_available: true };
    }

    const admin = getAdminClient();
    let q = admin
      .from('bookings')
      .select('id, booking_number, check_in_date, check_out_date, booking_status')
      .eq('hotel_id', activeHotelId)
      .eq('room_id', roomId)
      .neq('booking_status', 'cancelled')
      .lt('check_in_date', checkOutDate)
      .gt('check_out_date', checkInDate);

    if (excludeBookingId) {
      q = q.neq('id', excludeBookingId);
    }

    const { data: conflicts, error } = await q;
    if (error) {
      console.error('Error checking double booking in Supabase:', error.message);
    }
    if (conflicts && conflicts.length > 0) {
      return {
        is_available: false,
        conflict: conflicts[0] as any,
      };
    }
  } catch (err) {
    console.error('checkDoubleBooking exception:', err);
  }

  return { is_available: true };
}

/**
 * Create a new booking with automatic guest linkage, conflict check, and advance payment logging
 */
export async function createBookingAction(input: CreateBookingInput): Promise<BookingActionResult> {
  // 1. Authenticate Staff Identity & Hotel Context
  const staff = await getCurrentStaff();
  if (!staff) {
    return { error: 'Please log in to continue.' };
  }

  if (!staff.is_active) {
    return { error: 'Your staff account is inactive. Please contact the administrator.' };
  }

  if (staff.role === 'housekeeping') {
    return { error: 'Housekeeping staff are not permitted to create reservations.' };
  }

  const hotelId = staff.hotel_id;

  // 2. Validate input fields
  if (!input.check_in_date || !input.check_out_date) {
    return { error: 'Please specify both check-in and check-out dates.' };
  }
  if (input.check_out_date <= input.check_in_date) {
    return { error: 'Check-out date must be strictly after the check-in date.' };
  }
  if (!input.room_id) {
    return { error: 'Please select a room for this reservation.' };
  }
  if (!input.guest_name?.trim() || !input.guest_phone?.trim()) {
    return { error: 'Guest name and contact phone number are required.' };
  }

  const admin = getAdminClient();

  // 3. Verify target room belongs to staff hotel
  const { data: targetRoom, error: roomFetchErr } = (await admin
    .from('rooms')
    .select('*, category:category_id(*)')
    .eq('id', input.room_id)
    .eq('hotel_id', hotelId)
    .maybeSingle()) as { data: any; error: any };

  if (roomFetchErr || !targetRoom) {
    return { error: 'The selected room does not exist in your hotel property.' };
  }

  // 4. Server-side double-booking check
  const availability = await checkDoubleBooking(
    hotelId,
    input.room_id,
    input.check_in_date,
    input.check_out_date
  );

  if (!availability.is_available) {
    const c = availability.conflict;
    return {
      error: `This room is already reserved for overlapping dates (${c?.check_in_date} to ${c?.check_out_date}, Booking #${c?.booking_number}). Please select a different room or adjust dates.`,
    };
  }

  // 5. Find or create guest in Supabase
  let guestId: string = '';
  let guestData: Guest;

  const cleanPhone = input.guest_phone.trim();
  const cleanName = input.guest_name.trim();

  try {
    const { data: existingGuest, error: guestFindErr } = (await admin
      .from('guests')
      .select('*')
      .eq('hotel_id', hotelId)
      .eq('phone', cleanPhone)
      .maybeSingle()) as { data: Guest | null; error: any };

    if (guestFindErr) {
      console.error('Error looking up existing guest:', guestFindErr.message);
    }

    if (existingGuest) {
      guestId = existingGuest.id;
      guestData = existingGuest;

      // Update guest details if new info provided
      const updateFields: any = { updated_at: new Date().toISOString() };
      if (input.guest_email?.trim() && !existingGuest.email) updateFields.email = input.guest_email.trim();
      if (input.guest_id_type && !existingGuest.id_type) updateFields.id_type = input.guest_id_type;
      if (input.guest_id_number && !existingGuest.id_number) updateFields.id_number = input.guest_id_number;
      if (input.guest_address?.trim() && !existingGuest.address) updateFields.address = input.guest_address.trim();

      if (Object.keys(updateFields).length > 1) {
        await (admin.from('guests') as any).update(updateFields).eq('id', guestId).eq('hotel_id', hotelId);
      }
    } else {
      guestId = crypto.randomUUID();
      const newGuestPayload = {
        id: guestId,
        hotel_id: hotelId,
        full_name: cleanName,
        phone: cleanPhone,
        email: input.guest_email?.trim() || null,
        id_type: input.guest_id_type || null,
        id_number: input.guest_id_number || null,
        address: input.guest_address?.trim() || null,
      };

      const { data: guestInserted, error: guestInsertErr } = await (admin.from('guests') as any)
        .insert(newGuestPayload)
        .select()
        .maybeSingle();

      if (guestInsertErr) {
        console.error('Error creating guest in Supabase:', guestInsertErr.message);
        return { error: 'Unable to save guest details. Please try again.' };
      }

      guestData = guestInserted as Guest;
      guestId = guestInserted.id;
    }
  } catch (err: any) {
    console.error('Guest lookup/create exception:', err);
    return { error: 'Unable to process guest record. Please try again.' };
  }

  // 6. Calculate stay financials
  const checkIn = new Date(input.check_in_date);
  const checkOut = new Date(input.check_out_date);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
  const baseRoomCharges = nights * Number(input.rate_per_night);
  const extraCharges = Number(input.extra_charges || 0);
  const totalAmount = baseRoomCharges + extraCharges;
  const advanceAmount = Math.max(0, Number(input.advance_amount || 0));

  let paymentStatus: PaymentStatus = 'no_payment';
  if (advanceAmount >= totalAmount && totalAmount > 0) {
    paymentStatus = 'fully_paid';
  } else if (advanceAmount > 0) {
    paymentStatus = 'advance_received';
  }

  // 7. Generate Booking Number & Insert Booking Record
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingNumber = `HGV-${yearMonth}-${randomSuffix}`;
  const bookingId = crypto.randomUUID();

  const bookingRecord = {
    id: bookingId,
    hotel_id: hotelId,
    booking_number: bookingNumber,
    room_id: input.room_id,
    guest_id: guestId,
    check_in_date: input.check_in_date,
    check_out_date: input.check_out_date,
    adults: Number(input.adults) || 1,
    children: Number(input.children) || 0,
    rate_per_night: Number(input.rate_per_night),
    total_amount: totalAmount,
    advance_amount: advanceAmount,
    payment_status: paymentStatus,
    booking_status: 'confirmed' as BookingStatus,
    source: input.source || 'direct',
    remarks: input.remarks?.trim() || null,
  };

  let bookingInserted: any = null;
  try {
    const { data, error } = await (admin.from('bookings') as any)
      .insert(bookingRecord)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating booking in Supabase:', error.message);
      return { error: 'Unable to save reservation record. Please try again.' };
    }

    bookingInserted = data;
    if (!bookingInserted?.id) {
      return { error: 'Database did not confirm reservation creation.' };
    }
  } catch (err: any) {
    console.error('Booking insertion exception:', err);
    return { error: 'Unable to complete reservation transaction. Please try again.' };
  }

  // 8. Record advance payment if present
  const recordedPayments: PaymentRecord[] = [];
  if (advanceAmount > 0) {
    const paymentId = crypto.randomUUID();
    const paymentRecord = {
      id: paymentId,
      hotel_id: hotelId,
      booking_id: bookingId,
      amount: advanceAmount,
      payment_mode: input.payment_mode || 'cash',
      payment_type: 'advance',
      notes: `Advance for booking ${bookingNumber}`,
      recorded_by: staff.id,
    };

    try {
      const { data: paymentInserted, error: payErr } = await (admin.from('payments') as any)
        .insert(paymentRecord)
        .select()
        .maybeSingle();

      if (payErr) {
        console.error('Error inserting advance payment in Supabase:', payErr.message);
        // Rollback booking
        await (admin.from('bookings') as any).delete().eq('id', bookingInserted.id);
        return { error: 'Unable to record advance payment. Reservation rolled back.' };
      }

      if (paymentInserted) {
        recordedPayments.push(paymentInserted as PaymentRecord);
      }
    } catch (err: any) {
      console.error('Payment exception during booking creation:', err);
      await (admin.from('bookings') as any).delete().eq('id', bookingInserted.id);
      return { error: 'Unable to record advance payment. Reservation rolled back.' };
    }
  }

  // 9. Update room status in Supabase
  const todayStr = new Date().toISOString().split('T')[0];
  let updatedRoomStatus: RoomStatus = targetRoom.status;

  if (input.check_in_date === todayStr) {
    updatedRoomStatus = 'arriving_today';
  } else if (input.check_in_date > todayStr && (targetRoom.status === 'available' || targetRoom.status === 'cleaning')) {
    updatedRoomStatus = 'reserved';
  }

  if (updatedRoomStatus !== targetRoom.status) {
    try {
      const { error: roomErr } = await (admin.from('rooms') as any)
        .update({ status: updatedRoomStatus, updated_at: new Date().toISOString() })
        .eq('id', input.room_id)
        .eq('hotel_id', hotelId);

      if (roomErr) {
        console.error('Error updating room status in Supabase:', roomErr.message);
        // Rollback booking & payment
        await (admin.from('payments') as any).delete().eq('booking_id', bookingInserted.id);
        await (admin.from('bookings') as any).delete().eq('id', bookingInserted.id);
        return { error: 'Unable to update room status in database. Reservation rolled back.' };
      }
    } catch (err) {
      console.error('Room update exception:', err);
      await (admin.from('payments') as any).delete().eq('booking_id', bookingInserted.id);
      await (admin.from('bookings') as any).delete().eq('id', bookingInserted.id);
      return { error: 'Unable to update room status in database. Reservation rolled back.' };
    }
  }

  // 10. Revalidate dashboard & module paths
  revalidatePath('/bookings');
  revalidatePath('/bookings/calendar');
  revalidatePath('/rooms');
  revalidatePath('/dashboard');
  revalidatePath('/guests');
  revalidatePath('/payments');
  revalidatePath('/billing');

  const finalBookingDetails: BookingWithDetails = {
    ...bookingInserted,
    guest: guestData,
    room: {
      ...targetRoom,
      status: updatedRoomStatus,
    } as RoomWithCategory,
    payments: recordedPayments,
  };

  return { success: true, booking: finalBookingDetails };
}

/**
 * Cancel an existing reservation
 */
export async function cancelBookingAction(bookingId: string) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return { success: false, error: 'Please log in to continue.' };
  }

  if (staff.role === 'housekeeping') {
    return { success: false, error: 'Housekeeping cannot cancel bookings.' };
  }

  try {
    const supabase = createClient();

    // 1. Fetch booking to find room_id and verify hotel isolation
    const { data: booking, error: fetchErr } = (await supabase
      .from('bookings')
      .select('id, room_id, hotel_id, booking_status')
      .eq('id', bookingId)
      .eq('hotel_id', staff.hotel_id)
      .maybeSingle()) as { data: any; error: any };

    if (fetchErr || !booking) {
      return { success: false, error: 'Booking not found.' };
    }

    if (booking.booking_status === 'cancelled') {
      return { success: false, error: 'Booking is already cancelled.' };
    }

    // 2. Update booking status
    const { error: updateErr } = await (supabase.from('bookings') as any)
      .update({ booking_status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .eq('hotel_id', staff.hotel_id);

    if (updateErr) {
      console.error('Error cancelling booking in Supabase:', updateErr.message);
      return { success: false, error: 'Failed to cancel booking in database.' };
    }

    // 3. Release room status back to available if room was reserved/arriving
    if (booking.room_id) {
      const { data: currentRoom } = (await supabase
        .from('rooms')
        .select('status')
        .eq('id', booking.room_id)
        .eq('hotel_id', staff.hotel_id)
        .maybeSingle()) as { data: any; error: any };

      if (currentRoom && (currentRoom.status === 'reserved' || currentRoom.status === 'arriving_today')) {
        await (supabase.from('rooms') as any)
          .update({ status: 'available', updated_at: new Date().toISOString() })
          .eq('id', booking.room_id)
          .eq('hotel_id', staff.hotel_id);
      }
    }

    revalidatePath('/bookings');
    revalidatePath('/bookings/calendar');
    revalidatePath('/rooms');
    revalidatePath('/dashboard');
    revalidatePath('/billing');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to cancel booking:', err);
    return { success: false, error: err?.message || 'Failed to cancel booking.' };
  }
}
