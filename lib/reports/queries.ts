import { localRoomsStore } from '../rooms/queries';
import { localBookingsStore, localPaymentsStore, BookingWithDetails } from '../bookings/queries';
import { PaymentMode } from '../types/database.types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function toLocalDateStr(isoStr: string): string {
  // Returns YYYY-MM-DD in local time
  return new Date(isoStr).toISOString().split('T')[0];
}

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

  // Room counts
  const rooms = {
    available: localRoomsStore.filter((r) => r.status === 'available').length,
    occupied: localRoomsStore.filter((r) => r.status === 'occupied').length,
    reserved: localRoomsStore.filter((r) => r.status === 'reserved').length,
    cleaning: localRoomsStore.filter((r) => r.status === 'cleaning').length,
    maintenance: localRoomsStore.filter((r) => r.status === 'maintenance').length,
    total: localRoomsStore.length,
  };

  // Today's arrivals: check_in_date = today, status = confirmed or checked_in
  const arrivals = localBookingsStore.filter(
    (b) => b.check_in_date === today && (b.booking_status === 'confirmed' || b.booking_status === 'checked_in')
  );

  // Today's departures: check_out_date = today, status = checked_in
  const departures = localBookingsStore.filter(
    (b) => b.check_out_date === today && b.booking_status === 'checked_in'
  );

  // Today's payments
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

  // Pending balance across active bookings (not cancelled/checked_out)
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
  const payments = localPaymentsStore.filter((p) => p.created_at.startsWith(date));
  const collection = payments.reduce((sum, p) => sum + p.amount, 0);

  const collectionByMode: Record<PaymentMode, number> = {
    cash: 0, upi: 0, card: 0, bank_transfer: 0, other: 0,
  };
  payments.forEach((p) => {
    collectionByMode[p.payment_mode] = (collectionByMode[p.payment_mode] || 0) + p.amount;
  });

  const arrivals = localBookingsStore.filter((b) => b.check_in_date === date);
  const departures = localBookingsStore.filter((b) => b.check_out_date === date);
  const checkedOut = departures.filter((b) => b.booking_status === 'checked_out');

  // Pending balance for this day's arrivals
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
    date,
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
  const totalRooms = localRoomsStore.length;

  // Bookings that have check-in during this month
  const monthBookings = localBookingsStore.filter(
    (b) => b.check_in_date.startsWith(prefix)
  );

  const confirmedBookings = monthBookings.filter(
    (b) => b.booking_status === 'confirmed' || b.booking_status === 'checked_in'
  ).length;
  const checkedOutBookings = monthBookings.filter((b) => b.booking_status === 'checked_out').length;
  const cancelledBookings = monthBookings.filter((b) => b.booking_status === 'cancelled').length;

  // Room nights: sum of nights for non-cancelled bookings in this month
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

  // Payments in this month
  const totalPaidByBooking: Record<string, number> = {};
  localPaymentsStore
    .filter((p) => p.created_at.startsWith(prefix))
    .forEach((p) => {
      totalPaidByBooking[p.booking_id] = (totalPaidByBooking[p.booking_id] || 0) + p.amount;
    });
  const totalCollected = Object.values(totalPaidByBooking).reduce((sum, v) => sum + v, 0);
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
    totalCollected,
    totalPending,
    occupancyPercent,
    adr,
    revpar,
    totalRooms,
    daysInMonth,
  };
}
