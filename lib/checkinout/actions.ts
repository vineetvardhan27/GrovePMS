'use server';

import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { PaymentMode, PaymentStatus } from '../types/database.types';
import { revalidatePath } from 'next/cache';

/**
 * Check In Action: confirmed → checked_in, room → occupied
 */
export async function checkInAction(bookingId: string): Promise<{ success?: boolean; error?: string }> {
  const staff = await getCurrentStaff();
  if (!staff) {
    return { error: 'Please log in to continue.' };
  }

  if (staff.role === 'housekeeping') {
    return { error: 'Housekeeping staff cannot perform check-ins.' };
  }

  try {
    const supabase = createClient();

    // 1. Fetch booking from Supabase with hotel isolation
    const { data: booking, error: fetchErr } = (await supabase
      .from('bookings')
      .select('id, room_id, hotel_id, booking_status')
      .eq('id', bookingId)
      .eq('hotel_id', staff.hotel_id)
      .maybeSingle()) as { data: any; error: any };

    if (fetchErr || !booking) {
      return { error: 'Booking not found in your hotel.' };
    }

    if (booking.booking_status !== 'confirmed') {
      return {
        error: `Cannot check in — booking status is currently "${booking.booking_status.replace('_', ' ')}". Only confirmed bookings can be checked in.`,
      };
    }

    const nowIso = new Date().toISOString();

    // 2. Update booking in Supabase
    const { error: updateBookingErr } = await (supabase.from('bookings') as any)
      .update({ booking_status: 'checked_in', updated_at: nowIso })
      .eq('id', bookingId)
      .eq('hotel_id', staff.hotel_id);

    if (updateBookingErr) {
      console.error('Error updating booking to checked_in in Supabase:', updateBookingErr.message);
      return { error: 'Failed to update booking status in database.' };
    }

    // 3. Update room status to occupied in Supabase
    if (booking.room_id) {
      const { error: updateRoomErr } = await (supabase.from('rooms') as any)
        .update({ status: 'occupied', housekeeping_status: 'clean', updated_at: nowIso })
        .eq('id', booking.room_id)
        .eq('hotel_id', staff.hotel_id);

      if (updateRoomErr) {
        console.error('Error updating room to occupied in Supabase:', updateRoomErr.message);
        // Rollback booking status
        await (supabase.from('bookings') as any)
          .update({ booking_status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', bookingId);
        return { error: 'Failed to update room status in database.' };
      }
    }

    revalidatePath('/bookings');
    revalidatePath('/rooms');
    revalidatePath('/dashboard');
    revalidatePath(`/billing/${bookingId}`);

    return { success: true };
  } catch (err: any) {
    console.error('Check-in exception:', err);
    return { error: err?.message || 'Database error during check-in.' };
  }
}

/**
 * Check Out Action: checked_in → checked_out, room → cleaning/dirty
 */
export async function checkOutAction(bookingId: string): Promise<{ success?: boolean; error?: string }> {
  const staff = await getCurrentStaff();
  if (!staff) {
    return { error: 'Please log in to continue.' };
  }

  if (staff.role === 'housekeeping') {
    return { error: 'Housekeeping staff cannot perform check-outs.' };
  }

  try {
    const supabase = createClient();

    // 1. Fetch booking from Supabase with hotel isolation
    const { data: booking, error: fetchErr } = (await supabase
      .from('bookings')
      .select('id, room_id, hotel_id, booking_status')
      .eq('id', bookingId)
      .eq('hotel_id', staff.hotel_id)
      .maybeSingle()) as { data: any; error: any };

    if (fetchErr || !booking) {
      return { error: 'Booking not found in your hotel.' };
    }

    if (booking.booking_status !== 'checked_in') {
      return {
        error: `Cannot check out — booking status is currently "${booking.booking_status.replace('_', ' ')}". Only checked-in bookings can be checked out.`,
      };
    }

    const nowIso = new Date().toISOString();

    // 2. Update booking status
    const { error: updateBookingErr } = await (supabase.from('bookings') as any)
      .update({ booking_status: 'checked_out', updated_at: nowIso })
      .eq('id', bookingId)
      .eq('hotel_id', staff.hotel_id);

    if (updateBookingErr) {
      console.error('Error updating booking to checked_out in Supabase:', updateBookingErr.message);
      return { error: 'Failed to update booking status in database.' };
    }

    // 3. Room → cleaning required / dirty
    if (booking.room_id) {
      const { error: updateRoomErr } = await (supabase.from('rooms') as any)
        .update({ status: 'cleaning', housekeeping_status: 'dirty', updated_at: nowIso })
        .eq('id', booking.room_id)
        .eq('hotel_id', staff.hotel_id);

      if (updateRoomErr) {
        console.error('Error updating room to cleaning in Supabase:', updateRoomErr.message);
        await (supabase.from('bookings') as any)
          .update({ booking_status: 'checked_in', updated_at: new Date().toISOString() })
          .eq('id', bookingId);
        return { error: 'Failed to update room status in database.' };
      }
    }

    revalidatePath('/bookings');
    revalidatePath('/rooms');
    revalidatePath('/dashboard');
    revalidatePath(`/billing/${bookingId}`);
    revalidatePath('/billing');

    return { success: true };
  } catch (err: any) {
    console.error('Check-out exception:', err);
    return { error: err?.message || 'Database error during check-out.' };
  }
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
  const staff = await getCurrentStaff();
  if (!staff) {
    return { error: 'Please log in to continue.' };
  }

  if (staff.role === 'housekeeping') {
    return { error: 'Housekeeping staff cannot record payments.' };
  }

  if (amount <= 0) {
    return { error: 'Payment amount must be greater than zero.' };
  }

  const paymentId = crypto.randomUUID();

  try {
    const supabase = createClient();

    // 1. Fetch booking and existing payments
    const { data: booking, error: bookingErr } = (await supabase
      .from('bookings')
      .select('id, hotel_id, total_amount, advance_amount, payments(*)')
      .eq('id', bookingId)
      .eq('hotel_id', staff.hotel_id)
      .maybeSingle()) as { data: any; error: any };

    if (bookingErr || !booking) {
      return { error: 'Booking not found in your hotel property.' };
    }

    const effectiveTotal = grandTotal || Number(booking.total_amount || 0);
    const existingPayments = (booking.payments || []) as any[];

    const priorTotalPaid = existingPayments.reduce((sum: number, p: any) => {
      const amt = Number(p.amount) || 0;
      return p.payment_type === 'refund' ? sum - amt : sum + amt;
    }, 0);

    const newTotalPaid = priorTotalPaid + Number(amount);

    let paymentStatus: PaymentStatus = 'advance_received';
    if (newTotalPaid >= effectiveTotal && effectiveTotal > 0) {
      paymentStatus = 'fully_paid';
    } else if (newTotalPaid > 0) {
      paymentStatus = 'advance_received';
    } else {
      paymentStatus = 'no_payment';
    }

    const paymentType = paymentStatus === 'fully_paid' ? 'settlement' : 'running';

    // 2. Insert payment record into Supabase
    const { error: payInsertErr } = await (supabase.from('payments') as any)
      .insert({
        id: paymentId,
        hotel_id: staff.hotel_id,
        booking_id: bookingId,
        amount: Number(amount),
        payment_mode: mode,
        payment_type: paymentType,
        notes: notes?.trim() || null,
        recorded_by: staff.id,
      });

    if (payInsertErr) {
      console.error('Error inserting payment in Supabase:', payInsertErr.message);
      return { error: `Failed to record payment: ${payInsertErr.message}` };
    }

    // 3. Update booking in Supabase
    const { error: bookingUpdateErr } = await (supabase.from('bookings') as any)
      .update({
        payment_status: paymentStatus,
        advance_amount: newTotalPaid,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .eq('hotel_id', staff.hotel_id);

    if (bookingUpdateErr) {
      console.error('Error updating booking payment status in Supabase:', bookingUpdateErr.message);
      // Rollback payment
      await (supabase.from('payments') as any).delete().eq('id', paymentId);
      return { error: `Failed to update booking payment status: ${bookingUpdateErr.message}` };
    }

    revalidatePath(`/billing/${bookingId}`);
    revalidatePath('/billing');
    revalidatePath('/payments');
    revalidatePath('/bookings');
    revalidatePath('/dashboard');
    revalidatePath('/reports');

    return { success: true, updatedPaymentStatus: paymentStatus };
  } catch (err: any) {
    console.error('Record payment exception:', err);
    return { error: err?.message || 'Database error while recording payment.' };
  }
}
