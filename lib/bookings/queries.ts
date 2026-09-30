import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import {
  BookingStatus,
  PaymentStatus,
  BookingSource,
  PaymentMode,
  PaymentType,
} from '../types/database.types';
import { Guest } from '../guests/queries';
import { RoomWithCategory } from '../rooms/queries';
import { PaginatedResult } from '../types/pagination';

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

export interface GetBookingsOptions {
  hotelId?: string;
  statusFilter?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'check_in_date' | 'check_out_date' | 'created_at' | 'total_amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  guestId?: string;
  limit?: number;
}

export async function getBookingsPaginated(
  options: GetBookingsOptions = {}
): Promise<PaginatedResult<BookingWithDetails>> {
  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.max(1, Number(options.pageSize) || 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const staff = await getCurrentStaff();
    const activeHotelId = options.hotelId || staff?.hotel_id;
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
      `, { count: 'exact' });

    // 1. Hotel filtering (PostgreSQL)
    if (activeHotelId) {
      q = q.eq('hotel_id', activeHotelId);
    }

    // 2. Guest filtering (PostgreSQL)
    if (options.guestId) {
      q = q.eq('guest_id', options.guestId);
    }

    // 3. Status filtering (PostgreSQL)
    if (options.statusFilter && options.statusFilter !== 'all') {
      q = q.eq('booking_status', options.statusFilter);
    }

    // 4. Date filtering (PostgreSQL)
    if (options.startDate) {
      q = q.gte('check_in_date', options.startDate);
    }
    if (options.endDate) {
      q = q.lte('check_in_date', options.endDate);
    }

    // 5. Search filtering (PostgreSQL-level pushdown)
    if (options.searchQuery && options.searchQuery.trim()) {
      const s = options.searchQuery.trim();

      let guestSearchQ = supabase.from('guests').select('id').or(`full_name.ilike.%${s}%,phone.ilike.%${s}%`);
      if (activeHotelId) guestSearchQ = guestSearchQ.eq('hotel_id', activeHotelId);

      let roomSearchQ = supabase.from('rooms').select('id').ilike('room_number', `%${s}%`);
      if (activeHotelId) roomSearchQ = roomSearchQ.eq('hotel_id', activeHotelId);

      const [guestMatchRes, roomMatchRes] = await Promise.all([guestSearchQ, roomSearchQ]);
      const matchedGuestIds = (guestMatchRes.data || []).map((g: any) => g.id);
      const matchedRoomIds = (roomMatchRes.data || []).map((r: any) => r.id);

      const orParts: string[] = [`booking_number.ilike.%${s}%`];
      if (matchedGuestIds.length > 0) {
        orParts.push(`guest_id.in.(${matchedGuestIds.join(',')})`);
      }
      if (matchedRoomIds.length > 0) {
        orParts.push(`room_id.in.(${matchedRoomIds.join(',')})`);
      }
      q = q.or(orParts.join(','));
    }

    // 6. Sorting (PostgreSQL)
    const sortBy = options.sortBy || 'check_in_date';
    const ascending = options.sortOrder === 'asc';
    q = q.order(sortBy, { ascending });

    // 7. Pagination Range (PostgreSQL)
    q = q.range(from, to);

    const { data, count, error } = await q;
    if (error) {
      console.error('Error fetching paginated bookings from Supabase:', error.message);
      return {
        data: [],
        page,
        pageSize,
        totalCount: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: page > 1,
      };
    }

    const totalCount = count ?? (data?.length || 0);
    const totalPages = count !== null ? Math.max(1, Math.ceil(count / pageSize)) : 1;

    return {
      data: (data || []) as BookingWithDetails[],
      page,
      pageSize,
      totalCount: count,
      totalPages,
      hasNextPage: totalPages !== null ? page < totalPages : (data || []).length === pageSize,
      hasPrevPage: page > 1,
    };
  } catch (err) {
    console.error('Failed to connect to Supabase for paginated bookings:', err);
    return {
      data: [],
      page,
      pageSize,
      totalCount: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: page > 1,
    };
  }
}

export async function getBookings(
  hotelIdOrOptions?: string | GetBookingsOptions,
  statusFilterParam?: string,
  searchQueryParam?: string
): Promise<BookingWithDetails[]> {
  try {
    const opts: GetBookingsOptions =
      typeof hotelIdOrOptions === 'object' && hotelIdOrOptions !== null
        ? hotelIdOrOptions
        : {
            hotelId: hotelIdOrOptions,
            statusFilter: statusFilterParam,
            searchQuery: searchQueryParam,
          };

    const staff = await getCurrentStaff();
    const activeHotelId = opts.hotelId || staff?.hotel_id;

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
      `);

    // 1. Hotel filtering (PostgreSQL)
    if (activeHotelId) {
      q = q.eq('hotel_id', activeHotelId);
    }

    // 2. Guest filtering (PostgreSQL)
    if (opts.guestId) {
      q = q.eq('guest_id', opts.guestId);
    }

    // 3. Status filtering (PostgreSQL)
    if (opts.statusFilter && opts.statusFilter !== 'all') {
      q = q.eq('booking_status', opts.statusFilter);
    }

    // 4. Date filtering (PostgreSQL)
    if (opts.startDate) {
      q = q.gte('check_in_date', opts.startDate);
    }
    if (opts.endDate) {
      q = q.lte('check_in_date', opts.endDate);
    }

    // 5. Search filtering (PostgreSQL-level pushdown)
    if (opts.searchQuery && opts.searchQuery.trim()) {
      const s = opts.searchQuery.trim();

      // Resolve matching guest and room IDs in PostgreSQL to leverage indexes
      let guestSearchQ = supabase.from('guests').select('id').or(`full_name.ilike.%${s}%,phone.ilike.%${s}%`);
      if (activeHotelId) guestSearchQ = guestSearchQ.eq('hotel_id', activeHotelId);

      let roomSearchQ = supabase.from('rooms').select('id').ilike('room_number', `%${s}%`);
      if (activeHotelId) roomSearchQ = roomSearchQ.eq('hotel_id', activeHotelId);

      const [guestMatchRes, roomMatchRes] = await Promise.all([guestSearchQ, roomSearchQ]);
      const matchedGuestIds = (guestMatchRes.data || []).map((g: any) => g.id);
      const matchedRoomIds = (roomMatchRes.data || []).map((r: any) => r.id);

      const orParts: string[] = [`booking_number.ilike.%${s}%`];
      if (matchedGuestIds.length > 0) {
        orParts.push(`guest_id.in.(${matchedGuestIds.join(',')})`);
      }
      if (matchedRoomIds.length > 0) {
        orParts.push(`room_id.in.(${matchedRoomIds.join(',')})`);
      }
      q = q.or(orParts.join(','));
    }

    // 6. Sorting (PostgreSQL)
    const sortBy = opts.sortBy || 'check_in_date';
    const ascending = opts.sortOrder === 'asc';
    q = q.order(sortBy, { ascending });

    // 7. Pagination & Limits (PostgreSQL)
    if (opts.page && opts.pageSize) {
      const from = (opts.page - 1) * opts.pageSize;
      const to = from + opts.pageSize - 1;
      q = q.range(from, to);
    } else if (opts.limit) {
      q = q.limit(opts.limit);
    }

    const { data, error } = await q;
    if (error) {
      console.error('Error fetching bookings from Supabase:', error.message);
      return [];
    }

    return (data || []) as BookingWithDetails[];
  } catch (err) {
    console.error('Failed to connect to Supabase for bookings:', err);
  }

  return [];
}

export async function getBookingById(bookingId: string): Promise<BookingWithDetails | null> {
  try {
    const staff = await getCurrentStaff();
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
      .eq('id', bookingId);

    if (staff?.hotel_id) {
      q = q.eq('hotel_id', staff.hotel_id);
    }

    const { data, error } = await q.maybeSingle();

    if (error) {
      console.error(`Error fetching booking ${bookingId} from Supabase:`, error.message);
      return null;
    }
    if (data) {
      return data as BookingWithDetails;
    }
  } catch (err) {
    console.error(`Failed to connect to Supabase for booking ${bookingId}:`, err);
  }

  return null;
}
