'use server';

import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { revalidatePath } from 'next/cache';
import {
  SaveBanquetHallInput,
  CreateBanquetBookingInput,
  AddBanquetChargeInput,
  RecordBanquetPaymentInput,
  UpdateBanquetBookingStatusInput,
  BanquetHall,
  BanquetBooking,
  BanquetCharge,
  BanquetPayment,
} from './types';
import {
  getBanquetHall,
  getBanquetBookings,
  getBanquetCharges,
  getBanquetPayments,
  calculateBanquetFolioTotals,
  checkBanquetAvailability,
} from './queries';

/**
 * Save or update Banquet Hall Resource configuration
 */
export async function saveBanquetHallAction(input: SaveBanquetHallInput): Promise<{
  success?: boolean;
  hall?: BanquetHall;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return { error: 'Access denied: Only Owner and Manager can configure the banquet hall.' };
    }

    if (!input.name || !input.name.trim()) {
      return { error: 'Banquet hall name is required.' };
    }

    const capacity =
      input.capacity !== undefined && input.capacity !== null && !isNaN(Number(input.capacity))
        ? Number(input.capacity)
        : null;

    const halfDay = Number(input.half_day_rate || 0);
    const fullDay = Number(input.full_day_rate || 0);

    const supabase = createClient();
    const existingHall = await getBanquetHall(staff.hotel_id);
    const hallId = input.id || existingHall.id || crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const hallRecord: BanquetHall = {
      id: hallId,
      hotel_id: staff.hotel_id,
      name: input.name.trim(),
      capacity,
      current_status: input.current_status || 'available',
      description: input.description?.trim() || null,
      half_day_rate: halfDay,
      full_day_rate: fullDay,
      amenities: input.amenities || existingHall.amenities || [],
      notes: input.notes?.trim() || null,
      is_active: true,
      updated_at: nowIso,
    };

    try {
      await (supabase.from('banquet_halls') as any).upsert({
        id: hallRecord.id,
        hotel_id: staff.hotel_id,
        name: hallRecord.name,
        capacity: hallRecord.capacity,
        current_status: hallRecord.current_status,
        description: hallRecord.description,
        half_day_rate: hallRecord.half_day_rate,
        full_day_rate: hallRecord.full_day_rate,
        amenities: hallRecord.amenities,
        notes: hallRecord.notes,
        is_active: hallRecord.is_active,
        updated_at: nowIso,
      });
    } catch {
      // Fallback
    }

    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          banquet_hall: hallRecord,
        },
      })
      .eq('id', staff.hotel_id);

    revalidatePath('/banquet');
    return { success: true, hall: hallRecord };
  } catch (err: any) {
    console.error('saveBanquetHallAction error:', err);
    return { error: `Failed to save banquet hall: ${err?.message || String(err)}` };
  }
}

/**
 * Create a new Banquet Event Booking
 * Atomically generates:
 * 1. Banquet Booking record
 * 2. Initial Folio Charges (Hall Rental + any initial items)
 * 3. Initial Advance Payment transaction (if advance > 0)
 */
