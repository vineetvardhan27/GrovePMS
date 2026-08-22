'use server';

import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { getHotelSettings } from '../hotels/queries';
import { getMenuItems, getMenuCategories } from '../menu/queries';
import {
  CreateFBBillInput,
  FBBillRecord,
  FBOrderRecord,
  FBOrderItemRecord,
  FBPaymentRecord,
  FBAuditLogRecord,
  FBMenuItem,
} from './types';
import {
  FoodServiceType,
  FBOrderStatus,
  PaymentMode,
  PaymentType,
  TaxTreatment,
} from '../types/database.types';
import { revalidatePath } from 'next/cache';

/**
 * Generate a sequential or deterministic bill number
 * Format: HGV-FB-YYYYMM-XXXX
 */
function generateBillNumber(): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `HGV-FB-${yearMonth}-${suffix}`;
}

/**
 * Server Action: Create a complete F&B bill
 * Supports both Room Guest (charge to room or pay now) and Walk-in Customer
 * Supports multiple meal types in a single bill session
 */
export async function createFBBillAction(input: CreateFBBillInput): Promise<{
  success?: boolean;
  bill?: FBBillRecord;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please sign in.' };
    }

    if (!staff.is_active) {
      return { error: 'Your staff profile is inactive.' };
    }

    if (staff.role === 'housekeeping') {
      return { error: 'Housekeeping staff cannot create financial billing records.' };
    }

    if (!input.items || input.items.length === 0) {
      return { error: 'Please add at least one food item to the bill.' };
    }

    const supabase = createClient();
    const hotelId = staff.hotel_id;
    const settings = await getHotelSettings(hotelId);
    const effectiveGstRate = Number(settings.gst_percentage ?? settings.gst_rate ?? 5);

    // 1. Resolve Customer & Booking Details
    let bookingNumberSnapshot: string | null = null;
    let roomNumberSnapshot: string | null = null;
    let guestId: string | null = input.guest_id || null;
    let roomId: string | null = input.room_id || null;
    let customerName = input.customer_name?.trim() || 'Walk-in Guest';
    let customerPhone = input.customer_phone?.trim() || null;

    if (input.customer_type === 'room_guest' && input.booking_id) {
      const { data: booking, error: bErr } = (await supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          booking_status,
          room_id,
          guest_id,
          room:room_id (room_number),
          guest:guest_id (full_name, phone)
        `)
        .eq('id', input.booking_id)
        .eq('hotel_id', hotelId)
        .maybeSingle()) as { data: any; error: any };

      if (bErr || !booking) {
        return { error: 'Selected room booking was not found.' };
      }

      if (booking.booking_status === 'cancelled') {
        return { error: 'Cannot bill to a cancelled room reservation.' };
      }

      if (booking.booking_status === 'checked_out' && input.billing_mode === 'charge_to_room') {
        return { error: 'Cannot post room charges to a booking that has already checked out.' };
      }

      bookingNumberSnapshot = booking.booking_number;
      roomNumberSnapshot = booking.room?.room_number || null;
      roomId = booking.room_id || null;
      guestId = booking.guest_id || null;
      if (!customerName || customerName === 'Walk-in Guest') {
        customerName = booking.guest?.full_name || 'Room Guest';
      }
      if (!customerPhone) {
        customerPhone = booking.guest?.phone || null;
      }
    }

    // 2. Fetch authoritative menu items
    const menuCatalog = await getMenuItems(hotelId, true);
    const categoryCatalog = await getMenuCategories(hotelId);
    const catMap = new Map(categoryCatalog.map((c) => [c.id, c.name]));

    const billId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const billNumber = generateBillNumber();

    // 3. Group items by meal type to create orders
    const mealGroups = new Map<FoodServiceType, typeof input.items>();
    for (const item of input.items) {
      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) continue;

      const mType = item.meal_type || 'Breakfast';
      const existing = mealGroups.get(mType) || [];
      existing.push(item);
      mealGroups.set(mType, existing);
    }

    if (mealGroups.size === 0) {
      return { error: 'No valid food items provided.' };
    }

    const createdOrders: FBOrderRecord[] = [];
    const createdOrderItems: FBOrderItemRecord[] = [];
    const folioFoodChargeInserts: any[] = [];

    let rawSubtotal = 0;
    let orderSeq = 1;

    for (const [mealType, itemsInMeal] of Array.from(mealGroups.entries())) {
      const orderId = crypto.randomUUID();
      const orderNumber = `ORD-${Date.now().toString().slice(-4)}-${orderSeq++}`;

      const orderRecord: FBOrderRecord = {
        id: orderId,
        bill_id: billId,
        hotel_id: hotelId,
        order_number: orderNumber,
        meal_type: mealType,
        status: input.billing_mode === 'charge_to_room' || input.payments?.length ? 'completed' : 'confirmed',
        special_instructions: input.special_instructions?.trim() || null,
        order_time: nowIso,
        items: [],
        created_at: nowIso,
        updated_at: nowIso,
      };

      for (const itemInput of itemsInMeal) {
        const qty = Math.max(1, Math.round(Number(itemInput.quantity)));
        // Find matching item in catalog
        const catalogItem = menuCatalog.find((m) => m.id === itemInput.menu_item_id) ||
          menuCatalog.find((m) => m.name.toLowerCase() === itemInput.item_name.toLowerCase());

        const unitPrice = catalogItem ? Number(catalogItem.selling_price) : Number(itemInput.unit_price || 0);
        const itemName = catalogItem ? catalogItem.name : itemInput.item_name;
        const categoryName = catalogItem
          ? (catMap.get(catalogItem.category_id) || mealType)
          : (itemInput.category_name || mealType);

        const gstRate = itemInput.tax_treatment === 'non_gst' ? 0 : effectiveGstRate;
        const lineGross = Math.round(qty * unitPrice * 100) / 100;
        rawSubtotal += lineGross;

        // Base price calculation (tax-exclusive component)
        const basePrice = gstRate > 0
          ? Math.round((unitPrice / (1 + gstRate / 100)) * 100) / 100
          : unitPrice;

        const taxableAmount = gstRate > 0
          ? Math.round((lineGross / (1 + gstRate / 100)) * 100) / 100
          : lineGross;

        const gstAmount = Math.round((lineGross - taxableAmount) * 100) / 100;

        const orderItemId = crypto.randomUUID();
        const orderItemRecord: FBOrderItemRecord = {
          id: orderItemId,
          order_id: orderId,
          bill_id: billId,
          hotel_id: hotelId,
          menu_item_id: catalogItem?.id || null,
          item_name_snapshot: itemName,
          category_snapshot: categoryName,
          meal_type: mealType,
          food_type: itemInput.food_type || (catalogItem as any)?.food_type || 'veg',
          quantity: qty,
          unit_price_snapshot: unitPrice,
          base_price_snapshot: basePrice,
          tax_treatment: itemInput.tax_treatment || 'gst',
          gst_rate: gstRate,
          taxable_amount: taxableAmount,
          gst_amount: gstAmount,
          total_amount: lineGross,
          notes: itemInput.notes?.trim() || null,
          status: 'active',
          created_at: nowIso,
          updated_at: nowIso,
        };

        createdOrderItems.push(orderItemRecord);
        orderRecord.items?.push(orderItemRecord);

        // Prepare line item for food_charges table if charging to room
        if (input.billing_mode === 'charge_to_room' && input.booking_id) {
          folioFoodChargeInserts.push({
            id: crypto.randomUUID(),
            hotel_id: hotelId,
            booking_id: input.booking_id,
            room_id: roomId,
            guest_id: guestId,
            menu_item_id: catalogItem?.id || null,
            item_name_snapshot: itemName,
            category_snapshot: categoryName,
            service_type: (['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Other'].includes(mealType)
              ? mealType
              : 'Other') as FoodServiceType,
            quantity: qty,
            unit_price_snapshot: unitPrice,
            tax_treatment: itemInput.tax_treatment || 'gst',
            taxable_amount: taxableAmount,
            gst_rate: gstRate,
            gst_amount: gstAmount,
            total_amount: lineGross,
            remarks: `[F&B Bill #${billNumber}] ${itemInput.notes || ''}`.trim(),
            recorded_by: staff.id,
            created_at: nowIso,
            updated_at: nowIso,
          });
        }
      }

      createdOrders.push(orderRecord);
    }

    // 4. Financial Arithmetic: Subtotal, Discounts, GST, Grand Total
    const subtotal = Math.round(rawSubtotal * 100) / 100;
    let discountAmount = 0;
    const discountType = input.discount_type || 'none';
    const discountValue = Number(input.discount_value || 0);

    if (discountType === 'percentage' && discountValue > 0) {
      discountAmount = Math.round(((subtotal * Math.min(100, discountValue)) / 100) * 100) / 100;
    } else if (discountType === 'fixed' && discountValue > 0) {
      discountAmount = Math.min(subtotal, Math.round(discountValue * 100) / 100);
    }

    const netTaxable = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);
    const totalGstAmount = effectiveGstRate > 0
      ? Math.round(((netTaxable * effectiveGstRate) / 100) * 100) / 100
      : 0;

    const cgstAmount = Math.round((totalGstAmount / 2) * 100) / 100;
    const sgstAmount = Math.round((totalGstAmount - cgstAmount) * 100) / 100;
    const grandTotal = Math.round((netTaxable + totalGstAmount) * 100) / 100;

    // 5. Payment Processing
    const createdPayments: FBPaymentRecord[] = [];
    let totalPaid = 0;

    if (input.billing_mode === 'charge_to_room') {
      // Room folio will handle payment at guest checkout
      totalPaid = 0;
    } else if (input.payments && input.payments.length > 0) {
      for (const p of input.payments) {
        const pAmt = Math.round(Number(p.amount) * 100) / 100;
        if (pAmt > 0) {
          totalPaid += pAmt;
          createdPayments.push({
            id: crypto.randomUUID(),
            bill_id: billId,
            hotel_id: hotelId,
            amount: pAmt,
            payment_mode: p.payment_mode || 'cash',
            payment_type: p.payment_type || 'settlement',
            reference_number: p.reference_number?.trim() || null,
            notes: p.notes?.trim() || null,
            recorded_by: staff.id,
            recorder_name: staff.full_name,
            created_at: nowIso,
          });
        }
      }
    }

    totalPaid = Math.round(totalPaid * 100) / 100;
    const balanceDue = input.billing_mode === 'charge_to_room'
      ? 0
      : Math.max(0, Math.round((grandTotal - totalPaid) * 100) / 100);

    let paymentStatus: 'unpaid' | 'partially_paid' | 'paid' | 'charged_to_room' = 'unpaid';
    if (input.billing_mode === 'charge_to_room') {
      paymentStatus = 'charged_to_room';
    } else if (totalPaid >= grandTotal) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partially_paid';
    }

    // Invoice Details
    const invoiceDate = nowIso.split('T')[0];
    const dateCompact = invoiceDate.replace(/-/g, '');
    const invoiceNumber = `HGV-FB-INV-${dateCompact}-${billNumber.slice(-4)}`;

    // 6. Master Bill Record
    const billRecord: FBBillRecord = {
      id: billId,
      hotel_id: hotelId,
      bill_number: billNumber,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      customer_type: input.customer_type,

      booking_id: input.booking_id || null,
      room_id: roomId,
      guest_id: guestId,
      customer_name: customerName,
      customer_phone: customerPhone,
      table_number: input.table_number?.trim() || null,
      room_number_snapshot: roomNumberSnapshot,
      booking_number_snapshot: bookingNumberSnapshot,

      billing_mode: input.billing_mode,
      bill_status: 'completed',
      payment_status: paymentStatus,

      discount_type: discountType,
      discount_value: discountValue,
      discount_amount: discountAmount,
      discount_reason: input.discount_reason?.trim() || null,
      discount_authorized_by: discountAmount > 0 ? staff.id : null,

      subtotal: subtotal,
      taxable_amount: netTaxable,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      gst_amount: totalGstAmount,
      grand_total: grandTotal,
      total_paid: totalPaid,
      balance_due: balanceDue,

      special_instructions: input.special_instructions?.trim() || null,
      remarks: input.remarks?.trim() || null,
      recorded_by: staff.id,
      recorder_name: staff.full_name,
      created_at: nowIso,
      updated_at: nowIso,

      orders: createdOrders,
      items: createdOrderItems,
      payments: createdPayments,
    };

    // 7. Audit log
    const auditRecord: FBAuditLogRecord = {
      id: crypto.randomUUID(),
      hotel_id: hotelId,
      bill_id: billId,
      action: 'created',
      user_id: staff.id,
      user_name: staff.full_name,
      details: {
        bill_number: billNumber,
        customer_name: customerName,
        customer_type: input.customer_type,
        billing_mode: input.billing_mode,
        grand_total: grandTotal,
        payment_status: paymentStatus,
        items_count: createdOrderItems.length,
      },
      created_at: nowIso,
    };

    billRecord.audit_logs = [auditRecord];

    // 8. Database Persistence (Tables with Fallback to hotel.settings)
    let persistedInTable = false;
    try {
      // Insert Bill
      const { error: bInsertErr } = await (supabase.from('fb_bills') as any).insert({
        id: billRecord.id,
        hotel_id: billRecord.hotel_id,
        bill_number: billRecord.bill_number,
        invoice_number: billRecord.invoice_number,
        invoice_date: billRecord.invoice_date,
        customer_type: billRecord.customer_type,
        booking_id: billRecord.booking_id,
        room_id: billRecord.room_id,
        guest_id: billRecord.guest_id,
        customer_name: billRecord.customer_name,
        customer_phone: billRecord.customer_phone,
        table_number: billRecord.table_number,
        room_number_snapshot: billRecord.room_number_snapshot,
        booking_number_snapshot: billRecord.booking_number_snapshot,
        billing_mode: billRecord.billing_mode,
        bill_status: billRecord.bill_status,
        payment_status: billRecord.payment_status,
        discount_type: billRecord.discount_type,
        discount_value: billRecord.discount_value,
        discount_amount: billRecord.discount_amount,
        discount_reason: billRecord.discount_reason,
        discount_authorized_by: billRecord.discount_authorized_by,
        subtotal: billRecord.subtotal,
        taxable_amount: billRecord.taxable_amount,
        cgst_amount: billRecord.cgst_amount,
        sgst_amount: billRecord.sgst_amount,
        gst_amount: billRecord.gst_amount,
        grand_total: billRecord.grand_total,
        total_paid: billRecord.total_paid,
        balance_due: billRecord.balance_due,
        special_instructions: billRecord.special_instructions,
        remarks: billRecord.remarks,
        recorded_by: billRecord.recorded_by,
        created_at: billRecord.created_at,
        updated_at: billRecord.updated_at,
      });

      if (!bInsertErr) {
        // Insert Orders
        await (supabase.from('fb_orders') as any).insert(
          createdOrders.map((o) => ({
            id: o.id,
            bill_id: o.bill_id,
            hotel_id: o.hotel_id,
            order_number: o.order_number,
            meal_type: o.meal_type,
            status: o.status,
            special_instructions: o.special_instructions,
            order_time: o.order_time,
            created_at: o.created_at,
            updated_at: o.updated_at,
          }))
        );

        // Insert Order Items
        await (supabase.from('fb_order_items') as any).insert(
          createdOrderItems.map((i) => ({
            id: i.id,
            order_id: i.order_id,
            bill_id: i.bill_id,
            hotel_id: i.hotel_id,
            menu_item_id: i.menu_item_id,
            item_name_snapshot: i.item_name_snapshot,
            category_snapshot: i.category_snapshot,
            meal_type: i.meal_type,
            food_type: i.food_type,
            quantity: i.quantity,
            unit_price_snapshot: i.unit_price_snapshot,
            base_price_snapshot: i.base_price_snapshot,
            tax_treatment: i.tax_treatment,
            gst_rate: i.gst_rate,
            taxable_amount: i.taxable_amount,
            gst_amount: i.gst_amount,
            total_amount: i.total_amount,
            notes: i.notes,
            status: i.status,
            created_at: i.created_at,
            updated_at: i.updated_at,
          }))
        );

        // Insert Payments
        if (createdPayments.length > 0) {
          await (supabase.from('fb_payments') as any).insert(
            createdPayments.map((p) => ({
              id: p.id,
              bill_id: p.bill_id,
              hotel_id: p.hotel_id,
              amount: p.amount,
              payment_mode: p.payment_mode,
              payment_type: p.payment_type,
              reference_number: p.reference_number,
              notes: p.notes,
              recorded_by: p.recorded_by,
              created_at: p.created_at,
            }))
          );
        }

        // Insert Audit Log
        await (supabase.from('fb_audit_logs') as any).insert({
          id: auditRecord.id,
          hotel_id: auditRecord.hotel_id,
          bill_id: auditRecord.bill_id,
          action: auditRecord.action,
          user_id: auditRecord.user_id,
          details: auditRecord.details,
          created_at: auditRecord.created_at,
        });

        // Insert into food_charges for room folio integration if charged to room
        if (folioFoodChargeInserts.length > 0) {
          await (supabase.from('food_charges') as any).insert(folioFoodChargeInserts);
        }

        persistedInTable = true;
      }
    } catch (e) {
      console.warn('Table insert failed, using hotel.settings fallback:', e);
    }

    // Always update hotel.settings for reliable instant fallback
    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', hotelId)
      .single();

    const existingBills: FBBillRecord[] = (hotelData?.settings?.fb_bills as FBBillRecord[]) || [];
    const updatedBills = [billRecord, ...existingBills];

    let updatedFoodCharges = (hotelData?.settings?.food_charges as any[]) || [];
    if (folioFoodChargeInserts.length > 0) {
      updatedFoodCharges = [...updatedFoodCharges, ...folioFoodChargeInserts];
    }

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          fb_bills: updatedBills,
          food_charges: updatedFoodCharges,
        },
      })
      .eq('id', hotelId);

    // Revalidate relevant routes
    revalidatePath('/food-beverage');
    revalidatePath('/food-beverage/bills');
    revalidatePath('/food-beverage/kitchen');
    revalidatePath('/billing');
    if (input.booking_id) {
      revalidatePath(`/billing/${input.booking_id}`);
    }
    revalidatePath('/dashboard');
    revalidatePath('/reports');

    return { success: true, bill: billRecord };
  } catch (err: any) {
    console.error('createFBBillAction error:', err);
    return { error: `Failed to create F&B Bill: ${err?.message || String(err)}` };
  }
}

