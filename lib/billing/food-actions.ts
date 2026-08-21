'use server';

import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { getHotelSettings } from '../hotels/queries';
import { getMenuItems, getMenuCategories } from '../menu/queries';
import { FoodServiceType, TaxTreatment } from '../types/database.types';
import { revalidatePath } from 'next/cache';

export interface FoodChargeRecord {
  id: string;
  hotel_id: string;
  booking_id: string;
  room_id: string | null;
  guest_id: string | null;
  menu_item_id: string | null;
  item_name_snapshot: string;
  category_snapshot: string;
  service_type: FoodServiceType;
  quantity: number;
  unit_price_snapshot: number;
  tax_treatment: TaxTreatment;
  taxable_amount: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  remarks: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at?: string;
}

export interface AddFoodChargeInput {
  booking_id: string;
  menu_item_id: string;
  service_type: FoodServiceType;
  quantity: number;
  tax_treatment: TaxTreatment;
  remarks?: string | null;
  created_at?: string;
}

export interface MultipleFoodChargeItemInput {
  menu_item_id: string;
  quantity: number;
}

export interface AddMultipleFoodChargesInput {
  booking_id: string;
  service_type: FoodServiceType;
  items: MultipleFoodChargeItemInput[];
  tax_treatment: TaxTreatment;
  remarks?: string | null;
  created_at?: string;
}

/**
 * Fetch all food charges for a hotel or all active bookings
 */
export async function getAllFoodCharges(hotelId?: string): Promise<FoodChargeRecord[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const supabase = createClient();

    // 1. Try public.food_charges
    try {
      let q = supabase.from('food_charges').select('*').order('created_at', { ascending: false });
      if (activeHotelId) {
        q = q.eq('hotel_id', activeHotelId);
      }
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return (data as any[]).map((r) => ({
          ...r,
          quantity: Number(r.quantity),
          unit_price_snapshot: Number(r.unit_price_snapshot),
          taxable_amount: Number(r.taxable_amount),
          gst_rate: Number(r.gst_rate || 0),
          gst_amount: Number(r.gst_amount || 0),
          total_amount: Number(r.total_amount),
        }));
      }
    } catch {
      // Fallback
    }

    // 2. Fallback to hotel.settings
    const targetHotelId = activeHotelId || 'a0000000-0000-0000-0000-000000000001';
    const { data: hotel } = await (supabase.from('hotels') as any)
      .select('settings')
      .eq('id', targetHotelId)
      .maybeSingle();

    const storedCharges: FoodChargeRecord[] = (hotel?.settings?.food_charges as FoodChargeRecord[]) || [];
    return storedCharges.map((c) => ({
      ...c,
      quantity: Number(c.quantity),
      unit_price_snapshot: Number(c.unit_price_snapshot),
      taxable_amount: Number(c.taxable_amount),
      gst_rate: Number(c.gst_rate || 0),
      gst_amount: Number(c.gst_amount || 0),
      total_amount: Number(c.total_amount),
    }));
  } catch (err) {
    console.error('Error fetching all food charges:', err);
    return [];
  }
}

/**
 * Fetch all food charges associated with a specific booking
 */
export async function getFoodCharges(bookingId: string): Promise<FoodChargeRecord[]> {
  try {
    const staff = await getCurrentStaff();
    const supabase = createClient();

    // 1. Try public.food_charges table
    try {
      let q = supabase
        .from('food_charges')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (staff?.hotel_id) {
        q = q.eq('hotel_id', staff.hotel_id);
      }

      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return (data as any[]).map((r) => ({
          ...r,
          quantity: Number(r.quantity),
          unit_price_snapshot: Number(r.unit_price_snapshot),
          taxable_amount: Number(r.taxable_amount),
          gst_rate: Number(r.gst_rate || 0),
          gst_amount: Number(r.gst_amount || 0),
          total_amount: Number(r.total_amount),
        }));
      }
    } catch {
      // Table fallback
    }

    // 2. Fallback to hotel.settings.food_charges
    const hotelId = staff?.hotel_id || 'a0000000-0000-0000-0000-000000000001';
    const { data: hotel } = await (supabase.from('hotels') as any)
      .select('settings')
      .eq('id', hotelId)
      .maybeSingle();

    const storedCharges: FoodChargeRecord[] = (hotel?.settings?.food_charges as FoodChargeRecord[]) || [];
    return storedCharges
      .filter((c) => c.booking_id === bookingId)
      .map((c) => ({
        ...c,
        quantity: Number(c.quantity),
        unit_price_snapshot: Number(c.unit_price_snapshot),
        taxable_amount: Number(c.taxable_amount),
        gst_rate: Number(c.gst_rate || 0),
        gst_amount: Number(c.gst_amount || 0),
        total_amount: Number(c.total_amount),
      }));
  } catch (err) {
    console.error(`Error fetching food charges for booking ${bookingId}:`, err);
    return [];
  }
}

