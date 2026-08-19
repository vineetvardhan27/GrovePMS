'use server';

import { createClient } from '../supabase/server';
import { localBookingsStore, localPaymentsStore, PaymentRecord } from '../bookings/queries';
import { localRoomsStore } from '../rooms/queries';
import { PaymentMode, PaymentStatus } from '../types/database.types';
import { revalidatePath } from 'next/cache';

/**
 * Check In Action: confirmed → checked_in, room → occupied
 */
export async function checkInAction(bookingId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // 1. Fetch booking from Supabase
    const { data: booking, error: fetchErr } = (await supabase
      .from('bookings')
      .select('id, room_id, booking_status')
      .eq('id', bookingId)
      .single()) as { data: { id: string; room_id: string; booking_status: string } | null; error: any };


    if (fetchErr || !booking) {
      console.error(`Booking ${bookingId} not found in Supabase:`, fetchErr?.message);
      // Fallback check in local store
      const localBooking = localBookingsStore.find((b) => b.id === bookingId);
      if (!localBooking) {
        return { error: 'Booking not found. Please refresh the page.' };
      }
    }

    const currentStatus = booking?.booking_status || localBookingsStore.find((b) => b.id === bookingId)?.booking_status;
    if (currentStatus !== 'confirmed') {
      return {
        error: `Cannot check in — booking status is currently "${currentStatus?.replace('_', ' ')}". Only confirmed bookings can be checked in.`,
      };
    }

    const roomId = booking?.room_id || localBookingsStore.find((b) => b.id === bookingId)?.room_id;
    const nowIso = new Date().toISOString();

    // 2. Update booking in Supabase
    const { error: updateBookingErr } = await (supabase.from('bookings') as any)
      .update({ booking_status: 'checked_in', updated_at: nowIso })
      .eq('id', bookingId);

    if (updateBookingErr) {
      console.error('Error updating booking to checked_in in Supabase:', updateBookingErr.message);
      return { error: 'Failed to update booking status in database.' };
    }

    // 3. Update room status to occupied in Supabase
    if (roomId) {
      const { error: updateRoomErr } = await (supabase.from('rooms') as any)
        .update({ status: 'occupied', housekeeping_status: 'clean', updated_at: nowIso })
        .eq('id', roomId);

      if (updateRoomErr) {
        console.error('Error updating room to occupied in Supabase:', updateRoomErr.message);
      }
    }
  } catch (err: any) {
    console.error('Failed to perform check-in in Supabase:', err);
    return { error: err?.message || 'Database error during check-in.' };
  }

  // Update in-memory fallback stores
  const localBooking = localBookingsStore.find((b) => b.id === bookingId);
  if (localBooking) {
    localBooking.booking_status = 'checked_in';
    localBooking.updated_at = new Date().toISOString();
  }

  const localRoom = localRoomsStore.find((r) => r.id === localBooking?.room_id);
  if (localRoom) {
    localRoom.status = 'occupied';
    localRoom.housekeeping_status = 'clean';
  }

  revalidatePath('/bookings');
  revalidatePath('/rooms');
  revalidatePath('/dashboard');
  revalidatePath(`/billing/${bookingId}`);

  return { success: true };
}

/**
 * Check Out Action: checked_in → checked_out, room → cleaning/dirty
 */
export async function checkOutAction(bookingId: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // 1. Fetch booking from Supabase
    const { data: booking, error: fetchErr } = (await supabase
      .from('bookings')
      .select('id, room_id, booking_status')
      .eq('id', bookingId)
      .single()) as { data: { id: string; room_id: string; booking_status: string } | null; error: any };


    if (fetchErr || !booking) {
      console.error(`Booking ${bookingId} not found in Supabase:`, fetchErr?.message);
      const localBooking = localBookingsStore.find((b) => b.id === bookingId);
      if (!localBooking) {
        return { error: 'Booking not found. Please refresh the page.' };
      }
    }

    const currentStatus = booking?.booking_status || localBookingsStore.find((b) => b.id === bookingId)?.booking_status;
    if (currentStatus !== 'checked_in') {
      return {
        error: `Cannot check out — booking status is currently "${currentStatus?.replace('_', ' ')}". Only checked-in bookings can be checked out.`,
      };
    }

    const roomId = booking?.room_id || localBookingsStore.find((b) => b.id === bookingId)?.room_id;
    const nowIso = new Date().toISOString();

    // 2. Update booking status
    const { error: updateBookingErr } = await (supabase.from('bookings') as any)
      .update({ booking_status: 'checked_out', updated_at: nowIso })
      .eq('id', bookingId);

    if (updateBookingErr) {
      console.error('Error updating booking to checked_out in Supabase:', updateBookingErr.message);
      return { error: 'Failed to update booking status in database.' };
    }

    // 3. Room → cleaning required / dirty
    if (roomId) {
      const { error: updateRoomErr } = await (supabase.from('rooms') as any)
        .update({ status: 'cleaning', housekeeping_status: 'dirty', updated_at: nowIso })
        .eq('id', roomId);

      if (updateRoomErr) {
        console.error('Error updating room to cleaning in Supabase:', updateRoomErr.message);
      }
    }
  } catch (err: any) {
    console.error('Failed to perform check-out in Supabase:', err);
    return { error: err?.message || 'Database error during check-out.' };
  }

  // Update in-memory fallback stores
  const localBooking = localBookingsStore.find((b) => b.id === bookingId);
  if (localBooking) {
    localBooking.booking_status = 'checked_out';
    localBooking.updated_at = new Date().toISOString();
  }

  const localRoom = localRoomsStore.find((r) => r.id === localBooking?.room_id);
  if (localRoom) {
    localRoom.status = 'cleaning';
    localRoom.housekeeping_status = 'dirty';
  }

  revalidatePath('/bookings');
  revalidatePath('/rooms');
  revalidatePath('/dashboard');
  revalidatePath(`/billing/${bookingId}`);
  revalidatePath('/billing');

  return { success: true };
}

