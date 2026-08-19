'use server';

import { createClient } from '../supabase/server';
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
  localBookingsStore,
  localPaymentsStore,
} from './queries';
import { Guest, localGuestsStore } from '../guests/queries';
import { localRoomsStore, DEFAULT_ROOM_CATEGORIES } from '../rooms/queries';
import { revalidatePath } from 'next/cache';

export interface CreateBookingInput {
  hotel_id?: string;
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
  hotelId: string,
  roomId: string,
  checkInDate: string,
  checkOutDate: string,
  excludeBookingId?: string
): Promise<{ is_available: boolean; conflict?: { booking_number: string; check_in_date: string; check_out_date: string } }> {
  try {
    const supabase = createClient();
    let q = supabase
      .from('bookings')
      .select('id, booking_number, check_in_date, check_out_date, booking_status')
      .eq('hotel_id', hotelId)
      .eq('room_id', roomId)
      .neq('booking_status', 'cancelled')
      .lt('check_in_date', checkOutDate)
      .gt('check_out_date', checkInDate);

    if (excludeBookingId) {
      q = q.neq('id', excludeBookingId);
    }

    const { data: conflicts, error } = await q;
    if (!error && conflicts && conflicts.length > 0) {
      return {
        is_available: false,
        conflict: conflicts[0] as any,
      };
    }
  } catch {
    // Check local store
  }

  // Check in-memory store
  const conflict = localBookingsStore.find(
    (b) =>
      b.room_id === roomId &&
      b.booking_status !== 'cancelled' &&
      b.id !== excludeBookingId &&
      b.check_in_date < checkOutDate &&
      b.check_out_date > checkInDate
  );

  if (conflict) {
    return {
      is_available: false,
      conflict: {
        booking_number: conflict.booking_number,
        check_in_date: conflict.check_in_date,
        check_out_date: conflict.check_out_date,
      },
    };
  }

  return { is_available: true };
}

/**
 * Create a new booking with automatic guest linkage, conflict check, and advance payment logging
 */