/**
 * Add a Food & Beverage charge to a room booking folio
 * Strictly checks staff permissions, booking state, and captures immutable price snapshots.
 */
export async function addFoodChargeAction(input: AddFoodChargeInput): Promise<{
  success?: boolean;
  charge?: FoodChargeRecord;
  error?: string;
}> {
  try {
    // 1. Authentication & Role Validation
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (!staff.is_active) {
      return { error: 'Your staff account is inactive. Please contact the administrator.' };
    }

    if (staff.role === 'housekeeping') {
      return { error: 'Housekeeping staff cannot add food or billing charges.' };
    }

    // 2. Validate input
    if (!input.booking_id) {
      return { error: 'Booking ID is required.' };
    }

    const qty = Number(input.quantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      return { error: 'Quantity must be a positive whole number (1, 2, 3...).' };
    }

    const validServices: FoodServiceType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Other'];
    if (!validServices.includes(input.service_type)) {
      return { error: 'Invalid service type selected.' };
    }

    const taxTreatment: TaxTreatment = input.tax_treatment === 'non_gst' ? 'non_gst' : 'gst';

    const supabase = createClient();

    // 3. Verify target booking belongs to current hotel and is eligible for charges
    const { data: booking, error: bookingErr } = (await supabase
      .from('bookings')
      .select('id, hotel_id, room_id, guest_id, booking_status, booking_number')
      .eq('id', input.booking_id)
      .eq('hotel_id', staff.hotel_id)
      .maybeSingle()) as { data: any; error: any };

    if (bookingErr || !booking) {
      return { error: 'Target room booking was not found in your hotel.' };
    }

    if (booking.booking_status === 'cancelled') {
      return { error: 'Cannot add food charges to a cancelled reservation.' };
    }

    if (booking.booking_status === 'checked_out') {
      return { error: 'Cannot add food charges to a booking that is already checked out and finalized.' };
    }

    // 4. Fetch authoritative menu item from catalog (DO NOT trust client-supplied price)
    const menuItems = await getMenuItems(staff.hotel_id);
    const item = menuItems.find((m) => m.id === input.menu_item_id);

    if (!item) {
      return { error: 'Selected food item does not exist in the active menu catalog.' };
    }

    const unitPriceSnapshot = Number(item.selling_price);
    const itemNameSnapshot = item.name;

    // Resolve category name snapshot
    const categories = await getMenuCategories(staff.hotel_id);
    const category = categories.find((c) => c.id === item.category_id);
    const categorySnapshot = category?.name || input.service_type || 'Food & Beverage';

    // 5. Authoritative financial arithmetic
    const taxableAmount = Math.round(qty * unitPriceSnapshot * 100) / 100;
    const settings = await getHotelSettings(staff.hotel_id);
    const effectiveGstRate = Number(settings.gst_percentage ?? settings.gst_rate ?? 12);

    let gstRate = 0;
    let gstAmount = 0;
    let totalAmount = taxableAmount;

    if (taxTreatment === 'gst') {
      gstRate = effectiveGstRate;
      gstAmount = Math.round(((taxableAmount * gstRate) / 100) * 100) / 100;
      totalAmount = Math.round((taxableAmount + gstAmount) * 100) / 100;
    }

    const chargeId = crypto.randomUUID();
    const nowIso = input.created_at || new Date().toISOString();

    const chargeRecord: FoodChargeRecord = {
      id: chargeId,
      hotel_id: staff.hotel_id,
      booking_id: input.booking_id,
      room_id: booking.room_id || null,
      guest_id: booking.guest_id || null,
      menu_item_id: item.id || null,
      item_name_snapshot: itemNameSnapshot,
      category_snapshot: categorySnapshot,
      service_type: input.service_type,
      quantity: qty,
      unit_price_snapshot: unitPriceSnapshot,
      tax_treatment: taxTreatment,
      taxable_amount: taxableAmount,
      gst_rate: gstRate,
      gst_amount: gstAmount,
      total_amount: totalAmount,
      remarks: input.remarks?.trim() || null,
      recorded_by: staff.id,
      created_at: nowIso,
      updated_at: nowIso,
    };

    // 6. Persist to public.food_charges table with fallback
    let persisted = false;
    try {
      const { error: insertErr } = await (supabase.from('food_charges') as any).insert({
        id: chargeRecord.id,
        hotel_id: chargeRecord.hotel_id,
        booking_id: chargeRecord.booking_id,
        room_id: chargeRecord.room_id,
        guest_id: chargeRecord.guest_id,
        menu_item_id: chargeRecord.menu_item_id,
        item_name_snapshot: chargeRecord.item_name_snapshot,
        category_snapshot: chargeRecord.category_snapshot,
        service_type: chargeRecord.service_type,
        quantity: chargeRecord.quantity,
        unit_price_snapshot: chargeRecord.unit_price_snapshot,
        tax_treatment: chargeRecord.tax_treatment,
        taxable_amount: chargeRecord.taxable_amount,
        gst_rate: chargeRecord.gst_rate,
        gst_amount: chargeRecord.gst_amount,
        total_amount: chargeRecord.total_amount,
        remarks: chargeRecord.remarks,
        recorded_by: chargeRecord.recorded_by,
        created_at: chargeRecord.created_at,
        updated_at: chargeRecord.updated_at,
      });

      if (!insertErr) {
        persisted = true;
      }
    } catch {
      // Table fallback
    }

    // Fallback store in hotel.settings
    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    const existingCharges: FoodChargeRecord[] = (hotelData?.settings?.food_charges as FoodChargeRecord[]) || [];
    const updatedCharges = [...existingCharges, chargeRecord];

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          food_charges: updatedCharges,
        },
      })
      .eq('id', staff.hotel_id);

    revalidatePath(`/billing/${input.booking_id}`);
    revalidatePath('/billing');
    revalidatePath('/dashboard');
    revalidatePath('/bookings');

    return { success: true, charge: chargeRecord };
  } catch (err: any) {
    console.error('addFoodChargeAction error:', err);
    return { error: `Failed to add food charge: ${err?.message || String(err)}` };
  }
}