export async function createBanquetBookingAction(input: CreateBanquetBookingInput): Promise<{
  success?: boolean;
  booking?: BanquetBooking;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager' && staff.role !== 'reception') {
      return { error: 'Access denied: You do not have permission to book banquet events.' };
    }

    if (!input.event_name || !input.event_name.trim()) {
      return { error: 'Event name is required.' };
    }
    if (!input.customer_name || !input.customer_name.trim()) {
      return { error: 'Customer / Host name is required.' };
    }
    if (!input.customer_phone || !input.customer_phone.trim()) {
      return { error: 'Customer contact phone is required.' };
    }
    if (!input.event_date) {
      return { error: 'Event date is required.' };
    }
    if (!input.start_time || !input.end_time) {
      return { error: 'Start time and end time are required.' };
    }

    const [sH, sM] = input.start_time.slice(0, 5).split(':').map(Number);
    const [eH, eM] = input.end_time.slice(0, 5).split(':').map(Number);
    if (eH * 60 + eM <= sH * 60 + sM) {
      return { error: 'End time must be later than start time.' };
    }

    // Check time slot availability
    const availability = await checkBanquetAvailability(
      staff.hotel_id,
      input.event_date,
      input.start_time,
      input.end_time
    );

    if (!availability.available && availability.conflictingBooking) {
      const cb = availability.conflictingBooking;
      return {
        error: `Time Slot Conflict! Banquet Hall is already booked for "${cb.event_name}" (${cb.start_time} - ${cb.end_time}) on ${input.event_date}.`,
      };
    }

    const hall = await getBanquetHall(staff.hotel_id);
    const supabase = createClient();
    const bookingId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const dateTag = input.event_date.replace(/-/g, '').slice(2);
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const bookingNumber = `HGV-BNQ-${dateTag}-${randomSuffix}`;
    const invoiceNumber = `HGV-BNQ-INV-${input.event_date.replace(/-/g, '')}-${randomSuffix}`;

    const rentalAmount = Number(input.rental_amount || hall.full_day_rate || 35000);
    const advancePaid = Number(input.advance_paid || 0);
    const taxTreatment = input.tax_treatment || 'gst';
    const taxRate = taxTreatment === 'gst' ? 18 : 0;

    // 1. Prepare Initial Charges
    const charges: BanquetCharge[] = [
      {
        id: crypto.randomUUID(),
        hotel_id: staff.hotel_id,
        banquet_booking_id: bookingId,
        category: 'hall_rental',
        description: `Hall Rental — ${hall.name} (${input.start_time} - ${input.end_time})`,
        sac_code: '996311',
        quantity: 1,
        unit_price: rentalAmount,
        discount: 0,
        tax_treatment: taxTreatment,
        tax_rate: taxRate,
        taxable_amount: rentalAmount,
        tax_amount: taxTreatment === 'gst' ? Math.round(rentalAmount * 0.18 * 100) / 100 : 0,
        total_amount: rentalAmount + (taxTreatment === 'gst' ? Math.round(rentalAmount * 0.18 * 100) / 100 : 0),
        notes: `Reserved for ${input.event_name}`,
        recorded_by: staff.id,
        created_at: nowIso,
        updated_at: nowIso,
      },
    ];

    if (input.initial_charges && input.initial_charges.length > 0) {
      for (const initC of input.initial_charges) {
        const taxable = Number(initC.quantity || 1) * Number(initC.unit_price || 0);
        const tax = taxTreatment === 'gst' ? Math.round(taxable * 0.18 * 100) / 100 : 0;
        charges.push({
          id: crypto.randomUUID(),
          hotel_id: staff.hotel_id,
          banquet_booking_id: bookingId,
          category: initC.category,
          description: initC.description,
          sac_code: initC.category === 'catering' || initC.category === 'food_beverage' ? '996331' : '996311',
          quantity: Number(initC.quantity || 1),
          unit_price: Number(initC.unit_price || 0),
          discount: 0,
          tax_treatment: taxTreatment,
          tax_rate: taxRate,
          taxable_amount: taxable,
          tax_amount: tax,
          total_amount: taxable + tax,
          notes: null,
          recorded_by: staff.id,
          created_at: nowIso,
          updated_at: nowIso,
        });
      }
    }

    // 2. Prepare Initial Payments
    const payments: BanquetPayment[] = [];
    if (advancePaid > 0) {
      payments.push({
        id: crypto.randomUUID(),
        hotel_id: staff.hotel_id,
        banquet_booking_id: bookingId,
        amount: advancePaid,
        payment_mode: input.payment_mode || 'upi',
        payment_type: 'advance',
        reference_number: input.payment_reference || `ADV-${bookingNumber}`,
        notes: 'Initial event booking advance deposit',
        recorded_by: staff.id,
        recorder_name: staff.full_name,
        created_at: nowIso,
      });
    }

    // 3. Compute Totals
    const folioTotals = calculateBanquetFolioTotals(charges, payments, rentalAmount, taxTreatment);

    const bookingRecord: BanquetBooking = {
      id: bookingId,
      hotel_id: staff.hotel_id,
      banquet_hall_id: hall.id,
      booking_number: bookingNumber,
      event_name: input.event_name.trim(),
      customer_name: input.customer_name.trim(),
      customer_phone: input.customer_phone.trim(),
      customer_email: input.customer_email?.trim() || null,
      customer_address: input.customer_address?.trim() || null,
      customer_gstin: input.customer_gstin?.trim() || null,
      payment_status: folioTotals.payment_status,
      invoice_number: invoiceNumber,
      invoice_date: input.event_date,
      event_date: input.event_date,
      start_time: input.start_time.slice(0, 5),
      end_time: input.end_time.slice(0, 5),
      guest_count: input.guest_count !== undefined && input.guest_count !== null ? Number(input.guest_count) : null,
      event_type: input.event_type || 'wedding',
      booking_status: input.booking_status || 'confirmed',
      rental_amount: rentalAmount,
      catering_required: Boolean(input.catering_required),
      catering_notes: input.catering_notes?.trim() || null,
      estimated_total: folioTotals.grand_total,
      advance_paid: advancePaid,
      subtotal: folioTotals.subtotal,
      tax_amount: folioTotals.tax_amount,
      grand_total: folioTotals.grand_total,
      total_paid: folioTotals.total_paid,
      balance_due: folioTotals.balance_due,
      tax_treatment: taxTreatment,
      remarks: input.remarks?.trim() || null,
      recorded_by: staff.id,
      recorder_name: staff.full_name,
      charges,
      payments,
      created_at: nowIso,
      updated_at: nowIso,
    };

    // 4. Persist to Postgres tables
    try {
      await (supabase.from('banquet_bookings') as any).insert({
        id: bookingRecord.id,
        hotel_id: bookingRecord.hotel_id,
        banquet_hall_id: bookingRecord.banquet_hall_id,
        booking_number: bookingRecord.booking_number,
        event_name: bookingRecord.event_name,
        customer_name: bookingRecord.customer_name,
        customer_phone: bookingRecord.customer_phone,
        customer_email: bookingRecord.customer_email,
        customer_address: bookingRecord.customer_address,
        customer_gstin: bookingRecord.customer_gstin,
        payment_status: bookingRecord.payment_status,
        invoice_number: bookingRecord.invoice_number,
        invoice_date: bookingRecord.invoice_date,
        event_date: bookingRecord.event_date,
        start_time: bookingRecord.start_time,
        end_time: bookingRecord.end_time,
        guest_count: bookingRecord.guest_count,
        event_type: bookingRecord.event_type,
        booking_status: bookingRecord.booking_status,
        rental_amount: bookingRecord.rental_amount,
        catering_required: bookingRecord.catering_required,
        catering_notes: bookingRecord.catering_notes,
        estimated_total: bookingRecord.estimated_total,
        advance_paid: bookingRecord.advance_paid,
        subtotal: bookingRecord.subtotal,
        tax_amount: bookingRecord.tax_amount,
        grand_total: bookingRecord.grand_total,
        total_paid: bookingRecord.total_paid,
        balance_due: bookingRecord.balance_due,
        tax_treatment: bookingRecord.tax_treatment,
        remarks: bookingRecord.remarks,
        recorded_by: bookingRecord.recorded_by,
        created_at: nowIso,
        updated_at: nowIso,
      });

      for (const ch of charges) {
        await (supabase.from('banquet_charges') as any).insert(ch);
      }

      for (const pm of payments) {
        await (supabase.from('banquet_payments') as any).insert({
          id: pm.id,
          hotel_id: staff.hotel_id,
          banquet_booking_id: bookingId,
          amount: pm.amount,
          payment_mode: pm.payment_mode,
          payment_type: pm.payment_type,
          reference_number: pm.reference_number,
          notes: pm.notes,
          recorded_by: staff.id,
          created_at: nowIso,
        });
      }
    } catch {
      // Fallback
    }

    // 5. Fallback update to settings
    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    const existingBookings: BanquetBooking[] = (hotelData?.settings?.banquet_bookings as BanquetBooking[]) || [];
    const existingCharges: BanquetCharge[] = (hotelData?.settings?.banquet_charges as BanquetCharge[]) || [];
    const existingPayments: BanquetPayment[] = (hotelData?.settings?.banquet_payments as BanquetPayment[]) || [];

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          banquet_bookings: [bookingRecord, ...existingBookings],
          banquet_charges: [...charges, ...existingCharges],
          banquet_payments: [...payments, ...existingPayments],
        },
      })
      .eq('id', staff.hotel_id);

    revalidatePath('/banquet');
    revalidatePath(`/banquet/${bookingId}`);
    return { success: true, booking: bookingRecord };
  } catch (err: any) {
    console.error('createBanquetBookingAction error:', err);
    return { error: `Failed to create banquet booking: ${err?.message || String(err)}` };
  }
}

