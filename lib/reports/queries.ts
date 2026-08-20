import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { BookingWithDetails } from '../bookings/queries';
import { PaymentMode } from '../types/database.types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  rooms: {
    available: number;
    occupied: number;
    reserved: number;
    cleaning: number;
    maintenance: number;
    total: number;
  };
  today: {
    arrivals: BookingWithDetails[];
    departures: BookingWithDetails[];
    collection: number;
    collectionByMode: Record<PaymentMode, number>;
  };
  pending: {
    totalBalance: number;
    bookingCount: number;
  };
  cleaningNeeded: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = todayStr();
  const staff = await getCurrentStaff();
  const hotelId = staff?.hotel_id;

  try {
    const supabase = createClient();

    // 1. Query rooms
    let roomQuery = supabase.from('rooms').select('status, housekeeping_status');
    if (hotelId) roomQuery = roomQuery.eq('hotel_id', hotelId);
    const { data: dbRooms } = await roomQuery;
    const roomsList = dbRooms || [];

    const rooms = {
      available: roomsList.filter((r: any) => r.status === 'available').length,
      occupied: roomsList.filter((r: any) => r.status === 'occupied').length,
      reserved: roomsList.filter((r: any) => r.status === 'reserved').length,
      cleaning: roomsList.filter((r: any) => r.status === 'cleaning').length,
      maintenance: roomsList.filter((r: any) => r.status === 'maintenance').length,
      total: roomsList.length,
    };

    // 2. Query today's arrivals & departures
    let bookingQuery = supabase
      .from('bookings')
      .select(`
        *,
        guest:guest_id (*),
        room:room_id (
          *,
          category:category_id (*)
        ),
        payments:payments (*)
      `);

    if (hotelId) bookingQuery = bookingQuery.eq('hotel_id', hotelId);
    const { data: dbBookings } = await bookingQuery;

    const allBookings = (dbBookings || []) as BookingWithDetails[];

    const arrivals = allBookings.filter(
      (b) => b.check_in_date === today && (b.booking_status === 'confirmed' || b.booking_status === 'checked_in')
    );

    const departures = allBookings.filter(
      (b) => b.check_out_date === today && b.booking_status === 'checked_in'
    );

    // 3. Query today's payments
    const todayStart = `${today}T00:00:00.000Z`;
    const todayEnd = `${today}T23:59:59.999Z`;

    let paymentQuery = supabase
      .from('payments')
      .select('*')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd);

    if (hotelId) paymentQuery = paymentQuery.eq('hotel_id', hotelId);
    const { data: dbTodayPayments } = await paymentQuery;

    const todayPayments = dbTodayPayments || [];
    const todayCollection = todayPayments.reduce((sum: number, p: any) => {
      const amt = Number(p.amount) || 0;
      return p.payment_type === 'refund' ? sum - amt : sum + amt;
    }, 0);

    const collectionByMode: Record<PaymentMode, number> = {
      cash: 0,
      upi: 0,
      card: 0,
      bank_transfer: 0,
      other: 0,
    };
    todayPayments.forEach((p: any) => {
      const mode = (p.payment_mode || 'other') as PaymentMode;
      const amt = Number(p.amount) || 0;
      if (collectionByMode[mode] !== undefined) {
        collectionByMode[mode] += p.payment_type === 'refund' ? -amt : amt;
      }
    });

    // 4. Calculate pending balances on active bookings
    const activeBookings = allBookings.filter(
      (b) => b.booking_status === 'confirmed' || b.booking_status === 'checked_in'
    );

    let totalBalance = 0;
    let bookingCount = 0;

    activeBookings.forEach((b) => {
      const paymentsList = b.payments || [];
      const paid = paymentsList.reduce((sum: number, p: any) => {
        const amt = Number(p.amount) || 0;
        return p.payment_type === 'refund' ? sum - amt : sum + amt;
      }, 0);

      const balance = Math.max(0, Number(b.total_amount) - paid);
      if (balance > 0) {
        totalBalance += balance;
        bookingCount++;
      }
    });

    return {
      rooms,
      today: {
        arrivals,
        departures,
        collection: Math.max(0, todayCollection),
        collectionByMode,
      },
      pending: {
        totalBalance,
        bookingCount,
      },
      cleaningNeeded: rooms.cleaning,
    };
  } catch (err) {
    console.error('Error fetching dashboard stats from Supabase:', err);
  }

  return {
    rooms: { available: 0, occupied: 0, reserved: 0, cleaning: 0, maintenance: 0, total: 0 },
    today: {
      arrivals: [],
      departures: [],
      collection: 0,
      collectionByMode: { cash: 0, upi: 0, card: 0, bank_transfer: 0, other: 0 },
    },
    pending: { totalBalance: 0, bookingCount: 0 },
    cleaningNeeded: 0,
  };
}