/**
 * Server Action: Append an order / items to an existing open F&B Bill
 */
export async function addOrderToExistingBillAction(
  billId: string,
  input: {
    meal_type: FoodServiceType;
    special_instructions?: string | null;
    items: Array<{
      menu_item_id?: string;
      item_name: string;
      category_name: string;
      food_type?: 'veg' | 'non_veg' | 'egg';
      quantity: number;
      unit_price: number;
      notes?: string;
    }>;
  }
): Promise<{ success?: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return { error: 'Authentication required.' };

    const supabase = createClient();
    const hotelId = staff.hotel_id;
    const settings = await getHotelSettings(hotelId);
    const effectiveGstRate = Number(settings.gst_percentage ?? settings.gst_rate ?? 5);

    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', hotelId)
      .single();

    const existingBills: FBBillRecord[] = (hotelData?.settings?.fb_bills as FBBillRecord[]) || [];
    const bill = existingBills.find((b) => b.id === billId);
    if (!bill) return { error: 'Bill not found.' };

    if (bill.bill_status === 'void' || bill.bill_status === 'cancelled') {
      return { error: 'Cannot modify a void or cancelled bill.' };
    }

    const orderId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const orderNumber = `ORD-${Date.now().toString().slice(-4)}`;

    const newOrderItems: FBOrderItemRecord[] = [];
    let addedSubtotal = 0;

    for (const item of input.items) {
      const qty = Math.max(1, Number(item.quantity));
      const unitPrice = Number(item.unit_price || 0);
      const lineGross = Math.round(qty * unitPrice * 100) / 100;
      addedSubtotal += lineGross;

      const taxableAmount = Math.round((lineGross / (1 + effectiveGstRate / 100)) * 100) / 100;
      const gstAmount = Math.round((lineGross - taxableAmount) * 100) / 100;

      const orderItem: FBOrderItemRecord = {
        id: crypto.randomUUID(),
        order_id: orderId,
        bill_id: billId,
        hotel_id: hotelId,
        menu_item_id: item.menu_item_id || null,
        item_name_snapshot: item.item_name,
        category_snapshot: item.category_name || input.meal_type,
        meal_type: input.meal_type,
        food_type: item.food_type || 'veg',
        quantity: qty,
        unit_price_snapshot: unitPrice,
        base_price_snapshot: taxableAmount / qty,
        tax_treatment: 'gst',
        gst_rate: effectiveGstRate,
        taxable_amount: taxableAmount,
        gst_amount: gstAmount,
        total_amount: lineGross,
        notes: item.notes?.trim() || null,
        status: 'active',
        created_at: nowIso,
        updated_at: nowIso,
      };

      newOrderItems.push(orderItem);
    }

    const newOrder: FBOrderRecord = {
      id: orderId,
      bill_id: billId,
      hotel_id: hotelId,
      order_number: orderNumber,
      meal_type: input.meal_type,
      status: 'confirmed',
      special_instructions: input.special_instructions?.trim() || null,
      order_time: nowIso,
      items: newOrderItems,
      created_at: nowIso,
      updated_at: nowIso,
    };

    // Update bill financial totals
    const updatedSubtotal = Math.round((bill.subtotal + addedSubtotal) * 100) / 100;
    const updatedTaxable = Math.max(0, updatedSubtotal - bill.discount_amount);
    const updatedGst = Math.round(((updatedTaxable * effectiveGstRate) / 100) * 100) / 100;
    const updatedGrandTotal = Math.round((updatedTaxable + updatedGst) * 100) / 100;
    const updatedBalanceDue = Math.max(0, updatedGrandTotal - bill.total_paid);

    const updatedBill: FBBillRecord = {
      ...bill,
      subtotal: updatedSubtotal,
      taxable_amount: updatedTaxable,
      cgst_amount: Math.round((updatedGst / 2) * 100) / 100,
      sgst_amount: Math.round((updatedGst - Math.round(updatedGst / 2)) * 100) / 100,
      gst_amount: updatedGst,
      grand_total: updatedGrandTotal,
      balance_due: updatedBalanceDue,
      orders: [...(bill.orders || []), newOrder],
      items: [...(bill.items || []), ...newOrderItems],
      updated_at: nowIso,
    };

    // Update database
    try {
      await (supabase.from('fb_orders') as any).insert(newOrder);
      await (supabase.from('fb_order_items') as any).insert(newOrderItems);
      await (supabase.from('fb_bills') as any).update(updatedBill).eq('id', billId);
    } catch {}

    const updatedBillsList = existingBills.map((b) => (b.id === billId ? updatedBill : b));
    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          fb_bills: updatedBillsList,
        },
      })
      .eq('id', hotelId);

    revalidatePath('/food-beverage');
    revalidatePath(`/food-beverage/${billId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to add order to bill.' };
  }
}

/**
 * Server Action: Update order preparation status for Kitchen Display
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: FBOrderStatus
): Promise<{ success?: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return { error: 'Authentication required.' };

    const supabase = createClient();
    const hotelId = staff.hotel_id;

    try {
      await (supabase.from('fb_orders') as any)
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('hotel_id', hotelId);
    } catch {}

    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', hotelId)
      .single();

    const existingBills: FBBillRecord[] = (hotelData?.settings?.fb_bills as FBBillRecord[]) || [];
    let updated = false;

    const updatedBills = existingBills.map((bill) => {
      const orders = (bill.orders || []).map((o) => {
        if (o.id === orderId) {
          updated = true;
          return { ...o, status: newStatus, updated_at: new Date().toISOString() };
        }
        return o;
      });
      return { ...bill, orders };
    });

    if (updated) {
      await (supabase.from('hotels') as any)
        .update({
          settings: {
            ...(hotelData?.settings || {}),
            fb_bills: updatedBills,
          },
        })
        .eq('id', hotelId);
    }

    revalidatePath('/food-beverage/kitchen');
    revalidatePath('/food-beverage');
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to update order status.' };
  }
}

/**
 * Server Action: Record payment against an existing F&B Bill
 */
export async function recordFBPaymentAction(input: {
  billId: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentType?: PaymentType;
  referenceNumber?: string | null;
  notes?: string | null;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return { error: 'Authentication required.' };

    const pAmt = Math.round(Number(input.amount) * 100) / 100;
    if (isNaN(pAmt) || pAmt <= 0) {
      return { error: 'Payment amount must be greater than 0.' };
    }

    const supabase = createClient();
    const hotelId = staff.hotel_id;

    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', hotelId)
      .single();

    const existingBills: FBBillRecord[] = (hotelData?.settings?.fb_bills as FBBillRecord[]) || [];
    const bill = existingBills.find((b) => b.id === input.billId);
    if (!bill) return { error: 'F&B Bill not found.' };

    const paymentRecord: FBPaymentRecord = {
      id: crypto.randomUUID(),
      bill_id: input.billId,
      hotel_id: hotelId,
      amount: pAmt,
      payment_mode: input.paymentMode,
      payment_type: input.paymentType || 'settlement',
      reference_number: input.referenceNumber?.trim() || null,
      notes: input.notes?.trim() || null,
      recorded_by: staff.id,
      recorder_name: staff.full_name,
      created_at: new Date().toISOString(),
    };

    const newTotalPaid = Math.round((bill.total_paid + pAmt) * 100) / 100;
    const newBalance = Math.max(0, Math.round((bill.grand_total - newTotalPaid) * 100) / 100);
    const newPaymentStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

    const updatedBill: FBBillRecord = {
      ...bill,
      total_paid: newTotalPaid,
      balance_due: newBalance,
      payment_status: newPaymentStatus,
      payments: [...(bill.payments || []), paymentRecord],
      updated_at: new Date().toISOString(),
    };

    try {
      await (supabase.from('fb_payments') as any).insert(paymentRecord);
      await (supabase.from('fb_bills') as any).update({
        total_paid: newTotalPaid,
        balance_due: newBalance,
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      }).eq('id', input.billId);
    } catch {}

    const updatedBillsList = existingBills.map((b) => (b.id === input.billId ? updatedBill : b));
    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          fb_bills: updatedBillsList,
        },
      })
      .eq('id', hotelId);

    revalidatePath('/food-beverage');
    revalidatePath(`/food-beverage/${input.billId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to record payment.' };
  }
}

