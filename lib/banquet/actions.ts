'use server';

import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { revalidatePath } from 'next/cache';
import {
  SaveBanquetHallInput,
  CreateBanquetBookingInput,
  UpdateBanquetBookingStatusInput,
  BanquetHall,
  BanquetBooking,
} from './types';
import { getBanquetHall, checkBanquetAvailability } from './queries';

/**
 * Save or update Banquet Hall Resource configuration
 * Restricted exclusively to Owner and Manager
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

    const capacity = input.capacity !== undefined && input.capacity !== null && !isNaN(Number(input.capacity))
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
      capacity: capacity,
      current_status: input.current_status || 'available',
      description: input.description?.trim() || null,
      half_day_rate: halfDay,
      full_day_rate: fullDay,
      amenities: input.amenities || existingHall.amenities || [],
      notes: input.notes?.trim() || null,
      is_active: true,
      updated_at: nowIso,
    };

    // 1. Try public.banquet_halls table
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

    // 2. Fallback to hotel.settings.banquet_hall
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
 * Validates time slot availability (prevents double bookings)
 * Compatible with future billing & payments
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
      return { error: 'Event name is required (e.g. Wedding Reception, Corporate Summit).' };
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

    // Validate time sequence
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

    const rentalAmount = Number(input.rental_amount || hall.full_day_rate || 0);
    const estimatedTotal = Number(input.estimated_total || rentalAmount);
    const advancePaid = Number(input.advance_paid || 0);

    const bookingRecord: BanquetBooking = {
      id: bookingId,
      hotel_id: staff.hotel_id,
      banquet_hall_id: hall.id,
      booking_number: bookingNumber,
      event_name: input.event_name.trim(),
      customer_name: input.customer_name.trim(),
      customer_phone: input.customer_phone.trim(),
      customer_email: input.customer_email?.trim() || null,
      event_date: input.event_date,
      start_time: input.start_time.slice(0, 5),
      end_time: input.end_time.slice(0, 5),
      guest_count: input.guest_count !== undefined && input.guest_count !== null ? Number(input.guest_count) : null,
      event_type: input.event_type || 'wedding',
      booking_status: input.booking_status || 'confirmed',
      rental_amount: rentalAmount,
      catering_required: Boolean(input.catering_required),
      catering_notes: input.catering_notes?.trim() || null,
      estimated_total: estimatedTotal,
      advance_paid: advancePaid,
      tax_treatment: input.tax_treatment || 'gst',
      remarks: input.remarks?.trim() || null,
      recorded_by: staff.id,
      recorder_name: staff.full_name,
      created_at: nowIso,
      updated_at: nowIso,
    };

    // 1. Try public.banquet_bookings table
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
        tax_treatment: bookingRecord.tax_treatment,
        remarks: bookingRecord.remarks,
        recorded_by: bookingRecord.recorded_by,
        created_at: nowIso,
        updated_at: nowIso,
      });
    } catch {
      // Fallback
    }

    // 2. Fallback to hotel.settings.banquet_bookings
    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    const existingBookings: BanquetBooking[] =
      (hotelData?.settings?.banquet_bookings as BanquetBooking[]) || [];
    const updatedBookings = [bookingRecord, ...existingBookings];

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          banquet_bookings: updatedBookings,
        },
      })
      .eq('id', staff.hotel_id);

    revalidatePath('/banquet');
    return { success: true, booking: bookingRecord };
  } catch (err: any) {
    console.error('createBanquetBookingAction error:', err);
    return { error: `Failed to create banquet booking: ${err?.message || String(err)}` };
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

    // 1. Try public.banquet_bookings
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

    // 2. Fallback to hotel.settings
    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    const existingBookings: BanquetBooking[] =
      (hotelData?.settings?.banquet_bookings as BanquetBooking[]) || [];
    const updatedBookings = existingBookings.map((b) =>
      b.id === input.booking_id
        ? { ...b, booking_status: input.booking_status, updated_at: nowIso }
        : b
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
    return { success: true };
  } catch (err: any) {
    console.error('updateBanquetBookingStatusAction error:', err);
    return { error: `Failed to update booking status: ${err?.message || String(err)}` };
  }
}
