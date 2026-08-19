import { createClient } from '../supabase/server';
import { localRoomsStore } from '../rooms/queries';
import { localBookingsStore, localPaymentsStore, BookingWithDetails } from '../bookings/queries';
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

  try {
    const supabase = createClient();

    // 1. Query rooms
    const { data: dbRooms } = await supabase.from('rooms').select('status, housekeeping_status');
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
    const { data: dbBookings } = await supabase
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

    const { data: dbTodayPayments } = await supabase
      .from('payments')
      .select('*')
      .gte('created_at', todayStart)
      .lte('created_at', todayEnd);

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

    if (roomsList.length > 0) {
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
    }
  } catch (err) {
    console.error('Error fetching dashboard stats from Supabase:', err);
  }

  // Fallback to local store
  const rooms = {
    available: localRoomsStore.filter((r) => r.status === 'available').length,
    occupied: localRoomsStore.filter((r) => r.status === 'occupied').length,
    reserved: localRoomsStore.filter((r) => r.status === 'reserved').length,
    cleaning: localRoomsStore.filter((r) => r.status === 'cleaning').length,
    maintenance: localRoomsStore.filter((r) => r.status === 'maintenance').length,
    total: localRoomsStore.length,
  };

  const arrivals = localBookingsStore.filter(
    (b) => b.check_in_date === today && (b.booking_status === 'confirmed' || b.booking_status === 'checked_in')
  );

  const departures = localBookingsStore.filter(
    (b) => b.check_out_date === today && b.booking_status === 'checked_in'
  );

  const todayPayments = localPaymentsStore.filter((p) => p.created_at.startsWith(today));
  const todayCollection = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  const collectionByMode: Record<PaymentMode, number> = {
    cash: 0,
    upi: 0,
    card: 0,
    bank_transfer: 0,
    other: 0,
  };
  todayPayments.forEach((p) => {
    collectionByMode[p.payment_mode] = (collectionByMode[p.payment_mode] || 0) + p.amount;
  });

  const activeBookings = localBookingsStore.filter(
    (b) => b.booking_status === 'confirmed' || b.booking_status === 'checked_in'
  );
  const totalPaidByBooking: Record<string, number> = {};
  localPaymentsStore.forEach((p) => {
    totalPaidByBooking[p.booking_id] = (totalPaidByBooking[p.booking_id] || 0) + p.amount;
  });

  let totalBalance = 0;
  let bookingCount = 0;
  activeBookings.forEach((b) => {
    const paid = totalPaidByBooking[b.id] || 0;
    const balance = Math.max(0, b.total_amount - paid);
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
      collection: todayCollection,
      collectionByMode,
    },
    pending: {
      totalBalance,
      bookingCount,
    },
    cleaningNeeded: rooms.cleaning,
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

  try {
    const supabase = createClient();
    const startIso = `${targetDate}T00:00:00.000Z`;
    const endIso = `${targetDate}T23:59:59.999Z`;

    // 1. Fetch payments on this day
    const { data: dbPayments } = await supabase
      .from('payments')
      .select('*')
      .gte('created_at', startIso)
      .lte('created_at', endIso);

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
    const { data: dbBookings } = await supabase
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

  // Fallback to local store
  const payments = localPaymentsStore.filter((p) => p.created_at.startsWith(targetDate));
  const collection = payments.reduce((sum, p) => sum + p.amount, 0);

  const collectionByMode: Record<PaymentMode, number> = {
    cash: 0, upi: 0, card: 0, bank_transfer: 0, other: 0,
  };
  payments.forEach((p) => {
    collectionByMode[p.payment_mode] = (collectionByMode[p.payment_mode] || 0) + p.amount;
  });

  const arrivals = localBookingsStore.filter((b) => b.check_in_date === targetDate);
  const departures = localBookingsStore.filter((b) => b.check_out_date === targetDate);
  const checkedOut = departures.filter((b) => b.booking_status === 'checked_out');

  const totalPaidByBooking: Record<string, number> = {};
  localPaymentsStore.forEach((p) => {
    totalPaidByBooking[p.booking_id] = (totalPaidByBooking[p.booking_id] || 0) + p.amount;
  });

  let pendingBalance = 0;
  let pendingCount = 0;
  arrivals.forEach((b) => {
    const paid = totalPaidByBooking[b.id] || 0;
    const bal = Math.max(0, b.total_amount - paid);
    if (bal > 0) {
      pendingBalance += bal;
      pendingCount++;
    }
  });

  return {
    date: targetDate,
    collection,
    collectionByMode,
    transactionCount: payments.length,
    arrivals,
    departures,
    checkedOut,
    pendingBalance,
    pendingCount,
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

  try {
    const supabase = createClient();

    // 1. Fetch total rooms
    const { data: dbRooms } = await supabase.from('rooms').select('id');
    const totalRooms = dbRooms && dbRooms.length > 0 ? dbRooms.length : 19;

    // 2. Fetch bookings for this month
    const startOfMonth = `${prefix}-01`;
    const endOfMonth = `${prefix}-${String(daysInMonth).padStart(2, '0')}`;

    const { data: dbBookings } = await supabase
      .from('bookings')
      .select(`
        *,
        payments:payments (*)
      `)
      .gte('check_in_date', startOfMonth)
      .lte('check_in_date', endOfMonth);

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
    const { data: dbPayments } = await supabase
      .from('payments')
      .select('amount, payment_type')
      .gte('created_at', `${startOfMonth}T00:00:00.000Z`)
      .lte('created_at', `${endOfMonth}T23:59:59.999Z`);

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

  // Fallback to local store
  const totalRooms = localRoomsStore.length;
  const monthBookings = localBookingsStore.filter((b) => b.check_in_date.startsWith(prefix));

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
    totalRevenue += b.total_amount;
  });

  const totalPaidByBooking: Record<string, number> = {};
  localPaymentsStore
    .filter((p) => p.created_at.startsWith(prefix))
    .forEach((p) => {
      totalPaidByBooking[p.booking_id] = (totalPaidByBooking[p.booking_id] || 0) + p.amount;
    });
  const totalCollected = Object.values(totalPaidByBooking).reduce((sum, v) => sum + v, 0);
  const totalPending = Math.max(0, totalRevenue - totalCollected);

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
    totalCollected,
    totalPending,
    occupancyPercent,
    adr,
    revpar,
    totalRooms,
    daysInMonth,
  };
}