/**
 * Add a new itemized charge to a Banquet Folio
 */
export async function addBanquetChargeAction(input: AddBanquetChargeInput): Promise<{
  success?: boolean;
  charge?: BanquetCharge;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return { error: 'Authentication required.' };

    if (!input.banquet_booking_id) return { error: 'Booking ID is required.' };
    if (!input.description || !input.description.trim()) return { error: 'Description is required.' };

    const qty = Number(input.quantity || 1);
    const unitPrice = Number(input.unit_price || 0);
    const discount = Number(input.discount || 0);
    const taxable = Math.max(0, qty * unitPrice - discount);
    const taxTreatment = input.tax_treatment || 'gst';
    const taxRate = taxTreatment === 'gst' ? Number(input.tax_rate ?? 18) : 0;
    const taxAmount = taxTreatment === 'gst' ? Math.round(((taxable * taxRate) / 100) * 100) / 100 : 0;
    const totalAmount = taxable + taxAmount;

    const sacCode = input.category === 'catering' || input.category === 'food_beverage' ? '996331' : '996311';
    const chargeId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const chargeRecord: BanquetCharge = {
      id: chargeId,
      hotel_id: staff.hotel_id,
      banquet_booking_id: input.banquet_booking_id,
      category: input.category,
      description: input.description.trim(),
      sac_code: sacCode,
      quantity: qty,
      unit_price: unitPrice,
      discount,
      tax_treatment: taxTreatment,
      tax_rate: taxRate,
      taxable_amount: taxable,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes: input.notes?.trim() || null,
      recorded_by: staff.id,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const supabase = createClient();

    // 1. Insert into DB
    try {
      await (supabase.from('banquet_charges') as any).insert(chargeRecord);
    } catch {
      // Fallback
    }

    // 2. Update hotel.settings
    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    const existingCharges: BanquetCharge[] = (hotelData?.settings?.banquet_charges as BanquetCharge[]) || [];
    const updatedCharges = [...existingCharges, chargeRecord];

    // Recalculate booking total
    const existingBookings: BanquetBooking[] = (hotelData?.settings?.banquet_bookings as BanquetBooking[]) || [];
    const targetBooking = existingBookings.find((b) => b.id === input.banquet_booking_id);
    const bookingPayments = ((hotelData?.settings?.banquet_payments as BanquetPayment[]) || []).filter(
      (p) => p.banquet_booking_id === input.banquet_booking_id
    );

    const bookingCharges = updatedCharges.filter((c) => c.banquet_booking_id === input.banquet_booking_id);
    const totals = calculateBanquetFolioTotals(bookingCharges, bookingPayments, targetBooking?.rental_amount || 0);

    const updatedBookings = existingBookings.map((b) =>
      b.id === input.banquet_booking_id
        ? {
            ...b,
            subtotal: totals.subtotal,
            tax_amount: totals.tax_amount,
            grand_total: totals.grand_total,
            balance_due: totals.balance_due,
            payment_status: totals.payment_status,
            updated_at: nowIso,
          }
        : b
    );

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          banquet_charges: updatedCharges,
          banquet_bookings: updatedBookings,
        },
      })
      .eq('id', staff.hotel_id);

    try {
      await (supabase.from('banquet_bookings') as any)
        .update({
          subtotal: totals.subtotal,
          tax_amount: totals.tax_amount,
          grand_total: totals.grand_total,
          balance_due: totals.balance_due,
          payment_status: totals.payment_status,
          updated_at: nowIso,
        })
        .eq('id', input.banquet_booking_id);
    } catch {
      // Fallback
    }

    revalidatePath('/banquet');
    revalidatePath(`/banquet/${input.banquet_booking_id}`);
    return { success: true, charge: chargeRecord };
  } catch (err: any) {
    console.error('addBanquetChargeAction error:', err);
    return { error: `Failed to add charge: ${err?.message || String(err)}` };
  }
}