/**
 * Add Multiple Food & Beverage items in a single billing session to a guest folio
 */
export async function addMultipleFoodChargesAction(input: AddMultipleFoodChargesInput): Promise<{
  success?: boolean;
  charges?: FoodChargeRecord[];
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (!staff.is_active) {
      return { error: 'Your staff account is inactive. Please contact the administrator.' };
    }

    if (staff.role === 'housekeeping') {
      return { error: 'Housekeeping staff cannot add food or billing charges.' };
    }

    if (!input.booking_id) {
      return { error: 'Booking ID is required.' };
    }

    if (!input.items || input.items.length === 0) {
      return { error: 'At least one food item must be selected.' };
    }

    const supabase = createClient();

    // Verify target booking
    const { data: booking, error: bookingErr } = (await supabase
      .from('bookings')
      .select('id, hotel_id, room_id, guest_id, booking_status, booking_number')
      .eq('id', input.booking_id)
      .eq('hotel_id', staff.hotel_id)
      .maybeSingle()) as { data: any; error: any };

    if (bookingErr || !booking) {
      return { error: 'Target room booking was not found in your hotel.' };
    }

    if (booking.booking_status === 'cancelled') {
      return { error: 'Cannot add food charges to a cancelled reservation.' };
    }

    if (booking.booking_status === 'checked_out') {
      return { error: 'Cannot add food charges to a booking that is already checked out and finalized.' };
    }

    const menuItems = await getMenuItems(staff.hotel_id);
    const categories = await getMenuCategories(staff.hotel_id);
    const settings = await getHotelSettings(staff.hotel_id);
    const effectiveGstRate = Number(settings.gst_percentage ?? settings.gst_rate ?? 12);
    const taxTreatment: TaxTreatment = input.tax_treatment === 'non_gst' ? 'non_gst' : 'gst';
    const nowIso = input.created_at || new Date().toISOString();

    const createdCharges: FoodChargeRecord[] = [];

    for (const orderItem of input.items) {
      const qty = Number(orderItem.quantity);
      if (isNaN(qty) || qty <= 0) continue;

      const item = menuItems.find((m) => m.id === orderItem.menu_item_id);
      if (!item) continue;

      const unitPriceSnapshot = Number(item.selling_price);
      const itemNameSnapshot = item.name;
      const category = categories.find((c) => c.id === item.category_id);
      const categorySnapshot = category?.name || input.service_type || 'Food & Beverage';

      const taxableAmount = Math.round(qty * unitPriceSnapshot * 100) / 100;
      let gstRate = 0;
      let gstAmount = 0;
      let totalAmount = taxableAmount;

      if (taxTreatment === 'gst') {
        gstRate = effectiveGstRate;
        gstAmount = Math.round(((taxableAmount * gstRate) / 100) * 100) / 100;
        totalAmount = Math.round((taxableAmount + gstAmount) * 100) / 100;
      }

      const chargeId = crypto.randomUUID();
      const chargeRecord: FoodChargeRecord = {
        id: chargeId,
        hotel_id: staff.hotel_id,
        booking_id: input.booking_id,
        room_id: booking.room_id || null,
        guest_id: booking.guest_id || null,
        menu_item_id: item.id || null,
        item_name_snapshot: itemNameSnapshot,
        category_snapshot: categorySnapshot,
        service_type: input.service_type,
        quantity: qty,
        unit_price_snapshot: unitPriceSnapshot,
        tax_treatment: taxTreatment,
        taxable_amount: taxableAmount,
        gst_rate: gstRate,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        remarks: input.remarks?.trim() || null,
        recorded_by: staff.id,
        created_at: nowIso,
        updated_at: nowIso,
      };

      createdCharges.push(chargeRecord);
    }

    if (createdCharges.length === 0) {
      return { error: 'No valid items could be added to the folio.' };
    }

    // 1. Try public.food_charges table
    try {
      await (supabase.from('food_charges') as any).insert(createdCharges);
    } catch {
      // Table fallback
    }

    // 2. Fallback store in hotel.settings
    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    const existingCharges: FoodChargeRecord[] = (hotelData?.settings?.food_charges as FoodChargeRecord[]) || [];
    const updatedCharges = [...existingCharges, ...createdCharges];

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          food_charges: updatedCharges,
        },
      })
      .eq('id', staff.hotel_id);

    revalidatePath(`/billing/${input.booking_id}`);
    revalidatePath('/billing');
    revalidatePath('/dashboard');
    revalidatePath('/bookings');

    return { success: true, charges: createdCharges };
  } catch (err: any) {
    console.error('addMultipleFoodChargesAction error:', err);
    return { error: `Failed to add food charges: ${err?.message || String(err)}` };
  }
}

