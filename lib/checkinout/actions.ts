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
  const booking = localBookingsStore.find((b) => b.id === bookingId);

  if (!booking) {
    return { error: 'Booking not found. Please refresh the page.' };
  }

  if (booking.booking_status !== 'confirmed') {
    return { error: `Cannot check in — booking status is currently "${booking.booking_status.replace('_', ' ')}". Only confirmed bookings can be checked in.` };
  }

  // Update booking status
  booking.booking_status = 'checked_in';
  booking.updated_at = new Date().toISOString();

  // Update room status to occupied
  const room = localRoomsStore.find((r) => r.id === booking.room_id);
  if (room) {
    room.status = 'occupied';
    room.housekeeping_status = 'clean';
  }

  try {
    const supabase = createClient();
    await (supabase.from('bookings') as any)
      .update({ booking_status: 'checked_in', updated_at: booking.updated_at })
      .eq('id', bookingId);

    await (supabase.from('rooms') as any)
      .update({ status: 'occupied', updated_at: new Date().toISOString() })
      .eq('id', booking.room_id);
  } catch {
    // Local store already updated — continue
  }

  revalidatePath('/bookings');
  revalidatePath('/rooms');
  revalidatePath('/dashboard');

  return { success: true };
}

/**
 * Check Out Action: checked_in → checked_out, room → cleaning/dirty
 */
export async function checkOutAction(bookingId: string): Promise<{ success?: boolean; error?: string }> {
  const booking = localBookingsStore.find((b) => b.id === bookingId);

  if (!booking) {
    return { error: 'Booking not found. Please refresh the page.' };
  }

  if (booking.booking_status !== 'checked_in') {
    return { error: `Cannot check out — booking status is currently "${booking.booking_status.replace('_', ' ')}". Only checked-in bookings can be checked out.` };
  }

  // Update booking status
  booking.booking_status = 'checked_out';
  booking.updated_at = new Date().toISOString();

  // Room → cleaning required
  const room = localRoomsStore.find((r) => r.id === booking.room_id);
  if (room) {
    room.status = 'cleaning';
    room.housekeeping_status = 'dirty';
  }

  try {
    const supabase = createClient();
    await (supabase.from('bookings') as any)
      .update({ booking_status: 'checked_out', updated_at: booking.updated_at })
      .eq('id', bookingId);

    await (supabase.from('rooms') as any)
      .update({ status: 'cleaning', housekeeping_status: 'dirty', updated_at: new Date().toISOString() })
      .eq('id', booking.room_id);
  } catch {
    // Local store already updated — continue
  }

  revalidatePath('/bookings');
  revalidatePath('/rooms');
  revalidatePath('/dashboard');
  revalidatePath(`/billing/${bookingId}`);

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
  const booking = localBookingsStore.find((b) => b.id === bookingId);

  if (!booking) {
    return { error: 'Booking not found. Please refresh the page.' };
  }

  if (amount <= 0) {
    return { error: 'Payment amount must be greater than zero.' };
  }

  const paymentRecord: PaymentRecord = {
    id: `p${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    hotel_id: booking.hotel_id,
    booking_id: bookingId,
    amount: Number(amount),
    payment_mode: mode,
    payment_type: booking.advance_amount > 0 ? 'partial' : 'advance',
    notes: notes?.trim() || null,
    created_at: new Date().toISOString(),
  };

  // Add to local stores
  localPaymentsStore.unshift(paymentRecord);
  booking.payments.push(paymentRecord);
  booking.advance_amount += amount;

  // Recalculate payment status based on grand_total (which may include GST)
  const effectiveTotal = grandTotal || booking.total_amount;
  const totalPaid = localPaymentsStore
    .filter((p) => p.booking_id === bookingId)
    .reduce((sum, p) => sum + p.amount, 0);

  let paymentStatus: PaymentStatus = 'advance_received';
  if (totalPaid >= effectiveTotal) {
    paymentStatus = 'fully_paid';
  } else if (totalPaid === 0) {
    paymentStatus = 'no_payment';
  }

  booking.payment_status = paymentStatus;

  try {
    const supabase = createClient();
    await (supabase.from('payments') as any).insert(paymentRecord);
    await (supabase.from('bookings') as any)
      .update({ payment_status: paymentStatus, advance_amount: booking.advance_amount })
      .eq('id', bookingId);
  } catch {
    // Local store already updated
  }

  revalidatePath(`/billing/${bookingId}`);
  revalidatePath('/bookings');
  revalidatePath('/dashboard');

  return { success: true, updatedPaymentStatus: paymentStatus };
}
