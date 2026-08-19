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

export const DEFAULT_BOOKINGS: BookingWithDetails[] = [];

export let localBookingsStore: BookingWithDetails[] = [];
export let localPaymentsStore: PaymentRecord[] = [];


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