/**
 * Delete a charge from a Banquet Folio
 */
export async function deleteBanquetChargeAction(
  chargeId: string,
  bookingId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return { error: 'Authentication required.' };

    const supabase = createClient();
    const nowIso = new Date().toISOString();

    try {
      await (supabase.from('banquet_charges') as any).delete().eq('id', chargeId);
    } catch {
      // Fallback
    }

    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    const existingCharges: BanquetCharge[] = (hotelData?.settings?.banquet_charges as BanquetCharge[]) || [];
    const updatedCharges = existingCharges.filter((c) => c.id !== chargeId);

    const existingBookings: BanquetBooking[] = (hotelData?.settings?.banquet_bookings as BanquetBooking[]) || [];
    const targetBooking = existingBookings.find((b) => b.id === bookingId);
    const bookingPayments = ((hotelData?.settings?.banquet_payments as BanquetPayment[]) || []).filter(
      (p) => p.banquet_booking_id === bookingId
    );

    const remainingBookingCharges = updatedCharges.filter((c) => c.banquet_booking_id === bookingId);
    const totals = calculateBanquetFolioTotals(
      remainingBookingCharges,
      bookingPayments,
      targetBooking?.rental_amount || 0
    );

    const updatedBookings = existingBookings.map((b) =>
      b.id === bookingId
        ? {
            ...b,
            subtotal: totals.subtotal,
            tax_amount: totals.tax_amount,
            grand_total: totals.grand_total,
            balance_due: totals.balance_due,
            payment_status: totals.payment_status,
            updated_at: nowIso,
          }
        : b
    );

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          banquet_charges: updatedCharges,
          banquet_bookings: updatedBookings,
        },
      })
      .eq('id', staff.hotel_id);

    try {
      await (supabase.from('banquet_bookings') as any)
        .update({
          subtotal: totals.subtotal,
          tax_amount: totals.tax_amount,
          grand_total: totals.grand_total,
          balance_due: totals.balance_due,
          payment_status: totals.payment_status,
          updated_at: nowIso,
        })
        .eq('id', bookingId);
    } catch {
      // Fallback
    }

    revalidatePath('/banquet');
    revalidatePath(`/banquet/${bookingId}`);
    return { success: true };
  } catch (err: any) {
    console.error('deleteBanquetChargeAction error:', err);
    return { error: `Failed to delete charge: ${err?.message || String(err)}` };
  }
}