// ─── Daily Report ─────────────────────────────────────────────────────────────

export interface DailyReport {
  date: string;
  collection: number;
  collectionByMode: Record<PaymentMode, number>;
  transactionCount: number;
  arrivals: BookingWithDetails[];
  departures: BookingWithDetails[];
  checkedOut: BookingWithDetails[];
  pendingBalance: number;
  pendingCount: number;
}

export async function getDailyReport(date: string): Promise<DailyReport> {
  const targetDate = date || todayStr();
  const staff = await getCurrentStaff();
  const hotelId = staff?.hotel_id;

  try {
    const supabase = createClient();
    const startIso = `${targetDate}T00:00:00.000Z`;
    const endIso = `${targetDate}T23:59:59.999Z`;

    // 1. Fetch payments on this day
    let payQuery = supabase
      .from('payments')
      .select('*')
      .gte('created_at', startIso)
      .lte('created_at', endIso);

    if (hotelId) payQuery = payQuery.eq('hotel_id', hotelId);
    const { data: dbPayments } = await payQuery;

    const payments = dbPayments || [];
    const collection = payments.reduce((sum: number, p: any) => {
      const amt = Number(p.amount) || 0;
      return p.payment_type === 'refund' ? sum - amt : sum + amt;
    }, 0);

    const collectionByMode: Record<PaymentMode, number> = {
      cash: 0, upi: 0, card: 0, bank_transfer: 0, other: 0,
    };
    payments.forEach((p: any) => {
      const mode = (p.payment_mode || 'other') as PaymentMode;
      const amt = Number(p.amount) || 0;
      if (collectionByMode[mode] !== undefined) {
        collectionByMode[mode] += p.payment_type === 'refund' ? -amt : amt;
      }
    });

    // 2. Fetch bookings for this day
    let bookQuery = supabase
      .from('bookings')
      .select(`
        *,
        guest:guest_id (*),
        room:room_id (
          *,
          category:category_id (*)
        ),
        payments:payments (*)
      `)
      .or(`check_in_date.eq.${targetDate},check_out_date.eq.${targetDate}`);

    if (hotelId) bookQuery = bookQuery.eq('hotel_id', hotelId);
    const { data: dbBookings } = await bookQuery;

    const bookings = (dbBookings || []) as BookingWithDetails[];

    const arrivals = bookings.filter((b) => b.check_in_date === targetDate);
    const departures = bookings.filter((b) => b.check_out_date === targetDate);
    const checkedOut = departures.filter((b) => b.booking_status === 'checked_out');

    let pendingBalance = 0;
    let pendingCount = 0;
    arrivals.forEach((b) => {
      const paymentsList = b.payments || [];
      const paid = paymentsList.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
      const bal = Math.max(0, Number(b.total_amount) - paid);
      if (bal > 0) {
        pendingBalance += bal;
        pendingCount++;
      }
    });

    return {
      date: targetDate,
      collection: Math.max(0, collection),
      collectionByMode,
      transactionCount: payments.length,
      arrivals,
      departures,
      checkedOut,
      pendingBalance,
      pendingCount,
    };
  } catch (err) {
    console.error('Error fetching daily report from Supabase:', err);
  }

  return {
    date: targetDate,
    collection: 0,
    collectionByMode: { cash: 0, upi: 0, card: 0, bank_transfer: 0, other: 0 },
    transactionCount: 0,
    arrivals: [],
    departures: [],
    checkedOut: [],
    pendingBalance: 0,
    pendingCount: 0,
  };
}

// ─── Monthly Report ───────────────────────────────────────────────────────────

export interface MonthlyReport {
  year: number;
  month: number; // 1–12
  totalBookings: number;
  confirmedBookings: number;
  checkedOutBookings: number;
  cancelledBookings: number;
  roomNightsSold: number;
  totalRevenue: number;
  totalCollected: number;
  totalPending: number;
  occupancyPercent: number; // 0–100
  adr: number;              // Average Daily Rate
  revpar: number;           // Revenue Per Available Room
  totalRooms: number;
  daysInMonth: number;
}