/**
 * Server Action: Void / Cancel an F&B Bill with audit trail
 */
export async function voidFBBillAction(
  billId: string,
  reason: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return { error: 'Authentication required.' };

    if (!['owner', 'manager'].includes(staff.role)) {
      return { error: 'Only owners and managers have permission to void bills.' };
    }

    if (!reason || reason.trim().length < 3) {
      return { error: 'Please provide a valid reason for voiding this bill.' };
    }

    const supabase = createClient();
    const hotelId = staff.hotel_id;

    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', hotelId)
      .single();

    const existingBills: FBBillRecord[] = (hotelData?.settings?.fb_bills as FBBillRecord[]) || [];
    const bill = existingBills.find((b) => b.id === billId);
    if (!bill) return { error: 'Bill not found.' };

    const auditLog: FBAuditLogRecord = {
      id: crypto.randomUUID(),
      hotel_id: hotelId,
      bill_id: billId,
      action: 'voided',
      user_id: staff.id,
      user_name: staff.full_name,
      details: {
        reason: reason.trim(),
        previous_grand_total: bill.grand_total,
        previous_status: bill.bill_status,
      },
      created_at: new Date().toISOString(),
    };

    const updatedBill: FBBillRecord = {
      ...bill,
      bill_status: 'void',
      remarks: `[VOIDED: ${reason.trim()}] ${bill.remarks || ''}`.trim(),
      audit_logs: [...(bill.audit_logs || []), auditLog],
      updated_at: new Date().toISOString(),
    };

    // If this bill was charged to room, remove charges from food_charges
    if (bill.booking_id) {
      try {
        await (supabase.from('food_charges') as any)
          .delete()
          .like('remarks', `%[F&B Bill #${bill.bill_number}]%`);
      } catch {}

      const existingFolioCharges = (hotelData?.settings?.food_charges as any[]) || [];
      const filteredFolioCharges = existingFolioCharges.filter(
        (c) => !(c.remarks && c.remarks.includes(`[F&B Bill #${bill.bill_number}]`))
      );

      hotelData.settings.food_charges = filteredFolioCharges;
    }

    try {
      await (supabase.from('fb_bills') as any).update({
        bill_status: 'void',
        remarks: updatedBill.remarks,
        updated_at: new Date().toISOString(),
      }).eq('id', billId);
    } catch {}

    const updatedBillsList = existingBills.map((b) => (b.id === billId ? updatedBill : b));
    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          fb_bills: updatedBillsList,
          food_charges: hotelData?.settings?.food_charges,
        },
      })
      .eq('id', hotelId);

    revalidatePath('/food-beverage');
    revalidatePath('/food-beverage/bills');
    revalidatePath(`/food-beverage/${billId}`);
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to void bill.' };
  }
}