/**
 * Record a payment against a Banquet Folio
 */
export async function recordBanquetPaymentAction(input: RecordBanquetPaymentInput): Promise<{
  success?: boolean;
  payment?: BanquetPayment;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return { error: 'Authentication required.' };

    const amount = Number(input.amount || 0);
    if (amount <= 0) return { error: 'Payment amount must be greater than zero.' };

    const paymentId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const paymentRecord: BanquetPayment = {
      id: paymentId,
      hotel_id: staff.hotel_id,
      banquet_booking_id: input.banquet_booking_id,
      amount,
      payment_mode: input.payment_mode,
      payment_type: input.payment_type || 'partial',
      reference_number: input.reference_number?.trim() || null,
      notes: input.notes?.trim() || null,
      recorded_by: staff.id,
      recorder_name: staff.full_name,
      created_at: nowIso,
    };

    const supabase = createClient();

    try {
      await (supabase.from('banquet_payments') as any).insert({
        id: paymentRecord.id,
        hotel_id: staff.hotel_id,
        banquet_booking_id: paymentRecord.banquet_booking_id,
        amount: paymentRecord.amount,
        payment_mode: paymentRecord.payment_mode,
        payment_type: paymentRecord.payment_type,
        reference_number: paymentRecord.reference_number,
        notes: paymentRecord.notes,
        recorded_by: staff.id,
        created_at: nowIso,
      });
    } catch {
      // Fallback
    }

    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    const existingPayments: BanquetPayment[] = (hotelData?.settings?.banquet_payments as BanquetPayment[]) || [];
    const updatedPayments = [...existingPayments, paymentRecord];

    const existingCharges: BanquetCharge[] = (hotelData?.settings?.banquet_charges as BanquetCharge[]) || [];
    const bookingCharges = existingCharges.filter((c) => c.banquet_booking_id === input.banquet_booking_id);

    const existingBookings: BanquetBooking[] = (hotelData?.settings?.banquet_bookings as BanquetBooking[]) || [];
    const targetBooking = existingBookings.find((b) => b.id === input.banquet_booking_id);

    const bookingPayments = updatedPayments.filter((p) => p.banquet_booking_id === input.banquet_booking_id);
    const totals = calculateBanquetFolioTotals(bookingCharges, bookingPayments, targetBooking?.rental_amount || 0);

    const updatedBookings = existingBookings.map((b) =>
      b.id === input.banquet_booking_id
        ? {
            ...b,
            total_paid: totals.total_paid,
            balance_due: totals.balance_due,
            payment_status: totals.payment_status,
            updated_at: nowIso,
          }
        : b
    );

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          banquet_payments: updatedPayments,
          banquet_bookings: updatedBookings,
        },
      })
      .eq('id', staff.hotel_id);

    try {
      await (supabase.from('banquet_bookings') as any)
        .update({
          total_paid: totals.total_paid,
          balance_due: totals.balance_due,
          payment_status: totals.payment_status,
          updated_at: nowIso,
        })
        .eq('id', input.banquet_booking_id);
    } catch {
      // Fallback
    }

    revalidatePath('/banquet');
    revalidatePath(`/banquet/${input.banquet_booking_id}`);
    return { success: true, payment: paymentRecord };
  } catch (err: any) {
    console.error('recordBanquetPaymentAction error:', err);
    return { error: `Failed to record payment: ${err?.message || String(err)}` };
  }
}