/**
 * Record Payment Action: inserts a payment record and recalculates payment_status
 */
export async function recordPaymentAction(
  bookingId: string,
  amount: number,
  mode: PaymentMode,
  notes?: string,
  grandTotal?: number
): Promise<{ success?: boolean; error?: string; updatedPaymentStatus?: PaymentStatus }> {
  if (amount <= 0) {
    return { error: 'Payment amount must be greater than zero.' };
  }

  const paymentId = crypto.randomUUID();
  let paymentStatus: PaymentStatus = 'advance_received';

  try {
    const supabase = createClient();

    // 1. Fetch booking and existing payments
    const { data: booking, error: bookingErr } = (await supabase
      .from('bookings')
      .select('id, hotel_id, total_amount, advance_amount, payments(*)')
      .eq('id', bookingId)
      .single()) as { data: { id: string; hotel_id: string; total_amount: number; advance_amount: number; payments: any[] } | null; error: any };


    const localBooking = localBookingsStore.find((b) => b.id === bookingId);
    const hotelId = booking?.hotel_id || localBooking?.hotel_id || 'a0000000-0000-0000-0000-000000000001';
    const effectiveTotal = grandTotal || Number(booking?.total_amount || localBooking?.total_amount || 0);

    const existingPayments = (booking?.payments || []) as any[];
    const paymentsList = (existingPayments && existingPayments.length > 0)
      ? existingPayments
      : localPaymentsStore.filter((p) => p.booking_id === bookingId);


    const priorTotalPaid = paymentsList.reduce((sum: number, p: any) => {
      const amt = Number(p.amount) || 0;
      return p.payment_type === 'refund' ? sum - amt : sum + amt;
    }, 0);

    const newTotalPaid = priorTotalPaid + Number(amount);



    if (newTotalPaid >= effectiveTotal && effectiveTotal > 0) {
      paymentStatus = 'fully_paid';
    } else if (newTotalPaid > 0) {
      paymentStatus = 'advance_received';
    } else {
      paymentStatus = 'no_payment';
    }

    const paymentType = paymentStatus === 'fully_paid' ? 'settlement' : 'running';

    // 2. Insert payment record into Supabase
    const { error: payInsertErr } = await (supabase.from('payments') as any).insert({
      id: paymentId,
      hotel_id: hotelId,
      booking_id: bookingId,
      amount: Number(amount),
      payment_mode: mode,
      payment_type: paymentType,
      notes: notes?.trim() || null,
    });

    if (payInsertErr) {
      console.warn('Notice: Supabase payment insert returned:', payInsertErr.message);
    }

    // 3. Update booking in Supabase
    const { error: bookingUpdateErr } = await (supabase.from('bookings') as any)
      .update({
        payment_status: paymentStatus,
        advance_amount: newTotalPaid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (bookingUpdateErr) {
      console.warn('Notice: Supabase booking payment update returned:', bookingUpdateErr.message);
    }
  } catch (err: any) {
    console.warn('Notice: Failed to connect to Supabase for payment:', err?.message);
  }


  // Update in-memory stores
  const paymentRecord: PaymentRecord = {
    id: paymentId,
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    booking_id: bookingId,
    amount: Number(amount),
    payment_mode: mode,
    payment_type: paymentStatus === 'fully_paid' ? 'settlement' : 'running',
    notes: notes?.trim() || null,
    created_at: new Date().toISOString(),
  };

  localPaymentsStore.unshift(paymentRecord);
  const localBooking = localBookingsStore.find((b) => b.id === bookingId);
  if (localBooking) {
    localBooking.payments.push(paymentRecord);
    localBooking.advance_amount += amount;
    localBooking.payment_status = paymentStatus;
  }

  revalidatePath(`/billing/${bookingId}`);
  revalidatePath('/billing');
  revalidatePath('/payments');
  revalidatePath('/bookings');
  revalidatePath('/dashboard');
  revalidatePath('/reports');

  return { success: true, updatedPaymentStatus: paymentStatus };
}