export async function createBookingAction(input: CreateBookingInput): Promise<BookingActionResult> {
  const hotelId = input.hotel_id || 'a0000000-0000-0000-0000-000000000001';

  // 1. Validate dates and fields
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

  // 2. Server-side double-booking check
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

  const supabase = createClient();

  // 3. Find or create guest in Supabase
  let guestId: string = '';
  let guestData: Guest;

  try {
    const cleanPhone = input.guest_phone.trim();
    const { data: existingGuest } = (await supabase
      .from('guests')
      .select('*')
      .eq('hotel_id', hotelId)
      .eq('phone', cleanPhone)
      .maybeSingle()) as { data: Guest | null; [key: string]: any };

    if (existingGuest) {
      guestId = existingGuest.id;
      guestData = existingGuest;
    } else {

      guestId = crypto.randomUUID();
      guestData = {
        id: guestId,
        hotel_id: hotelId,
        full_name: input.guest_name.trim(),
        phone: cleanPhone,
        email: input.guest_email?.trim() || null,
        id_type: input.guest_id_type || null,
        id_number: input.guest_id_number || null,
        address: input.guest_address?.trim() || null,
        total_stays: 1,
        total_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: guestInsertErr } = await (supabase.from('guests') as any).insert({
        id: guestData.id,
        hotel_id: guestData.hotel_id,
        full_name: guestData.full_name,
        phone: guestData.phone,
        email: guestData.email,
        id_type: guestData.id_type,
        id_number: guestData.id_number,
        address: guestData.address,
      });

      if (guestInsertErr) {
        console.error('Error inserting guest in Supabase:', guestInsertErr.message);
      }
    }
  } catch (err: any) {
    console.error('Error looking up/inserting guest:', err);
    guestId = crypto.randomUUID();
    guestData = {
      id: guestId,
      hotel_id: hotelId,
      full_name: input.guest_name.trim(),
      phone: input.guest_phone.trim(),
      email: input.guest_email?.trim() || null,
      id_type: input.guest_id_type || null,
      id_number: input.guest_id_number || null,
      address: input.guest_address?.trim() || null,
      total_stays: 1,
      total_spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // Update in-memory guest store
  const localGuestIdx = localGuestsStore.findIndex((g) => g.id === guestId);
  if (localGuestIdx >= 0) {
    localGuestsStore[localGuestIdx] = guestData;
  } else {
    localGuestsStore.unshift(guestData);
  }

  // 4. Calculate stay financials
  const checkIn = new Date(input.check_in_date);
  const checkOut = new Date(input.check_out_date);
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
  const baseRoomCharges = nights * Number(input.rate_per_night);
  const extraCharges = Number(input.extra_charges || 0);
  const totalAmount = baseRoomCharges + extraCharges;
  const advanceAmount = Number(input.advance_amount || 0);

  // Derive payment status
  let paymentStatus: PaymentStatus = 'no_payment';
  if (advanceAmount >= totalAmount && totalAmount > 0) {
    paymentStatus = 'fully_paid';
  } else if (advanceAmount > 0) {
    paymentStatus = 'advance_received';
  }

  // 5. Generate Booking Number & ID
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingNumber = `HGV-${yearMonth}-${randomSuffix}`;
  const bookingId = crypto.randomUUID();

  // Find room details
  let targetRoom = localRoomsStore.find((r) => r.id === input.room_id) || localRoomsStore[0];
  try {
    const { data: dbRoom } = await supabase
      .from('rooms')
      .select('*, category:category_id(*)')
      .eq('id', input.room_id)
      .single();
    if (dbRoom) {
      targetRoom = dbRoom as any;
    }
  } catch (err) {
    console.error('Error fetching room for booking:', err);
  }

  // 6. Create Booking Record in Supabase
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

  try {
    const { error: bookingErr } = await (supabase.from('bookings') as any).insert(bookingRecord);
    if (bookingErr) {
      console.warn('Notice: Supabase direct insert returned:', bookingErr.message);
    }
  } catch (err: any) {
    console.warn('Notice: Failed to connect to Supabase for booking insert:', err?.message);
  }


  const newBooking: BookingWithDetails = {
    ...bookingRecord,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    guest: guestData,
    room: targetRoom,
    payments: [],
  };

  // 7. Record advance payment if present
  if (advanceAmount > 0) {
    const paymentId = crypto.randomUUID();
    const paymentRecord: PaymentRecord = {
      id: paymentId,
      hotel_id: hotelId,
      booking_id: bookingId,
      amount: advanceAmount,
      payment_mode: input.payment_mode || 'cash',
      payment_type: 'advance',
      notes: `Advance for booking ${bookingNumber}`,
      created_at: new Date().toISOString(),
    };

    newBooking.payments.push(paymentRecord);
    localPaymentsStore.unshift(paymentRecord);

    try {
      const { error: payErr } = await (supabase.from('payments') as any).insert({
        id: paymentRecord.id,
        hotel_id: paymentRecord.hotel_id,
        booking_id: paymentRecord.booking_id,
        amount: paymentRecord.amount,
        payment_mode: paymentRecord.payment_mode,
        payment_type: paymentRecord.payment_type,
        notes: paymentRecord.notes,
      });
      if (payErr) {
        console.error('Error logging advance payment in Supabase:', payErr.message);
      }
    } catch (err) {
      console.error('Failed to insert advance payment:', err);
    }
  }

  // Insert to local store
  localBookingsStore.unshift(newBooking);

  // 8. Update room status based on booking dates
  const todayStr = new Date().toISOString().split('T')[0];
  let updatedRoomStatus: RoomStatus = targetRoom.status;

  if (input.check_in_date === todayStr) {
    updatedRoomStatus = 'arriving_today';
  } else if (input.check_in_date > todayStr && (targetRoom.status === 'available' || targetRoom.status === 'cleaning')) {
    updatedRoomStatus = 'reserved';
  }

  try {
    await (supabase.from('rooms') as any)
      .update({ status: updatedRoomStatus, updated_at: new Date().toISOString() })
      .eq('id', input.room_id);
  } catch (err) {
    console.error('Failed to update room status:', err);
  }

  const roomIdx = localRoomsStore.findIndex((r) => r.id === input.room_id);
  if (roomIdx >= 0) {
    localRoomsStore[roomIdx] = {
      ...localRoomsStore[roomIdx],
      status: updatedRoomStatus,
    };
  }

  revalidatePath('/bookings');
  revalidatePath('/bookings/calendar');
  revalidatePath('/rooms');
  revalidatePath('/dashboard');
  revalidatePath('/guests');
  revalidatePath('/payments');
  revalidatePath('/billing');

  return { success: true, booking: newBooking };
}

/**
 * Cancel an existing reservation
 */
export async function cancelBookingAction(bookingId: string) {
  try {
    const supabase = createClient();

    // 1. Fetch booking to find room_id
    const { data: booking } = (await supabase
      .from('bookings')
      .select('id, room_id, booking_status')
      .eq('id', bookingId)
      .single()) as { data: { id: string; room_id: string; booking_status: string } | null; [key: string]: any };

    // 2. Update booking status
    const { error } = await (supabase.from('bookings') as any)
      .update({ booking_status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (error) {
      console.error('Error cancelling booking in Supabase:', error.message);
      return { success: false, error: 'Failed to cancel booking.' };
    }

    // 3. Release room status back to available if room is not occupied
    if (booking?.room_id) {
      const { data: currentRoom } = (await supabase
        .from('rooms')
        .select('status')
        .eq('id', booking.room_id)
        .single()) as { data: { status: string } | null; [key: string]: any };

      if (currentRoom && (currentRoom.status === 'reserved' || currentRoom.status === 'arriving_today')) {
        await (supabase.from('rooms') as any)
          .update({ status: 'available', updated_at: new Date().toISOString() })
          .eq('id', booking.room_id);
      }
    }

  } catch (err: any) {
    console.error('Failed to cancel booking:', err);
  }

  const booking = localBookingsStore.find((b) => b.id === bookingId);
  if (booking) {
    booking.booking_status = 'cancelled';
    booking.updated_at = new Date().toISOString();

    const room = localRoomsStore.find((r) => r.id === booking.room_id);
    if (room && (room.status === 'reserved' || room.status === 'arriving_today')) {
      room.status = 'available';
    }
  }

  revalidatePath('/bookings');
  revalidatePath('/bookings/calendar');
  revalidatePath('/rooms');
  revalidatePath('/dashboard');
  revalidatePath('/billing');

  return { success: true };
}