/**
 * Server Action: Save / Create / Update Menu Item
 */
export async function saveFBMenuItemAction(input: Partial<FBMenuItem>): Promise<{
  success?: boolean;
  item?: FBMenuItem;
  error?: string;
}> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return { error: 'Authentication required.' };
    if (!['owner', 'manager'].includes(staff.role)) {
      return { error: 'Permission denied: only managers can modify the menu.' };
    }

    if (!input.name?.trim()) return { error: 'Item name is required.' };
    if (!input.category_id) return { error: 'Category is required.' };

    const sellingPrice = Number(input.selling_price || 0);
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      return { error: 'Selling price must be greater than or equal to 0.' };
    }

    const supabase = createClient();
    const hotelId = staff.hotel_id;
    const settings = await getHotelSettings(hotelId);
    const effectiveGstRate = Number(input.gst_rate ?? (settings.gst_percentage ?? 5));
    const basePrice = Number(input.base_price ?? (sellingPrice / (1 + effectiveGstRate / 100)));

    const itemId = input.id || crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const menuItem: FBMenuItem = {
      id: itemId,
      hotel_id: hotelId,
      category_id: input.category_id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      base_price: Math.round(basePrice * 100) / 100,
      selling_price: sellingPrice,
      gst_rate: effectiveGstRate,
      food_type: input.food_type || 'veg',
      available_meals: input.available_meals || ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'],
      kitchen_area: input.kitchen_area || 'Main Kitchen',
      sku: input.sku?.trim() || null,
      inventory_item_id: input.inventory_item_id || null,
      is_active: input.is_active !== false,
      created_at: nowIso,
      updated_at: nowIso,
    };

    // 1. Table upsert
    try {
      await (supabase.from('menu_items') as any).upsert({
        id: menuItem.id,
        hotel_id: menuItem.hotel_id,
        category_id: menuItem.category_id,
        name: menuItem.name,
        description: menuItem.description,
        selling_price: menuItem.selling_price,
        is_active: menuItem.is_active,
        base_price: menuItem.base_price,
        gst_rate: menuItem.gst_rate,
        food_type: menuItem.food_type,
        available_meals: menuItem.available_meals,
        kitchen_area: menuItem.kitchen_area,
        sku: menuItem.sku,
        inventory_item_id: menuItem.inventory_item_id,
        updated_at: nowIso,
      });
    } catch {}

    // 2. Settings fallback
    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', hotelId)
      .single();

    const existingItems: any[] = (hotelData?.settings?.menu_items as any[]) || [];
    const idx = existingItems.findIndex((i) => i.id === itemId);
    let updatedItems = [];
    if (idx >= 0) {
      updatedItems = existingItems.map((i) => (i.id === itemId ? { ...i, ...menuItem } : i));
    } else {
      updatedItems = [...existingItems, menuItem];
    }

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          menu_items: updatedItems,
        },
      })
      .eq('id', hotelId);

    revalidatePath('/food-beverage');
    revalidatePath('/food-beverage/menu');
    return { success: true, item: menuItem };
  } catch (err: any) {
    return { error: err?.message || 'Failed to save menu item.' };
  }
}

