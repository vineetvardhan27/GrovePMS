import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { getMenuItems, getMenuCategories } from '../menu/queries';
import { getHotelSettings } from '../hotels/queries';
import {
  FBBillRecord,
  FBBillFilter,
  FBDashboardSummary,
  FBOrderRecord,
  FBOrderItemRecord,
  FBReportsData,
  FBMenuItem,
  FBPaymentRecord,
} from './types';

/**
 * Fetch all in-house checked-in guests with their active rooms and bookings
 * for rapid live search in F&B billing.
 */
export async function getInHouseGuestsForFBBilling(hotelId?: string) {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const supabase = createClient();

    let query = supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        booking_status,
        check_in_date,
        check_out_date,
        total_amount,
        room:room_id (
          id,
          room_number,
          floor,
          category:category_id (name)
        ),
        guest:guest_id (
          id,
          full_name,
          phone,
          email
        )
      `)
      .in('booking_status', ['confirmed', 'checked_in'])
      .order('created_at', { ascending: false });

    if (activeHotelId) {
      query = query.eq('hotel_id', activeHotelId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map((b: any) => ({
      booking_id: b.id,
      booking_number: b.booking_number,
      booking_status: b.booking_status,
      check_in_date: b.check_in_date,
      check_out_date: b.check_out_date,
      room_id: b.room?.id || null,
      room_number: b.room?.room_number || '—',
      room_category: b.room?.category?.name || 'Standard',
      guest_id: b.guest?.id || null,
      guest_name: b.guest?.full_name || 'Guest',
      guest_phone: b.guest?.phone || '',
      label: `Room ${b.room?.room_number || '—'} — ${b.guest?.full_name || 'Guest'} (${b.booking_number})`,
    }));
  } catch (err) {
    console.error('getInHouseGuestsForFBBilling error:', err);
    return [];
  }
}

/**
 * Fetch enriched menu items with POS fields
 */
export async function getFBMenuItemsWithDetails(hotelId?: string): Promise<FBMenuItem[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const rawItems = await getMenuItems(activeHotelId, true);
    const settings = await getHotelSettings(activeHotelId);
    const defaultGst = Number(settings.gst_percentage ?? settings.gst_rate ?? 5);

    return rawItems.map((item: any) => {
      const price = Number(item.selling_price || 0);
      const gstRate = Number(item.gst_rate ?? defaultGst);
      const basePrice = Number(item.base_price ?? (price / (1 + gstRate / 100)));
      
      return {
        id: item.id,
        hotel_id: item.hotel_id,
        category_id: item.category_id,
        name: item.name,
        description: item.description,
        base_price: Math.round(basePrice * 100) / 100,
        selling_price: price,
        gst_rate: gstRate,
        food_type: item.food_type || (item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('meat') || item.name.toLowerCase().includes('fish') ? 'non_veg' : item.name.toLowerCase().includes('egg') || item.name.toLowerCase().includes('omelette') ? 'egg' : 'veg'),
        available_meals: item.available_meals || ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'],
        kitchen_area: item.kitchen_area || 'Main Kitchen',
        sku: item.sku || `FB-${item.name.slice(0, 3).toUpperCase()}`,
        inventory_item_id: item.inventory_item_id || null,
        is_active: item.is_active !== false,
        category: item.category,
      };
    });
  } catch (err) {
    console.error('getFBMenuItemsWithDetails error:', err);
    return [];
  }
}

/**
 * Helper to fetch all raw bills with fallback to hotel.settings.fb_bills
 */
async function getRawFBBills(hotelId?: string): Promise<FBBillRecord[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;
    const supabase = createClient();

    // 1. Try public.fb_bills table
    try {
      let q = supabase
        .from('fb_bills')
        .select(`
          *,
          orders:fb_orders(*),
          items:fb_order_items(*),
          payments:fb_payments(*),
          audit_logs:fb_audit_logs(*)
        `)
        .order('created_at', { ascending: false });

      if (activeHotelId) {
        q = q.eq('hotel_id', activeHotelId);
      }

      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return (data as any[]).map((r) => ({
          ...r,
          subtotal: Number(r.subtotal || 0),
          discount_value: Number(r.discount_value || 0),
          discount_amount: Number(r.discount_amount || 0),
          taxable_amount: Number(r.taxable_amount || 0),
          cgst_amount: Number(r.cgst_amount || 0),
          sgst_amount: Number(r.sgst_amount || 0),
          gst_amount: Number(r.gst_amount || 0),
          grand_total: Number(r.grand_total || 0),
          total_paid: Number(r.total_paid || 0),
          balance_due: Number(r.balance_due || 0),
          orders: (r.orders || []).map((o: any) => ({
            ...o,
            items: (r.items || []).filter((i: any) => i.order_id === o.id).map((i: any) => ({
              ...i,
              quantity: Number(i.quantity),
              unit_price_snapshot: Number(i.unit_price_snapshot),
              base_price_snapshot: Number(i.base_price_snapshot || 0),
              gst_rate: Number(i.gst_rate || 0),
              taxable_amount: Number(i.taxable_amount || 0),
              gst_amount: Number(i.gst_amount || 0),
              total_amount: Number(i.total_amount || 0),
            })),
          })),
          items: (r.items || []).map((i: any) => ({
            ...i,
            quantity: Number(i.quantity),
            unit_price_snapshot: Number(i.unit_price_snapshot),
            base_price_snapshot: Number(i.base_price_snapshot || 0),
            gst_rate: Number(i.gst_rate || 0),
            taxable_amount: Number(i.taxable_amount || 0),
            gst_amount: Number(i.gst_amount || 0),
            total_amount: Number(i.total_amount || 0),
          })),
          payments: (r.payments || []).map((p: any) => ({
            ...p,
            amount: Number(p.amount),
          })),
        }));
      }
    } catch {
      // Table fallback
    }

    // 2. Fallback to hotel.settings.fb_bills
    const targetHotelId = activeHotelId || 'a0000000-0000-0000-0000-000000000001';
    const { data: hotel } = await (supabase.from('hotels') as any)
      .select('settings')
      .eq('id', targetHotelId)
      .maybeSingle();

    const storedBills: FBBillRecord[] = (hotel?.settings?.fb_bills as FBBillRecord[]) || [];
    return storedBills.map((r) => ({
      ...r,
      subtotal: Number(r.subtotal || 0),
      discount_value: Number(r.discount_value || 0),
      discount_amount: Number(r.discount_amount || 0),
      taxable_amount: Number(r.taxable_amount || 0),
      cgst_amount: Number(r.cgst_amount || 0),
      sgst_amount: Number(r.sgst_amount || 0),
      gst_amount: Number(r.gst_amount || 0),
      grand_total: Number(r.grand_total || 0),
      total_paid: Number(r.total_paid || 0),
      balance_due: Number(r.balance_due || 0),
      orders: (r.orders || []).map((o) => ({
        ...o,
        items: (o.items || []).map((i) => ({
          ...i,
          quantity: Number(i.quantity),
          unit_price_snapshot: Number(i.unit_price_snapshot),
          base_price_snapshot: Number(i.base_price_snapshot || 0),
          gst_rate: Number(i.gst_rate || 0),
          taxable_amount: Number(i.taxable_amount || 0),
          gst_amount: Number(i.gst_amount || 0),
          total_amount: Number(i.total_amount || 0),
        })),
      })),
      items: (r.items || []).map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unit_price_snapshot: Number(i.unit_price_snapshot),
        base_price_snapshot: Number(i.base_price_snapshot || 0),
        gst_rate: Number(i.gst_rate || 0),
        taxable_amount: Number(i.taxable_amount || 0),
        gst_amount: Number(i.gst_amount || 0),
        total_amount: Number(i.total_amount || 0),
      })),
      payments: (r.payments || []).map((p) => ({
        ...p,
        amount: Number(p.amount),
      })),
    }));
  } catch (err) {
    console.error('getRawFBBills error:', err);
    return [];
  }
}

/**
 * Filter and query F&B Bills
 */
export async function getFBBills(hotelId?: string, filter: FBBillFilter = {}): Promise<FBBillRecord[]> {
  const allBills = await getRawFBBills(hotelId);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return allBills.filter((bill) => {
    // 1. Text Query
    if (filter.query && filter.query.trim()) {
      const q = filter.query.toLowerCase().trim();
      const matchNumber = bill.bill_number?.toLowerCase().includes(q) || bill.invoice_number?.toLowerCase().includes(q);
      const matchCustomer = bill.customer_name?.toLowerCase().includes(q) || bill.customer_phone?.includes(q);
      const matchRoom = bill.room_number_snapshot?.toLowerCase().includes(q) || bill.booking_number_snapshot?.toLowerCase().includes(q);
      const matchItem = bill.items?.some((i) => i.item_name_snapshot.toLowerCase().includes(q));
      if (!matchNumber && !matchCustomer && !matchRoom && !matchItem) return false;
    }

    // 2. Period Filter
    const billDate = (bill.created_at || '').split('T')[0];
    if (filter.period === 'today') {
      if (billDate !== todayStr) return false;
    } else if (filter.period === 'yesterday') {
      const yDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (billDate !== yDate) return false;
    } else if (filter.period === 'this_week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      if (billDate < weekAgo) return false;
    } else if (filter.period === 'this_month') {
      const monthPrefix = todayStr.slice(0, 7);
      if (!billDate.startsWith(monthPrefix)) return false;
    } else if (filter.period === 'custom' && filter.start_date) {
      if (billDate < filter.start_date) return false;
      if (filter.end_date && billDate > filter.end_date) return false;
    }

    // 3. Meal Type
    if (filter.meal_type && filter.meal_type !== 'all') {
      const hasMeal = bill.orders?.some((o) => o.meal_type === filter.meal_type) ||
        bill.items?.some((i) => i.meal_type === filter.meal_type);
      if (!hasMeal) return false;
    }

    // 4. Customer Type
    if (filter.customer_type && filter.customer_type !== 'all') {
      if (bill.customer_type !== filter.customer_type) return false;
    }

    // 5. Payment Status
    if (filter.payment_status && filter.payment_status !== 'all') {
      if (bill.payment_status !== filter.payment_status) return false;
    }

    // 6. Bill Status
    if (filter.bill_status && filter.bill_status !== 'all') {
      if (bill.bill_status !== filter.bill_status) return false;
    }

    // 7. Billing Mode
    if (filter.billing_mode && filter.billing_mode !== 'all') {
      if (bill.billing_mode !== filter.billing_mode) return false;
    }

    return true;
  });
}

/**
 * Fetch a single F&B Bill by ID with all details
 */
export async function getFBBillById(billId: string, hotelId?: string): Promise<FBBillRecord | null> {
  const allBills = await getRawFBBills(hotelId);
  return allBills.find((b) => b.id === billId) || null;
}

/**
 * Fetch operational summary dashboard metrics
 */
export async function getFBDashboardSummary(hotelId?: string): Promise<FBDashboardSummary> {
  const allBills = await getRawFBBills(hotelId);
  const todayStr = new Date().toISOString().split('T')[0];

  const todayBills = allBills.filter((b) => {
    const bDate = (b.created_at || '').split('T')[0];
    return bDate === todayStr && b.bill_status !== 'void' && b.bill_status !== 'cancelled';
  });

  let todaySales = 0;
  let pendingPayments = 0;
  let roomChargesAmount = 0;
  let walkinSalesAmount = 0;
  let breakfastSales = 0;
  let lunchSales = 0;
  let dinnerSales = 0;
  let snacksSales = 0;
  let beveragesSales = 0;
  let otherSales = 0;
  let cashCollected = 0;
  let upiCollected = 0;
  let cardCollected = 0;

  for (const bill of todayBills) {
    todaySales += bill.grand_total;
    if (bill.balance_due > 0 && bill.billing_mode !== 'charge_to_room') {
      pendingPayments += bill.balance_due;
    }

    if (bill.billing_mode === 'charge_to_room' || bill.customer_type === 'room_guest') {
      roomChargesAmount += bill.grand_total;
    } else {
      walkinSalesAmount += bill.grand_total;
    }

    // Break down by items / meal type
    const items = bill.items || [];
    for (const item of items) {
      const itemTotal = item.total_amount || (item.quantity * item.unit_price_snapshot);
      const mType = (item.meal_type || 'Other').toLowerCase();
      if (mType.includes('breakfast')) breakfastSales += itemTotal;
      else if (mType.includes('lunch')) lunchSales += itemTotal;
      else if (mType.includes('dinner')) dinnerSales += itemTotal;
      else if (mType.includes('snack')) snacksSales += itemTotal;
      else if (mType.includes('beverage') || mType.includes('drink')) beveragesSales += itemTotal;
      else otherSales += itemTotal;
    }

    // Payments
    const payments = bill.payments || [];
    for (const p of payments) {
      if (p.payment_mode === 'cash') cashCollected += p.amount;
      else if (p.payment_mode === 'upi') upiCollected += p.amount;
      else if (p.payment_mode === 'card') cardCollected += p.amount;
    }
  }

  // Active kitchen orders count (preparing or ready)
  const activeOrdersCount = allBills.reduce((count, b) => {
    if (b.bill_status === 'void' || b.bill_status === 'cancelled') return count;
    const active = (b.orders || []).filter((o) => ['confirmed', 'preparing', 'ready'].includes(o.status));
    return count + active.length;
  }, 0);

  const avgOrderValue = todayBills.length > 0 ? Math.round((todaySales / todayBills.length) * 100) / 100 : 0;

  return {
    today_sales: Math.round(todaySales * 100) / 100,
    today_orders_count: todayBills.length,
    pending_payments_amount: Math.round(pendingPayments * 100) / 100,
    room_charges_amount: Math.round(roomChargesAmount * 100) / 100,
    walkin_sales_amount: Math.round(walkinSalesAmount * 100) / 100,
    breakfast_sales: Math.round(breakfastSales * 100) / 100,
    lunch_sales: Math.round(lunchSales * 100) / 100,
    dinner_sales: Math.round(dinnerSales * 100) / 100,
    snacks_sales: Math.round(snacksSales * 100) / 100,
    beverages_sales: Math.round(beveragesSales * 100) / 100,
    other_sales: Math.round(otherSales * 100) / 100,
    average_order_value: avgOrderValue,
    cash_collected: Math.round(cashCollected * 100) / 100,
    upi_collected: Math.round(upiCollected * 100) / 100,
    card_collected: Math.round(cardCollected * 100) / 100,
    active_kitchen_orders_count: activeOrdersCount,
  };
}

/**
 * Fetch all active orders for Kitchen Display View
 */
export async function getActiveKitchenOrders(hotelId?: string): Promise<Array<FBOrderRecord & {
  bill: Partial<FBBillRecord>;
}>> {
  const allBills = await getRawFBBills(hotelId);
  const activeList: Array<FBOrderRecord & { bill: Partial<FBBillRecord> }> = [];

  for (const b of allBills) {
    if (b.bill_status === 'void' || b.bill_status === 'cancelled') continue;

    for (const order of b.orders || []) {
      if (['draft', 'confirmed', 'preparing', 'ready'].includes(order.status)) {
        activeList.push({
          ...order,
          items: order.items || (b.items || []).filter((i) => i.order_id === order.id),
          bill: {
            id: b.id,
            bill_number: b.bill_number,
            customer_type: b.customer_type,
            customer_name: b.customer_name,
            room_number_snapshot: b.room_number_snapshot,
            table_number: b.table_number,
            created_at: b.created_at,
          },
        });
      }
    }
  }

  // Sort: preparing & confirmed first, oldest orders on top
  return activeList.sort((a, b) => new Date(a.order_time).getTime() - new Date(b.order_time).getTime());
}

/**
 * Generate F&B Reports Data
 */
export async function getFBReportsData(
  hotelId?: string,
  period: string = 'this_month',
  customStart?: string,
  customEnd?: string
): Promise<FBReportsData> {
  const allBills = await getRawFBBills(hotelId);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let startDate = todayStr;
  let endDate = todayStr;

  if (period === 'today') {
    startDate = todayStr;
    endDate = todayStr;
  } else if (period === 'yesterday') {
    const yDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    startDate = yDate;
    endDate = yDate;
  } else if (period === 'this_week') {
    startDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    endDate = todayStr;
  } else if (period === 'this_month') {
    startDate = `${todayStr.slice(0, 7)}-01`;
    endDate = todayStr;
  } else if (period === 'custom' && customStart) {
    startDate = customStart;
    endDate = customEnd || todayStr;
  } else {
    // All time
    startDate = '2026-01-01';
    endDate = todayStr;
  }

  const filteredBills = allBills.filter((b) => {
    if (b.bill_status === 'void' || b.bill_status === 'cancelled') return false;
    const bDate = (b.created_at || '').split('T')[0];
    return bDate >= startDate && bDate <= endDate;
  });

  let totalRevenue = 0;
  let totalTaxable = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalGst = 0;
  let totalDiscount = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;
  let roomChargesTotal = 0;
  let walkinTotal = 0;

  const mealsBreakdown = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0,
    beverages: 0,
    other: 0,
  };

  const paymentsBreakdown = {
    cash: 0,
    upi: 0,
    card: 0,
    bank_transfer: 0,
    room_charge: 0,
    other: 0,
  };

  const itemMap = new Map<string, { name: string; category: string; quantity: number; revenue: number; orders: number }>();
  const dailyTrendMap = new Map<string, { revenue: number; orders: number }>();

  for (const bill of filteredBills) {
    totalRevenue += bill.grand_total;
    totalTaxable += bill.taxable_amount;
    totalCgst += bill.cgst_amount;
    totalSgst += bill.sgst_amount;
    totalGst += bill.gst_amount;
    totalDiscount += bill.discount_amount;
    totalCollected += bill.total_paid;
    totalOutstanding += bill.balance_due;

    if (bill.billing_mode === 'charge_to_room' || bill.customer_type === 'room_guest') {
      roomChargesTotal += bill.grand_total;
      paymentsBreakdown.room_charge += bill.grand_total;
    } else {
      walkinTotal += bill.grand_total;
    }

    // Payments
    for (const p of bill.payments || []) {
      const mode = p.payment_mode;
      if (mode === 'cash') paymentsBreakdown.cash += p.amount;
      else if (mode === 'upi') paymentsBreakdown.upi += p.amount;
      else if (mode === 'card') paymentsBreakdown.card += p.amount;
      else if (mode === 'bank_transfer') paymentsBreakdown.bank_transfer += p.amount;
      else paymentsBreakdown.other += p.amount;
    }

    // Items
    for (const item of bill.items || []) {
      const iTotal = item.total_amount;
      const mType = (item.meal_type || 'Other').toLowerCase();
      if (mType.includes('breakfast')) mealsBreakdown.breakfast += iTotal;
      else if (mType.includes('lunch')) mealsBreakdown.lunch += iTotal;
      else if (mType.includes('dinner')) mealsBreakdown.dinner += iTotal;
      else if (mType.includes('snack')) mealsBreakdown.snacks += iTotal;
      else if (mType.includes('beverage') || mType.includes('drink')) mealsBreakdown.beverages += iTotal;
      else mealsBreakdown.other += iTotal;

      const existing = itemMap.get(item.item_name_snapshot) || {
        name: item.item_name_snapshot,
        category: item.category_snapshot || 'Food',
        quantity: 0,
        revenue: 0,
        orders: 0,
      };

      existing.quantity += item.quantity;
      existing.revenue += iTotal;
      existing.orders += 1;
      itemMap.set(item.item_name_snapshot, existing);
    }

    // Daily trend
    const dayStr = (bill.created_at || '').split('T')[0];
    const trend = dailyTrendMap.get(dayStr) || { revenue: 0, orders: 0 };
    trend.revenue += bill.grand_total;
    trend.orders += 1;
    dailyTrendMap.set(dayStr, trend);
  }

  const topItems = Array.from(itemMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .map((i) => ({
      item_name: i.name,
      category_name: i.category,
      quantity_sold: i.quantity,
      revenue: Math.round(i.revenue * 100) / 100,
      order_count: i.orders,
    }));

  const recentDailyTrend = Array.from(dailyTrendMap.entries())
    .map(([date, t]) => ({
      date,
      revenue: Math.round(t.revenue * 100) / 100,
      orders: t.orders,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    period,
    startDate,
    endDate,
    total_revenue: Math.round(totalRevenue * 100) / 100,
    total_orders: filteredBills.length,
    total_taxable: Math.round(totalTaxable * 100) / 100,
    total_cgst: Math.round(totalCgst * 100) / 100,
    total_sgst: Math.round(totalSgst * 100) / 100,
    total_gst: Math.round(totalGst * 100) / 100,
    total_discount: Math.round(totalDiscount * 100) / 100,
    total_collected: Math.round(totalCollected * 100) / 100,
    total_outstanding: Math.round(totalOutstanding * 100) / 100,
    room_charges_total: Math.round(roomChargesTotal * 100) / 100,
    walkin_total: Math.round(walkinTotal * 100) / 100,
    meals_breakdown: {
      breakfast: Math.round(mealsBreakdown.breakfast * 100) / 100,
      lunch: Math.round(mealsBreakdown.lunch * 100) / 100,
      dinner: Math.round(mealsBreakdown.dinner * 100) / 100,
      snacks: Math.round(mealsBreakdown.snacks * 100) / 100,
      beverages: Math.round(beveragesSalesFrom(mealsBreakdown.beverages) * 100) / 100,
      other: Math.round(mealsBreakdown.other * 100) / 100,
    },
    payments_breakdown: {
      cash: Math.round(paymentsBreakdown.cash * 100) / 100,
      upi: Math.round(paymentsBreakdown.upi * 100) / 100,
      card: Math.round(paymentsBreakdown.card * 100) / 100,
      bank_transfer: Math.round(paymentsBreakdown.bank_transfer * 100) / 100,
      room_charge: Math.round(paymentsBreakdown.room_charge * 100) / 100,
      other: Math.round(paymentsBreakdown.other * 100) / 100,
    },
    top_items: topItems,
    recent_daily_trend: recentDailyTrend,
  };
}

function beveragesSalesFrom(val: number) {
  return val;
}