/**
 * Update event booking status
 */
export async function updateBanquetBookingStatusAction(
  input: UpdateBanquetBookingStatusInput
): Promise<{ success?: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager' && staff.role !== 'reception') {
      return { error: 'Access denied: You do not have permission to update event status.' };
    }

    const supabase = createClient();
    const nowIso = new Date().toISOString();

    try {
      await (supabase.from('banquet_bookings') as any)
        .update({
          booking_status: input.booking_status,
          updated_at: nowIso,
        })
        .eq('id', input.booking_id)
        .eq('hotel_id', staff.hotel_id);
    } catch {
      // Fallback
    }

    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    const existingBookings: BanquetBooking[] = (hotelData?.settings?.banquet_bookings as BanquetBooking[]) || [];
    const updatedBookings = existingBookings.map((b) =>
      b.id === input.booking_id ? { ...b, booking_status: input.booking_status, updated_at: nowIso } : b
    );

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          banquet_bookings: updatedBookings,
        },
      })
      .eq('id', staff.hotel_id);

    revalidatePath('/banquet');
    revalidatePath(`/banquet/${input.booking_id}`);
    return { success: true };
  } catch (err: any) {
    console.error('updateBanquetBookingStatusAction error:', err);
    return { error: `Failed to update booking status: ${err?.message || String(err)}` };
  }
}