export async function getMonthlyReport(year: number, month: number): Promise<MonthlyReport> {
  const paddedMonth = String(month).padStart(2, '0');
  const prefix = `${year}-${paddedMonth}`;
  const daysInMonth = new Date(year, month, 0).getDate();
  const staff = await getCurrentStaff();
  const hotelId = staff?.hotel_id;

  try {
    const supabase = createClient();

    // 1. Fetch total rooms
    let roomsQuery = supabase.from('rooms').select('id');
    if (hotelId) roomsQuery = roomsQuery.eq('hotel_id', hotelId);
    const { data: dbRooms } = await roomsQuery;
    const totalRooms = dbRooms && dbRooms.length > 0 ? dbRooms.length : 19;

    // 2. Fetch bookings for this month
    const startOfMonth = `${prefix}-01`;
    const endOfMonth = `${prefix}-${String(daysInMonth).padStart(2, '0')}`;

    let bQuery = supabase
      .from('bookings')
      .select(`
        *,
        payments:payments (*)
      `)
      .gte('check_in_date', startOfMonth)
      .lte('check_in_date', endOfMonth);

    if (hotelId) bQuery = bQuery.eq('hotel_id', hotelId);
    const { data: dbBookings } = await bQuery;

    const monthBookings = (dbBookings || []) as BookingWithDetails[];

    const confirmedBookings = monthBookings.filter(
      (b) => b.booking_status === 'confirmed' || b.booking_status === 'checked_in'
    ).length;
    const checkedOutBookings = monthBookings.filter((b) => b.booking_status === 'checked_out').length;
    const cancelledBookings = monthBookings.filter((b) => b.booking_status === 'cancelled').length;

    let roomNightsSold = 0;
    let totalRevenue = 0;
    const activeBookings = monthBookings.filter((b) => b.booking_status !== 'cancelled');

    activeBookings.forEach((b) => {
      const checkIn = new Date(b.check_in_date);
      const checkOut = new Date(b.check_out_date);
      const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)));
      roomNightsSold += nights;
      totalRevenue += Number(b.total_amount) || 0;
    });

    // 3. Fetch payments created this month
    let pQuery = supabase
      .from('payments')
      .select('amount, payment_type')
      .gte('created_at', `${startOfMonth}T00:00:00.000Z`)
      .lte('created_at', `${endOfMonth}T23:59:59.999Z`);

    if (hotelId) pQuery = pQuery.eq('hotel_id', hotelId);
    const { data: dbPayments } = await pQuery;

    const totalCollected = (dbPayments || []).reduce((sum: number, p: any) => {
      const amt = Number(p.amount) || 0;
      return p.payment_type === 'refund' ? sum - amt : sum + amt;
    }, 0);

    const totalPending = Math.max(0, totalRevenue - totalCollected);

    // KPI formulas
    const availableRoomNights = totalRooms * daysInMonth;
    const occupancyPercent = availableRoomNights > 0
      ? Math.round((roomNightsSold / availableRoomNights) * 100 * 10) / 10
      : 0;
    const adr = roomNightsSold > 0 ? Math.round(totalRevenue / roomNightsSold) : 0;
    const revpar = Math.round(adr * (occupancyPercent / 100));

    return {
      year,
      month,
      totalBookings: monthBookings.length,
      confirmedBookings,
      checkedOutBookings,
      cancelledBookings,
      roomNightsSold,
      totalRevenue,
      totalCollected: Math.max(0, totalCollected),
      totalPending,
      occupancyPercent,
      adr,
      revpar,
      totalRooms,
      daysInMonth,
    };
  } catch (err) {
    console.error('Error fetching monthly report from Supabase:', err);
  }

  return {
    year,
    month,
    totalBookings: 0,
    confirmedBookings: 0,
    checkedOutBookings: 0,
    cancelledBookings: 0,
    roomNightsSold: 0,
    totalRevenue: 0,
    totalCollected: 0,
    totalPending: 0,
    occupancyPercent: 0,
    adr: 0,
    revpar: 0,
    totalRooms: 19,
    daysInMonth,
  };
}
