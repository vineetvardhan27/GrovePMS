import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { PaymentMode, PaymentType } from '../types/database.types';
import {
  UnifiedPaymentTransaction,
  OutstandingReceivable,
  HotelWidePaymentStats,
  SourceMetric,
  ModeMetric,
  CollectionTrendDay,
  PaymentSource,
} from './types';
import { getBanquetBookings, getBanquetPayments } from '../banquet/queries';
import { getFBBills } from '../fb/queries';
import { getHotelSettings } from '../hotels/queries';
import { PaginatedResult } from '../types/pagination';

// ─── Helpers ────────────────────────────────────────────────────────────────

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

export interface GetPaymentsLedgerOptions {
  hotelId?: string;
  page?: number;
  pageSize?: number;
  source?: string;
  paymentMode?: string;
  paymentType?: string;
  searchQuery?: string;
  datePreset?: string;
  startDate?: string;
  endDate?: string;
}

export async function getUnifiedPaymentsLedgerPaginated(
  options: GetPaymentsLedgerOptions = {}
): Promise<PaginatedResult<UnifiedPaymentTransaction>> {
  const staff = await getCurrentStaff();
  const activeHotelId = options.hotelId || staff?.hotel_id;
  const supabase = createClient();

  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.max(1, Number(options.pageSize) || 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Compute date range from datePreset if provided
  let filterStartDate = options.startDate;
  let filterEndDate = options.endDate;

  if (options.datePreset && options.datePreset !== 'all') {
    const now = new Date();
    const todayStr = toDateString(now);

    if (options.datePreset === 'today') {
      filterStartDate = `${todayStr}T00:00:00`;
      filterEndDate = `${todayStr}T23:59:59.999Z`;
    } else if (options.datePreset === 'yesterday') {
      const yesterday = new Date(now.getTime() - 86400000);
      const yesterdayStr = toDateString(yesterday);
      filterStartDate = `${yesterdayStr}T00:00:00`;
      filterEndDate = `${yesterdayStr}T23:59:59.999Z`;
    } else if (options.datePreset === 'this_week') {
      const dayOfWeek = (now.getDay() + 6) % 7;
      const monday = new Date(now.getTime() - dayOfWeek * 86400000);
      filterStartDate = `${toDateString(monday)}T00:00:00`;
    } else if (options.datePreset === 'this_month') {
      const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      filterStartDate = `${monthStartStr}T00:00:00`;
    } else if (options.datePreset === 'last_month') {
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const lastMonthNum = now.getMonth() === 0 ? 12 : now.getMonth();
      const lastMonthStr = `${lastMonthYear}-${String(lastMonthNum).padStart(2, '0')}`;
      const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      filterStartDate = `${lastMonthStr}-01T00:00:00`;
      filterEndDate = `${lastMonthStr}-${String(lastDayOfPrevMonth).padStart(2, '0')}T23:59:59.999Z`;
    } else if (options.datePreset === 'this_year') {
      filterStartDate = `${now.getFullYear()}-01-01T00:00:00`;
    }
  }

  const shouldFetchRooms = !options.source || options.source === 'all' || options.source === 'rooms';
  const shouldFetchBanquet = !options.source || options.source === 'all' || options.source === 'banquet';
  const shouldFetchFB = !options.source || options.source === 'all' || options.source === 'food_beverage';

  const transactions: UnifiedPaymentTransaction[] = [];
  let totalCount = 0;

  // Helper to fetch room payments
  const fetchRoomPayments = async () => {
    if (!shouldFetchRooms) return;
    try {
      let q = supabase
        .from('payments')
        .select(`
          *,
          booking:booking_id (
            id,
            booking_number,
            total_amount,
            advance_amount,
            booking_status,
            check_in_date,
            check_out_date,
            guest:guest_id (
              full_name,
              phone
            ),
            room:room_id (
              room_number
            )
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (activeHotelId) q = q.eq('hotel_id', activeHotelId);
      if (options.paymentMode && options.paymentMode !== 'all') {
        q = q.eq('payment_mode', options.paymentMode);
      }
      if (options.paymentType && options.paymentType !== 'all') {
        q = q.ilike('payment_type', `%${options.paymentType}%`);
      }
      if (filterStartDate) q = q.gte('created_at', filterStartDate);
      if (filterEndDate) q = q.lte('created_at', filterEndDate);

      if (options.searchQuery && options.searchQuery.trim()) {
        const s = options.searchQuery.trim();
        q = q.or(`notes.ilike.%${s}%,payment_mode.ilike.%${s}%`);
      }

      if (options.source === 'rooms') {
        q = q.range(from, to);
      } else {
        q = q.limit(from + pageSize);
      }

      const { data: roomPayments, count, error } = await q;
      if (count !== null && count !== undefined) totalCount += count;

      if (!error && roomPayments) {
        for (const p of roomPayments as any[]) {
          const roomNum = p.booking?.room?.room_number || 'Room';
          const isBasement = String(roomNum).toLowerCase().includes('family') || String(roomNum).toLowerCase().includes('basement');
          const resourceName = isBasement ? 'Basement Family Suite' : `Room ${roomNum}`;

          transactions.push({
            id: p.id,
            hotel_id: p.hotel_id,
            source: 'rooms',
            source_label: 'Room Booking',
            source_id: p.booking_id,
            reference_number: p.booking?.booking_number || `HGV-${p.id.slice(0, 8)}`,
            customer_name: p.booking?.guest?.full_name || 'Room Guest',
            customer_phone: p.booking?.guest?.phone || '',
            resource_name: resourceName,
            event_or_details: `Accommodation (${p.booking?.check_in_date || 'Stay'} to ${p.booking?.check_out_date || ''})`,
            amount: Number(p.amount) || 0,
            payment_mode: (p.payment_mode as PaymentMode) || 'cash',
            payment_type: (p.payment_type as string) || 'payment',
            transaction_reference: p.notes?.includes('Ref:') ? p.notes.split('Ref:')[1]?.trim() : null,
            status: 'successful',
            notes: p.notes,
            recorded_by: p.recorded_by || 'Staff',
            created_at: p.created_at || new Date().toISOString(),
            link_url: `/billing/${p.booking_id}`,
          });
        }
      }
    } catch (err) {
      console.error('Error in fetchRoomPayments:', err);
    }
  };

  // Helper to fetch banquet payments
  const fetchBanquetPayments = async () => {
    if (!shouldFetchBanquet) return;
    try {
      let bq = (supabase.from('banquet_payments') as any)
        .select(`
          id,
          hotel_id,
          banquet_booking_id,
          amount,
          payment_mode,
          payment_type,
          reference_number,
          notes,
          created_at,
          staff:recorded_by (
            full_name
          ),
          booking:banquet_booking_id (
            id,
            booking_number,
            customer_name,
            customer_phone,
            event_name
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (activeHotelId) bq = bq.eq('hotel_id', activeHotelId);
      if (options.paymentMode && options.paymentMode !== 'all') {
        bq = bq.eq('payment_mode', options.paymentMode);
      }
      if (options.paymentType && options.paymentType !== 'all') {
        bq = bq.ilike('payment_type', `%${options.paymentType}%`);
      }
      if (filterStartDate) bq = bq.gte('created_at', filterStartDate);
      if (filterEndDate) bq = bq.lte('created_at', filterEndDate);

      if (options.searchQuery && options.searchQuery.trim()) {
        const s = options.searchQuery.trim();
        bq = bq.or(`reference_number.ilike.%${s}%,notes.ilike.%${s}%`);
      }

      if (options.source === 'banquet') {
        bq = bq.range(from, to);
      } else {
        bq = bq.limit(from + pageSize);
      }

      const { data: rawBanquetPayments, count, error } = await bq;
      if (count !== null && count !== undefined) totalCount += count;

      if (!error && rawBanquetPayments) {
        for (const bp of rawBanquetPayments as any[]) {
          const booking = bp.booking;
          transactions.push({
            id: bp.id,
            hotel_id: bp.hotel_id,
            source: 'banquet',
            source_label: 'Banquet Hall',
            source_id: bp.banquet_booking_id || '',
            reference_number: booking?.booking_number || `HGV-BNQ-${bp.id.slice(0, 8)}`,
            customer_name: booking?.customer_name || 'Banquet Client',
            customer_phone: booking?.customer_phone || '',
            resource_name: 'The Grand Greenery Banquet Hall',
            event_or_details: booking?.event_name || 'Banquet Event',
            amount: Number(bp.amount) || 0,
            payment_mode: (bp.payment_mode as PaymentMode) || 'upi',
            payment_type: (bp.payment_type as string) || 'advance',
            transaction_reference: bp.reference_number || null,
            status: 'successful',
            notes: bp.notes,
            recorded_by: bp.staff?.full_name || 'Staff',
            created_at: bp.created_at || new Date().toISOString(),
            link_url: `/banquet/${bp.banquet_booking_id}`,
          });
        }
      }
    } catch (err) {
      console.error('Error in fetchBanquetPayments:', err);
    }
  };

  // Helper to fetch FB payments
  const fetchFbPayments = async () => {
    if (!shouldFetchFB) return;
    try {
      let fbq = (supabase.from('fb_payments') as any)
        .select(`
          id,
          hotel_id,
          bill_id,
          amount,
          payment_mode,
          payment_type,
          reference_number,
          notes,
          created_at,
          bill:bill_id (
            id,
            bill_number,
            invoice_number,
            customer_name,
            customer_phone,
            room_number_snapshot,
            table_number,
            customer_type,
            bill_status,
            billing_mode
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (activeHotelId) fbq = fbq.eq('hotel_id', activeHotelId);
      if (options.paymentMode && options.paymentMode !== 'all') {
        fbq = fbq.eq('payment_mode', options.paymentMode);
      }
      if (options.paymentType && options.paymentType !== 'all') {
        fbq = fbq.ilike('payment_type', `%${options.paymentType}%`);
      }
      if (filterStartDate) fbq = fbq.gte('created_at', filterStartDate);
      if (filterEndDate) fbq = fbq.lte('created_at', filterEndDate);

      if (options.searchQuery && options.searchQuery.trim()) {
        const s = options.searchQuery.trim();
        fbq = fbq.or(`reference_number.ilike.%${s}%,notes.ilike.%${s}%`);
      }

      if (options.source === 'food_beverage') {
        fbq = fbq.range(from, to);
      } else {
        fbq = fbq.limit(from + pageSize);
      }

      const { data: rawFbPayments, count, error } = await fbq;
      if (count !== null && count !== undefined) totalCount += count;

      if (!error && rawFbPayments) {
        for (const p of rawFbPayments as any[]) {
          const bill = p.bill;
          if (bill && (bill.bill_status === 'void' || bill.bill_status === 'cancelled')) continue;

          const amt = Number(p.amount) || 0;
          if (amt <= 0) continue;

          const roomNum = bill?.room_number_snapshot;
          const resourceName = roomNum
            ? `Room ${roomNum}`
            : bill?.table_number
            ? `Table ${bill.table_number}`
            : bill?.customer_type === 'walk_in'
            ? 'Walk-in Restaurant'
            : 'F&B Restaurant / POS';

          transactions.push({
            id: p.id,
            hotel_id: p.hotel_id,
            source: 'food_beverage',
            source_label: 'Food & Beverage',
            source_id: p.bill_id,
            reference_number: bill?.invoice_number || bill?.bill_number || `HGV-FB-${(p.bill_id || p.id).slice(0, 8)}`,
            customer_name: bill?.customer_name || 'F&B Guest',
            customer_phone: bill?.customer_phone || '',
            resource_name: resourceName,
            event_or_details: 'Food & Beverage Service',
            amount: amt,
            payment_mode: (p.payment_mode as PaymentMode) || 'cash',
            payment_type: (p.payment_type as string) || 'settlement',
            transaction_reference: p.reference_number || null,
            status: 'successful',
            notes: p.notes,
            recorded_by: 'Staff',
            created_at: p.created_at || new Date().toISOString(),
            link_url: `/food-beverage/${p.bill_id}`,
          });
        }
      }
    } catch (err) {
      console.error('Error in fetchFbPayments:', err);
    }
  };

  await Promise.all([fetchRoomPayments(), fetchBanquetPayments(), fetchFbPayments()]);

  // Sort strictly by created_at descending
  transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // If a single source was selected, it was already range-paginated in SQL
  // If merged across all sources, slice from to to
  const pageTransactions = options.source && options.source !== 'all'
    ? transactions
    : transactions.slice(from, to + 1);

  const finalTotal = Math.max(totalCount, transactions.length);
  const totalPages = Math.max(1, Math.ceil(finalTotal / pageSize));

  return {
    data: pageTransactions,
    page,
    pageSize,
    totalCount: finalTotal,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export async function getUnifiedPaymentsLedger(
  hotelId?: string
): Promise<UnifiedPaymentTransaction[]> {
  const staff = await getCurrentStaff();
  const activeHotelId = hotelId || staff?.hotel_id;
  const supabase = createClient();
  const transactions: UnifiedPaymentTransaction[] = [];

  // 1. Fetch Room Payments from `payments` table
  try {
    let q = supabase
      .from('payments')
      .select(`
        *,
        booking:booking_id (
          id,
          booking_number,
          total_amount,
          advance_amount,
          booking_status,
          check_in_date,
          check_out_date,
          guest:guest_id (
            full_name,
            phone
          ),
          room:room_id (
            room_number
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (activeHotelId) {
      q = q.eq('hotel_id', activeHotelId);
    }

    const { data: roomPayments, error: roomErr } = await q;

    if (!roomErr && roomPayments) {
      for (const p of roomPayments as any[]) {
        const roomNum = p.booking?.room?.room_number || 'Room';
        const isBasement = String(roomNum).toLowerCase().includes('family') || String(roomNum).toLowerCase().includes('basement');
        const resourceName = isBasement ? 'Basement Family Suite' : `Room ${roomNum}`;

        transactions.push({
          id: p.id,
          hotel_id: p.hotel_id,
          source: 'rooms',
          source_label: 'Room Booking',
          source_id: p.booking_id,
          reference_number: p.booking?.booking_number || `HGV-${p.id.slice(0, 8)}`,
          customer_name: p.booking?.guest?.full_name || 'Room Guest',
          customer_phone: p.booking?.guest?.phone || '',
          resource_name: resourceName,
          event_or_details: `Accommodation (${p.booking?.check_in_date || 'Stay'} to ${p.booking?.check_out_date || ''})`,
          amount: Number(p.amount) || 0,
          payment_mode: (p.payment_mode as PaymentMode) || 'cash',
          payment_type: (p.payment_type as string) || 'payment',
          transaction_reference: p.notes?.includes('Ref:') ? p.notes.split('Ref:')[1]?.trim() : null,
          status: 'successful',
          notes: p.notes,
          recorded_by: p.recorded_by || 'Staff',
          created_at: p.created_at || new Date().toISOString(),
          link_url: `/billing/${p.booking_id}`,
        });
      }
    }
  } catch (err) {
    console.error('Error fetching room payments for unified ledger:', err);
  }

  // 2. Fetch Banquet Payments directly from `banquet_payments` table with booking join
  try {
    let bq = (supabase.from('banquet_payments') as any)
      .select(`
        id,
        hotel_id,
        banquet_booking_id,
        amount,
        payment_mode,
        payment_type,
        reference_number,
        notes,
        created_at,
        staff:recorded_by (
          full_name
        ),
        booking:banquet_booking_id (
          id,
          booking_number,
          customer_name,
          customer_phone,
          event_name
        )
      `)
      .order('created_at', { ascending: false });

    if (activeHotelId) {
      bq = bq.eq('hotel_id', activeHotelId);
    }

    const { data: rawBanquetPayments, error: bqErr } = await bq;

    if (!bqErr && rawBanquetPayments) {
      for (const bp of rawBanquetPayments as any[]) {
        const booking = bp.booking;

        transactions.push({
          id: bp.id,
          hotel_id: bp.hotel_id,
          source: 'banquet',
          source_label: 'Banquet Hall',
          source_id: bp.banquet_booking_id || '',
          reference_number: booking?.booking_number || `HGV-BNQ-${bp.id.slice(0, 8)}`,
          customer_name: booking?.customer_name || 'Banquet Client',
          customer_phone: booking?.customer_phone || '',
          resource_name: 'The Grand Greenery Banquet Hall',
          event_or_details: booking?.event_name || 'Banquet Event',
          amount: Number(bp.amount) || 0,
          payment_mode: (bp.payment_mode as PaymentMode) || 'upi',
          payment_type: (bp.payment_type as string) || 'advance',
          transaction_reference: bp.reference_number || null,
          status: 'successful',
          notes: bp.notes,
          recorded_by: bp.staff?.full_name || 'Staff',
          created_at: bp.created_at || new Date().toISOString(),
          link_url: `/banquet/${bp.banquet_booking_id}`,
        });
      }
    }
  } catch (err) {
    console.error('Error fetching banquet payments for unified ledger:', err);
  }

  // 3. Fetch Food & Beverage Payments directly from `fb_payments` with bill join
  try {
    let fbq = (supabase.from('fb_payments') as any)
      .select(`
        id,
        hotel_id,
        bill_id,
        amount,
        payment_mode,
        payment_type,
        reference_number,
        notes,
        created_at,
        bill:bill_id (
          id,
          bill_number,
          invoice_number,
          customer_name,
          customer_phone,
          room_number_snapshot,
          table_number,
          customer_type,
          bill_status,
          billing_mode
        )
      `)
      .order('created_at', { ascending: false });

    if (activeHotelId) {
      fbq = fbq.eq('hotel_id', activeHotelId);
    }

    const { data: rawFbPayments, error: fbErr } = await fbq;

    if (!fbErr && rawFbPayments) {
      for (const p of rawFbPayments as any[]) {
        const bill = p.bill;
        // Exclude voided or cancelled bills
        if (bill && (bill.bill_status === 'void' || bill.bill_status === 'cancelled')) continue;

        const amt = Number(p.amount) || 0;
        if (amt <= 0) continue;

        const roomNum = bill?.room_number_snapshot;
        const resourceName = roomNum
          ? `Room ${roomNum}`
          : bill?.table_number
          ? `Table ${bill.table_number}`
          : bill?.customer_type === 'walk_in'
          ? 'Walk-in Restaurant'
          : 'F&B Restaurant / POS';

        transactions.push({
          id: p.id,
          hotel_id: p.hotel_id,
          source: 'food_beverage',
          source_label: 'Food & Beverage',
          source_id: p.bill_id,
          reference_number: bill?.invoice_number || bill?.bill_number || `HGV-FB-${(p.bill_id || p.id).slice(0, 8)}`,
          customer_name: bill?.customer_name || 'F&B Guest',
          customer_phone: bill?.customer_phone || '',
          resource_name: resourceName,
          event_or_details: 'Food & Beverage Service',
          amount: amt,
          payment_mode: (p.payment_mode as PaymentMode) || 'cash',
          payment_type: (p.payment_type as string) || 'settlement',
          transaction_reference: p.reference_number || null,
          status: 'successful',
          notes: p.notes,
          recorded_by: 'Staff',
          created_at: p.created_at || new Date().toISOString(),
          link_url: `/food-beverage/${p.bill_id}`,
        });
      }
    }
  } catch (err) {
    console.error('Error fetching F&B payments for unified ledger:', err);
  }

  // Sort strictly by created_at descending
  transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return transactions;
}

export async function getOutstandingReceivables(
  hotelId?: string
): Promise<OutstandingReceivable[]> {
  const staff = await getCurrentStaff();
  const activeHotelId = hotelId || staff?.hotel_id;
  const supabase = createClient();
  const receivables: OutstandingReceivable[] = [];

  // 1. Room Booking Receivables (SQL filtered: unpaid/partially paid only)
  try {
    let q = supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        total_amount,
        advance_amount,
        booking_status,
        check_in_date,
        check_out_date,
        guest:guest_id (
          full_name,
          phone
        ),
        room:room_id (
          room_number
        ),
        payments:payments (
          amount
        )
      `)
      .neq('booking_status', 'cancelled')
      .neq('payment_status', 'fully_paid');

    if (activeHotelId) q = q.eq('hotel_id', activeHotelId);

    const { data: bookings, error } = await q;

    if (!error && bookings) {
      for (const b of bookings as any[]) {
        const totalBilled = Number(b.total_amount) || 0;
        const totalPaid = (b.payments || []).reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0) || Number(b.advance_amount) || 0;
        const balanceDue = Math.max(0, totalBilled - totalPaid);

        if (balanceDue > 0) {
          const roomNum = b.room?.room_number || 'Room';
          const isBasement = String(roomNum).toLowerCase().includes('family') || String(roomNum).toLowerCase().includes('basement');
          const resourceName = isBasement ? 'Basement Family Suite' : `Room ${roomNum}`;

          receivables.push({
            id: b.id,
            source: 'rooms',
            source_label: 'Room Booking',
            reference_number: b.booking_number,
            customer_name: b.guest?.full_name || 'Guest',
            customer_phone: b.guest?.phone || '',
            resource_name: resourceName,
            event_or_details: `Stay: ${b.check_in_date} – ${b.check_out_date}`,
            total_billed: totalBilled,
            total_paid: totalPaid,
            balance_due: balanceDue,
            date: b.check_out_date || b.check_in_date,
            status: b.booking_status,
            link_url: `/billing/${b.id}`,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching room receivables:', err);
  }

  // 2. Banquet Booking Receivables (SQL filtered: balance_due > 0)
  try {
    let bq = (supabase.from('banquet_bookings') as any)
      .select(`
        id,
        booking_number,
        customer_name,
        customer_phone,
        event_name,
        guest_count,
        grand_total,
        estimated_total,
        rental_amount,
        total_paid,
        advance_paid,
        balance_due,
        event_date,
        booking_status
      `)
      .neq('booking_status', 'cancelled')
      .gt('balance_due', 0)
      .order('balance_due', { ascending: false });

    if (activeHotelId) bq = bq.eq('hotel_id', activeHotelId);

    const { data: banquetBookings, error: bqErr } = await bq;

    if (!bqErr && banquetBookings) {
      for (const bb of banquetBookings as any[]) {
        const totalBilled = Number(bb.grand_total || bb.estimated_total || bb.rental_amount) || 0;
        const totalPaid = Number(bb.total_paid || bb.advance_paid) || 0;
        const balanceDue = Math.max(0, Number(bb.balance_due ?? (totalBilled - totalPaid)));

        if (balanceDue > 0) {
          receivables.push({
            id: bb.id,
            source: 'banquet',
            source_label: 'Banquet Hall',
            reference_number: bb.booking_number,
            customer_name: bb.customer_name,
            customer_phone: bb.customer_phone,
            resource_name: 'The Grand Greenery Banquet Hall',
            event_or_details: `${bb.event_name} (${bb.guest_count || 0} pax)`,
            total_billed: totalBilled,
            total_paid: totalPaid,
            balance_due: balanceDue,
            date: bb.event_date,
            status: bb.booking_status,
            link_url: `/banquet/${bb.id}`,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching banquet receivables:', err);
  }

  // 3. Food & Beverage Receivables (SQL filtered: balance_due > 0, unpaid, not charge_to_room)
  try {
    let fbq = (supabase.from('fb_bills') as any)
      .select(`
        id,
        invoice_number,
        bill_number,
        customer_name,
        customer_phone,
        room_number_snapshot,
        table_number,
        customer_type,
        grand_total,
        total_paid,
        balance_due,
        payment_status,
        created_at
      `)
      .neq('billing_mode', 'charge_to_room')
      .not('bill_status', 'in', '("cancelled","void")')
      .neq('payment_status', 'paid')
      .gt('balance_due', 0)
      .order('balance_due', { ascending: false });

    if (activeHotelId) fbq = fbq.eq('hotel_id', activeHotelId);

    const { data: fbBills, error: fbErr } = await fbq;

    if (!fbErr && fbBills) {
      for (const bill of fbBills as any[]) {
        const totalBilled = Number(bill.grand_total) || 0;
        const totalPaid = Number(bill.total_paid) || 0;
        const balanceDue = Math.max(0, Number(bill.balance_due ?? (totalBilled - totalPaid)));

        if (balanceDue > 0) {
          const roomNum = bill.room_number_snapshot;
          const resourceName = roomNum
            ? `Room ${roomNum}`
            : bill.table_number
            ? `Table ${bill.table_number}`
            : bill.customer_type === 'walk_in'
            ? 'Walk-in Restaurant'
            : 'Restaurant POS';

          receivables.push({
            id: bill.id,
            source: 'food_beverage',
            source_label: 'Food & Beverage',
            reference_number: bill.invoice_number || bill.bill_number || `HGV-FB-${bill.id.slice(0, 8)}`,
            customer_name: bill.customer_name || 'F&B Customer',
            customer_phone: bill.customer_phone || '',
            resource_name: resourceName,
            event_or_details: 'Food & Beverage Order',
            total_billed: totalBilled,
            total_paid: totalPaid,
            balance_due: balanceDue,
            date: bill.created_at ? bill.created_at.split('T')[0] : toDateString(new Date()),
            status: bill.payment_status || 'unpaid',
            link_url: `/food-beverage/${bill.id}`,
          });
        }
      }
    }
  } catch (err) {
    console.error('Error fetching F&B receivables:', err);
  }

  // Sort by highest outstanding balance descending
  receivables.sort((a, b) => b.balance_due - a.balance_due);

  return receivables;
}

export async function getHotelWidePaymentStats(
  hotelId?: string,
  preloadedTransactions?: UnifiedPaymentTransaction[],
  preloadedOutstanding?: OutstandingReceivable[]
): Promise<HotelWidePaymentStats> {
  const transactions = preloadedTransactions || (await getUnifiedPaymentsLedger(hotelId));
  const outstandingItems = preloadedOutstanding || (await getOutstandingReceivables(hotelId));

  const now = new Date();
  const todayStr = toDateString(now);

  // Today's collections
  const todayTransactions = transactions.filter((t) => t.created_at.startsWith(todayStr));
  const todayTotal = todayTransactions.reduce((s, t) => s + t.amount, 0);

  // Overall Period Total
  const periodTotalCollected = transactions.reduce((s, t) => s + t.amount, 0);
  const periodTxCount = transactions.length;

  // Outstanding Balances
  const roomsOutstanding = outstandingItems
    .filter((o) => o.source === 'rooms')
    .reduce((s, o) => s + o.balance_due, 0);

  const banquetOutstanding = outstandingItems
    .filter((o) => o.source === 'banquet')
    .reduce((s, o) => s + o.balance_due, 0);

  const fbOutstanding = outstandingItems
    .filter((o) => o.source === 'food_beverage')
    .reduce((s, o) => s + o.balance_due, 0);

  const totalOutstanding = roomsOutstanding + banquetOutstanding + fbOutstanding;

  // Total Business Value & Collection Rate
  const totalBusinessValue = periodTotalCollected + totalOutstanding;
  const collectionRate =
    totalBusinessValue > 0
      ? Number(((periodTotalCollected / totalBusinessValue) * 100).toFixed(1))
      : 100;

  // Breakdown by Source
  const sourceKeys: PaymentSource[] = ['rooms', 'banquet', 'food_beverage'];
  const sourceLabels: Record<PaymentSource, string> = {
    rooms: 'Rooms Accommodation',
    banquet: 'Banquet & Events',
    food_beverage: 'Food & Beverage',
    other: 'Other Services',
  };

  const sources: SourceMetric[] = sourceKeys.map((k) => {
    const matching = transactions.filter((t) => t.source === k);
    const amt = matching.reduce((s, t) => s + t.amount, 0);
    const count = matching.length;
    const share = periodTotalCollected > 0 ? Number(((amt / periodTotalCollected) * 100).toFixed(1)) : 0;
    return {
      source: k,
      label: sourceLabels[k],
      amount: amt,
      count,
      share_pct: share,
    };
  });

  // Breakdown by Mode
  const modeKeys: PaymentMode[] = ['cash', 'upi', 'card', 'bank_transfer', 'other'];
  const modeLabels: Record<PaymentMode, string> = {
    cash: 'Cash',
    upi: 'UPI (Google Pay / PhonePe / Paytm)',
    card: 'Credit / Debit Card',
    bank_transfer: 'NEFT / RTGS / IMPS',
    other: 'Other Methods',
  };

  const modes: ModeMetric[] = modeKeys.map((k) => {
    const matching = transactions.filter((t) => t.payment_mode === k);
    const amt = matching.reduce((s, t) => s + t.amount, 0);
    const count = matching.length;
    const share = periodTotalCollected > 0 ? Number(((amt / periodTotalCollected) * 100).toFixed(1)) : 0;
    return {
      mode: k,
      label: modeLabels[k],
      amount: amt,
      count,
      share_pct: share,
    };
  });

  // Daily Trend (Last 14 days)
  const trendMap = new Map<string, { rooms: number; banquet: number; fnb: number; count: number }>();

  // Pre-seed last 14 days
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const ds = toDateString(d);
    trendMap.set(ds, { rooms: 0, banquet: 0, fnb: 0, count: 0 });
  }

  for (const t of transactions) {
    const d = t.created_at.split('T')[0];
    if (trendMap.has(d)) {
      const entry = trendMap.get(d)!;
      entry.count += 1;
      if (t.source === 'rooms') entry.rooms += t.amount;
      else if (t.source === 'banquet') entry.banquet += t.amount;
      else if (t.source === 'food_beverage') entry.fnb += t.amount;
    }
  }

  const trend: CollectionTrendDay[] = Array.from(trendMap.entries()).map(([d, val]) => {
    const dateObj = new Date(d);
    const label = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const total = val.rooms + val.banquet + val.fnb;
    return {
      date: d,
      date_label: label,
      total,
      rooms: val.rooms,
      banquet: val.banquet,
      fnb: val.fnb,
      count: val.count,
    };
  });

  return {
    today_total: todayTotal,
    today_tx_count: todayTransactions.length,
    period_total_collected: periodTotalCollected,
    period_tx_count: periodTxCount,
    total_outstanding_receivables: totalOutstanding,
    rooms_outstanding: roomsOutstanding,
    banquet_outstanding: banquetOutstanding,
    fb_outstanding: fbOutstanding,
    total_business_value: totalBusinessValue,
    collection_rate_percent: collectionRate,
    sources,
    modes,
    trend,
    outstanding_items: outstandingItems,
  };
}
