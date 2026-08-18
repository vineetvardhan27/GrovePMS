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

  // 1. Validate dates
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

  // 3. Find or create guest record
  let guest = localGuestsStore.find(
    (g) => g.phone.replace(/\D/g, '') === input.guest_phone.replace(/\D/g, '')
  );

  if (!guest) {
    guest = {
      id: `g${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
    localGuestsStore.unshift(guest);

    try {
      const supabase = createClient();
      await (supabase.from('guests') as any).insert(guest);
    } catch {
      // Keep local store
    }
  } else {
    // Update existing guest
    guest.total_stays = (guest.total_stays || 0) + 1;
    if (input.guest_email && !guest.email) guest.email = input.guest_email;
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

  // 5. Generate Booking Number (e.g. HGV-202608-4821)
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingNumber = `HGV-${yearMonth}-${randomSuffix}`;
  const bookingId = `b${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  // Find room
  const targetRoom = localRoomsStore.find((r) => r.id === input.room_id) || localRoomsStore[0];

  // 6. Create Booking Record
  const newBooking: BookingWithDetails = {
    id: bookingId,
    hotel_id: hotelId,
    booking_number: bookingNumber,
    room_id: input.room_id,
    guest_id: guest.id,
    check_in_date: input.check_in_date,
    check_out_date: input.check_out_date,
    adults: Number(input.adults) || 1,
    children: Number(input.children) || 0,
    rate_per_night: Number(input.rate_per_night),
    total_amount: totalAmount,
    advance_amount: advanceAmount,
    payment_status: paymentStatus,
    booking_status: 'confirmed',
    source: input.source || 'direct',
    remarks: input.remarks?.trim() || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    guest,
    room: targetRoom,
    payments: [],
  };

  // 7. Record advance payment if present
  if (advanceAmount > 0) {
    const paymentRecord: PaymentRecord = {
      id: `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
      const supabase = createClient();
      await (supabase.from('payments') as any).insert(paymentRecord);
    } catch {
      // Keep local
    }
  }

  // Insert to local store
  localBookingsStore.unshift(newBooking);
  guest.total_spent = (guest.total_spent || 0) + advanceAmount;

  try {
    const supabase = createClient();
    await (supabase.from('bookings') as any).insert({
      id: newBooking.id,
      hotel_id: newBooking.hotel_id,
      booking_number: newBooking.booking_number,
      room_id: newBooking.room_id,
      guest_id: newBooking.guest_id,
      check_in_date: newBooking.check_in_date,
      check_out_date: newBooking.check_out_date,
      adults: newBooking.adults,
      children: newBooking.children,
      rate_per_night: newBooking.rate_per_night,
      total_amount: newBooking.total_amount,
      advance_amount: newBooking.advance_amount,
      payment_status: newBooking.payment_status,
      booking_status: newBooking.booking_status,
      source: newBooking.source,
      remarks: newBooking.remarks,
    });
  } catch {
    // Keep local
  }

  // 8. Update room status based on booking dates
  const todayStr = new Date().toISOString().split('T')[0];
  let updatedRoomStatus: RoomStatus = targetRoom.status;

  if (input.check_in_date === todayStr) {
    updatedRoomStatus = 'arriving_today';
  } else if (input.check_in_date > todayStr && targetRoom.status === 'available') {
    updatedRoomStatus = 'reserved';
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

  return { success: true, booking: newBooking };
}

/**
 * Cancel an existing reservation
 */
export async function cancelBookingAction(bookingId: string) {
  const booking = localBookingsStore.find((b) => b.id === bookingId);
  if (booking) {
    booking.booking_status = 'cancelled';
    booking.updated_at = new Date().toISOString();

    // Release room if it was marked reserved or arriving
    const room = localRoomsStore.find((r) => r.id === booking.room_id);
    if (room && (room.status === 'reserved' || room.status === 'arriving_today')) {
      room.status = 'available';
    }

    try {
      const supabase = createClient();
      await (supabase.from('bookings') as any)
        .update({ booking_status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', bookingId);
    } catch {
      // Fallback
    }
  }

  revalidatePath('/bookings');
  revalidatePath('/bookings/calendar');
  revalidatePath('/rooms');
  revalidatePath('/dashboard');

  return { success: true };
}