/**
 * Server Action: Save / Create / Update Menu Category
 */
export async function saveFBMenuCategoryAction(input: {
  id?: string;
  name: string;
  display_order?: number;
  is_active?: boolean;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return { error: 'Authentication required.' };
    if (!['owner', 'manager'].includes(staff.role)) {
      return { error: 'Permission denied: only managers can modify categories.' };
    }

    if (!input.name?.trim()) return { error: 'Category name is required.' };

    const supabase = createClient();
    const hotelId = staff.hotel_id;
    const catId = input.id || crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const categoryObj = {
      id: catId,
      hotel_id: hotelId,
      name: input.name.trim(),
      display_order: Number(input.display_order || 1),
      is_active: input.is_active !== false,
      updated_at: nowIso,
    };

    try {
      await (supabase.from('menu_categories') as any).upsert(categoryObj);
    } catch {}

    const { data: hotelData } = await (supabase.from('hotels') as any)
      .select('id, settings')
      .eq('id', hotelId)
      .single();

    const existingCats: any[] = (hotelData?.settings?.menu_categories as any[]) || [];
    const idx = existingCats.findIndex((c) => c.id === catId);
    let updatedCats = [];
    if (idx >= 0) {
      updatedCats = existingCats.map((c) => (c.id === catId ? { ...c, ...categoryObj } : c));
    } else {
      updatedCats = [...existingCats, categoryObj];
    }

    await (supabase.from('hotels') as any)
      .update({
        settings: {
          ...(hotelData?.settings || {}),
          menu_categories: updatedCats,
        },
      })
      .eq('id', hotelId);

    revalidatePath('/food-beverage');
    revalidatePath('/food-beverage/menu');
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || 'Failed to save menu category.' };
  }
}