/**
 * Remove an mistakenly added food charge before check-out/invoice finalization
 */
export async function deleteFoodChargeAction(
  chargeId: string,
  bookingId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (staff.role === 'housekeeping') {
      return { error: 'Housekeeping staff cannot modify billing charges.' };
    }

    const supabase = createClient();

    // Verify booking status
    const { data: booking } = (await supabase
      .from('bookings')
      .select('booking_status')
      .eq('id', bookingId)
      .eq('hotel_id', staff.hotel_id)
      .maybeSingle()) as { data: any };

    if (booking?.booking_status === 'checked_out') {
      return { error: 'Cannot delete charges from a finalized/checked-out booking.' };
    }

    // 1. Delete from public.food_charges
    try {
      await (supabase.from('food_charges') as any)
        .delete()
        .eq('id', chargeId)
        .eq('hotel_id', staff.hotel_id);
    } catch {
      // Ignore
    }

    // 2. Delete from hotel.settings.food_charges
    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', staff.hotel_id)
      .single();

    const existingCharges: FoodChargeRecord[] = (hotelData?.settings?.food_charges as FoodChargeRecord[]) || [];
    const updatedCharges = existingCharges.filter((c) => c.id !== chargeId);

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          food_charges: updatedCharges,
        },
      })
      .eq('id', staff.hotel_id);

    revalidatePath(`/billing/${bookingId}`);
    revalidatePath('/billing');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (err: any) {
    console.error('deleteFoodChargeAction error:', err);
    return { error: `Failed to remove food charge: ${err?.message || String(err)}` };
  }
}
