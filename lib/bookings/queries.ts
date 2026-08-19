import { createClient } from '../supabase/server';
import {
  BookingStatus,
  PaymentStatus,
  BookingSource,
  PaymentMode,
  PaymentType,
} from '../types/database.types';
import { Guest, DEFAULT_GUESTS } from '../guests/queries';
import { RoomWithCategory, DEFAULT_ROOMS } from '../rooms/queries';

export interface PaymentRecord {
  id: string;
  hotel_id: string;
  booking_id: string;
  amount: number;
  payment_mode: PaymentMode;
  payment_type: PaymentType;
  notes: string | null;
  recorded_by?: string | null;
  created_at: string;
}

export interface BookingWithDetails {
  id: string;
  hotel_id: string;
  booking_number: string;
  room_id: string;
  guest_id: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  rate_per_night: number;
  total_amount: number;
  advance_amount: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  source: BookingSource;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  guest: Guest;
  room: RoomWithCategory;
  payments: PaymentRecord[];
}

export const DEFAULT_BOOKINGS: BookingWithDetails[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    booking_number: 'HGV-202608-1001',
    room_id: 'd0000000-0000-0000-0000-000000000103', // Room 103 (Occupied)
    guest_id: 'e0000000-0000-0000-0000-000000000001',
    check_in_date: '2026-08-17',
    check_out_date: '2026-08-20',
    adults: 2,
    children: 0,
    rate_per_night: 2500,
    total_amount: 7500,
    advance_amount: 3000,
    payment_status: 'advance_received',
    booking_status: 'checked_in',
    source: 'walk_in',
    remarks: 'Requested high floor next time',
    created_at: '2026-08-17T12:30:00.000Z',
    updated_at: '2026-08-17T13:00:00.000Z',
    guest: DEFAULT_GUESTS[0],
    room: DEFAULT_ROOMS[2],
    payments: [
      {
        id: 'p0000000-0000-0000-0000-000000000001',
        hotel_id: 'a0000000-0000-0000-0000-000000000001',
        booking_id: 'e0000000-0000-0000-0000-000000000001',
        amount: 3000,
        payment_mode: 'upi',
        payment_type: 'advance',
        notes: 'Advance received via GPay',
        created_at: '2026-08-17T12:30:00.000Z',
      },
    ],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    booking_number: 'HGV-202608-1002',
    room_id: 'd0000000-0000-0000-0000-000000000202', // Room 202 (Arriving Today)
    guest_id: 'e0000000-0000-0000-0000-000000000002',
    check_in_date: '2026-08-18',
    check_out_date: '2026-08-21',
    adults: 1,
    children: 0,
    rate_per_night: 3500,
    total_amount: 10500,
    advance_amount: 10500,
    payment_status: 'fully_paid',
    booking_status: 'confirmed',
    source: 'direct',
    remarks: 'Arriving by train around 2 PM',
    created_at: '2026-08-15T10:00:00.000Z',
    updated_at: '2026-08-15T10:00:00.000Z',
    guest: DEFAULT_GUESTS[1],
    room: DEFAULT_ROOMS[5],
    payments: [
      {
        id: 'p0000000-0000-0000-0000-000000000002',
        hotel_id: 'a0000000-0000-0000-0000-000000000001',
        booking_id: 'e0000000-0000-0000-0000-000000000002',
        amount: 10500,
        payment_mode: 'bank_transfer',
        payment_type: 'advance',
        notes: 'Full prepayment via IMPS',
        created_at: '2026-08-15T10:00:00.000Z',
      },
    ],
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    booking_number: 'HGV-202608-1003',
    room_id: 'd0000000-0000-0000-0000-000000000203', // Room 203 (Reserved)
    guest_id: 'e0000000-0000-0000-0000-000000000003',
    check_in_date: '2026-08-20',
    check_out_date: '2026-08-23',
    adults: 3,
    children: 1,
    rate_per_night: 3500,
    total_amount: 12600, // 3 nights + extra bed
    advance_amount: 2000,
    payment_status: 'advance_received',
    booking_status: 'confirmed',
    source: 'whatsapp',
    remarks: 'Need extra mattress for child',
    created_at: '2026-08-16T15:00:00.000Z',
    updated_at: '2026-08-16T15:00:00.000Z',
    guest: DEFAULT_GUESTS[2],
    room: DEFAULT_ROOMS[6],
    payments: [
      {
        id: 'p0000000-0000-0000-0000-000000000003',
        hotel_id: 'a0000000-0000-0000-0000-000000000001',
        booking_id: 'e0000000-0000-0000-0000-000000000003',
        amount: 2000,
        payment_mode: 'upi',
        payment_type: 'advance',
        notes: 'WhatsApp booking advance',
        created_at: '2026-08-16T15:00:00.000Z',
      },
    ],
  },
];

export let localBookingsStore: BookingWithDetails[] = [...DEFAULT_BOOKINGS];
export let localPaymentsStore: PaymentRecord[] = [
  ...DEFAULT_BOOKINGS.flatMap((b) => b.payments),
];

export async function getBookings(
  hotelId?: string,
  statusFilter?: string,
  searchQuery?: string
): Promise<BookingWithDetails[]> {
  try {
    const supabase = createClient();
    let q = supabase
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
      .order('check_in_date', { ascending: false });

    if (hotelId) q = q.eq('hotel_id', hotelId);
    if (statusFilter && statusFilter !== 'all') {
      q = q.eq('booking_status', statusFilter);
    }

    const { data, error } = await q;
    if (error) {
      console.error('Error fetching bookings from Supabase:', error.message);
      return localBookingsStore;
    }
    if (data && data.length > 0) {
      let result = data as BookingWithDetails[];
      if (searchQuery && searchQuery.trim()) {
        const s = searchQuery.trim().toLowerCase();
        result = result.filter(
          (b) =>
            b.booking_number?.toLowerCase().includes(s) ||
            b.guest?.full_name?.toLowerCase().includes(s) ||
            b.guest?.phone?.toLowerCase().includes(s) ||
            b.room?.room_number?.toLowerCase().includes(s)
        );
      }
      return result;
    }

  } catch (err) {
    console.error('Failed to connect to Supabase for bookings:', err);
  }

  let result = [...localBookingsStore];
  if (statusFilter && statusFilter !== 'all') {
    result = result.filter((b) => b.booking_status === statusFilter);
  }
  if (searchQuery && searchQuery.trim()) {
    const s = searchQuery.trim().toLowerCase();
    result = result.filter(
      (b) =>
        b.booking_number.toLowerCase().includes(s) ||
        b.guest.full_name.toLowerCase().includes(s) ||
        b.guest.phone.toLowerCase().includes(s) ||
        b.room.room_number.toLowerCase().includes(s)
    );
  }
  return result;
}

export async function getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
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
      .eq('id', bookingId)
      .single();

    if (error) {
      console.error(`Error fetching booking ${bookingId} from Supabase:`, error.message);
      return localBookingsStore.find((b) => b.id === bookingId) || null;
    }
    if (data) {
      return data as BookingWithDetails;
    }
  } catch (err) {
    console.error(`Failed to connect to Supabase for booking ${bookingId}:`, err);
  }

  return localBookingsStore.find((b) => b.id === bookingId) || null;
}

