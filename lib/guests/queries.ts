import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { getAllFoodCharges } from '../billing/food-actions';
import { getFBBills } from '../fb/queries';
import { PaginatedResult } from '../types/pagination';

export interface Guest {
  id: string;
  hotel_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  id_type: string | null;
  id_number: string | null;
  address: string | null;
  total_stays?: number;
  total_spent?: number;
  created_at: string;
  updated_at: string;
}

export interface GetGuestsOptions {
  hotelId?: string;
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'full_name' | 'created_at' | 'total_stays' | 'total_spent';
  sortOrder?: 'asc' | 'desc';
}

export async function getGuestsPaginated(
  options: GetGuestsOptions = {}
): Promise<PaginatedResult<Guest>> {
  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.max(1, Number(options.pageSize) || 50);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const staff = await getCurrentStaff();
    const activeHotelId = options.hotelId || staff?.hotel_id;
    const supabase = createClient();

    let q = supabase
      .from('guests')
      .select('*', { count: 'exact' });

    if (activeHotelId) {
      q = q.eq('hotel_id', activeHotelId);
    }

    if (options.query && options.query.trim()) {
      const s = `%${options.query.trim()}%`;
      q = q.or(`full_name.ilike.${s},phone.ilike.${s},email.ilike.${s}`);
    }

    // Default alphabetical by full_name
    const ascending = options.sortOrder !== 'desc';
    q = q.order('full_name', { ascending });
    q = q.range(from, to);

    const { data: rawGuests, count, error } = await q;

    if (error) {
      console.error('Error fetching paginated guests from Supabase:', error.message);
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

    const guests = (rawGuests || []) as Guest[];
    const guestIds = guests.map((g) => g.id);

    if (guestIds.length === 0) {
      return {
        data: [],
        page,
        pageSize,
        totalCount: count ?? 0,
        totalPages: count ? Math.max(1, Math.ceil(count / pageSize)) : 1,
        hasNextPage: false,
        hasPrevPage: page > 1,
      };
    }

    // Database pushdown: query bookings, food charges, and FB bills ONLY for these 50 guests
    let bookingsQuery = supabase
      .from('bookings')
      .select('id, hotel_id, guest_id, total_amount, booking_status')
      .in('guest_id', guestIds);
    if (activeHotelId) bookingsQuery = bookingsQuery.eq('hotel_id', activeHotelId);

    let fcQuery = supabase
      .from('food_charges')
      .select('guest_id, booking_id, total_amount')
      .in('guest_id', guestIds);
    if (activeHotelId) fcQuery = fcQuery.eq('hotel_id', activeHotelId);

    let fbQuery = supabase
      .from('fb_bills')
      .select('guest_id, booking_id, grand_total, billing_mode, bill_status')
      .in('guest_id', guestIds)
      .neq('billing_mode', 'charge_to_room')
      .not('bill_status', 'in', '("cancelled","void")');
    if (activeHotelId) fbQuery = fbQuery.eq('hotel_id', activeHotelId);

    const [bookingsRes, fcRes, fbRes] = await Promise.all([
      bookingsQuery,
      fcQuery,
      fbQuery,
    ]);

    const pageBookings = (bookingsRes.data || []) as Array<{
      id: string;
      hotel_id: string;
      guest_id: string;
      total_amount: number;
      booking_status: string;
    }>;
    const foodCharges = (fcRes.data || []) as Array<{
      guest_id?: string | null;
      booking_id?: string | null;
      total_amount: number;
    }>;
    const fbBills = (fbRes.data || []) as Array<{
      guest_id?: string | null;
      booking_id?: string | null;
      grand_total: number;
      billing_mode?: string | null;
      bill_status?: string | null;
    }>;

    // Group valid (non-cancelled) bookings by guest_id
    const bookingsByGuest = new Map<string, typeof pageBookings>();
    const bookingToGuestMap = new Map<string, string>();

    for (const b of pageBookings) {
      if (b.booking_status !== 'cancelled') {
        const list = bookingsByGuest.get(b.guest_id) || [];
        list.push(b);
        bookingsByGuest.set(b.guest_id, list);
        bookingToGuestMap.set(b.id, b.guest_id);
      }
    }

    // Group food charges by guest_id
    const foodChargesByGuest = new Map<string, number>();
    for (const fc of foodCharges) {
      const targetGuestId = fc.guest_id || (fc.booking_id ? bookingToGuestMap.get(fc.booking_id) : undefined);
      if (targetGuestId) {
        const currentSum = foodChargesByGuest.get(targetGuestId) || 0;
        foodChargesByGuest.set(targetGuestId, currentSum + (Number(fc.total_amount) || 0));
      }
    }

    // Group direct F&B bills by guest_id
    const directFbBillsByGuest = new Map<string, number>();
    for (const bill of fbBills) {
      const targetGuestId = bill.guest_id || (bill.booking_id ? bookingToGuestMap.get(bill.booking_id) : undefined);
      if (targetGuestId) {
        const currentSum = directFbBillsByGuest.get(targetGuestId) || 0;
        directFbBillsByGuest.set(targetGuestId, currentSum + (Number(bill.grand_total) || 0));
      }
    }

    // Map each guest
    const enrichedGuests: Guest[] = guests.map((guest) => {
      const guestBookings = bookingsByGuest.get(guest.id) || [];
      const roomRevenue = guestBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
      const foodRevenue = foodChargesByGuest.get(guest.id) || 0;
      const directFbRevenue = directFbBillsByGuest.get(guest.id) || 0;
      const totalSpent = Math.round((roomRevenue + foodRevenue + directFbRevenue) * 100) / 100;

      return {
        ...guest,
        total_stays: guestBookings.length,
        total_spent: totalSpent,
      };
    });

    const totalCount = count ?? enrichedGuests.length;
    const totalPages = count !== null ? Math.max(1, Math.ceil(count / pageSize)) : 1;

    return {
      data: enrichedGuests,
      page,
      pageSize,
      totalCount: count,
      totalPages,
      hasNextPage: totalPages !== null ? page < totalPages : enrichedGuests.length === pageSize,
      hasPrevPage: page > 1,
    };
  } catch (err) {
    console.error('Failed to connect to Supabase for paginated guests:', err);
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

export async function getGuests(hotelId?: string, query?: string): Promise<Guest[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;

    const supabase = createClient();
    let q = supabase.from('guests').select('*').order('full_name', { ascending: true });

    if (activeHotelId) {
      q = q.eq('hotel_id', activeHotelId);
    }
    if (query && query.trim()) {
      const s = `%${query.trim()}%`;
      q = q.or(`full_name.ilike.${s},phone.ilike.${s},email.ilike.${s}`);
    }

    let bookingsQuery = supabase
      .from('bookings')
      .select('id, hotel_id, guest_id, total_amount, booking_status');
    if (activeHotelId) {
      bookingsQuery = bookingsQuery.eq('hotel_id', activeHotelId);
    }

    let fcQuery = supabase
      .from('food_charges')
      .select('guest_id, booking_id, total_amount');
    if (activeHotelId) fcQuery = fcQuery.eq('hotel_id', activeHotelId);

    let fbQuery = supabase
      .from('fb_bills')
      .select('guest_id, booking_id, grand_total, billing_mode, bill_status')
      .neq('billing_mode', 'charge_to_room')
      .not('bill_status', 'in', '("cancelled","void")');
    if (activeHotelId) fbQuery = fbQuery.eq('hotel_id', activeHotelId);

    const [guestsRes, bookingsRes, fcRes, fbRes] = await Promise.all([
      q,
      bookingsQuery,
      fcQuery,
      fbQuery,
    ]);

    if (guestsRes.error) {
      console.error('Error fetching guests from Supabase:', guestsRes.error.message);
      return [];
    }

    const rawGuests = (guestsRes.data || []) as Guest[];
    const allBookings = (bookingsRes.data || []) as Array<{
      id: string;
      hotel_id: string;
      guest_id: string;
      total_amount: number;
      booking_status: string;
    }>;
    const foodCharges = (fcRes.data || []) as Array<{
      guest_id?: string | null;
      booking_id?: string | null;
      total_amount: number;
    }>;
    const fbBills = (fbRes.data || []) as Array<{
      guest_id?: string | null;
      booking_id?: string | null;
      grand_total: number;
      billing_mode?: string | null;
      bill_status?: string | null;
    }>;

    // Group valid (non-cancelled) bookings by guest_id
    const bookingsByGuest = new Map<string, typeof allBookings>();
    const bookingToGuestMap = new Map<string, string>();

    for (const b of allBookings) {
      if (b.booking_status !== 'cancelled') {
        const list = bookingsByGuest.get(b.guest_id) || [];
        list.push(b);
        bookingsByGuest.set(b.guest_id, list);
        bookingToGuestMap.set(b.id, b.guest_id);
      }
    }

    // Group food charges by guest_id
    const foodChargesByGuest = new Map<string, number>();
    for (const fc of foodCharges) {
      const targetGuestId = fc.guest_id || (fc.booking_id ? bookingToGuestMap.get(fc.booking_id) : undefined);
      if (targetGuestId) {
        const currentSum = foodChargesByGuest.get(targetGuestId) || 0;
        foodChargesByGuest.set(targetGuestId, currentSum + (Number(fc.total_amount) || 0));
      }
    }

    // Group standalone/direct F&B bills by guest_id (avoid double-counting charges posted to room)
    const directFbBillsByGuest = new Map<string, number>();
    for (const bill of fbBills) {
      const targetGuestId = bill.guest_id || (bill.booking_id ? bookingToGuestMap.get(bill.booking_id) : undefined);
      if (targetGuestId) {
        const currentSum = directFbBillsByGuest.get(targetGuestId) || 0;
        directFbBillsByGuest.set(targetGuestId, currentSum + (Number(bill.grand_total) || 0));
      }
    }

    // Map each guest to include total_stays and accurate total_spent
    return rawGuests.map((guest) => {
      const guestBookings = bookingsByGuest.get(guest.id) || [];
      const roomRevenue = guestBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
      const foodRevenue = foodChargesByGuest.get(guest.id) || 0;
      const directFbRevenue = directFbBillsByGuest.get(guest.id) || 0;
      const totalSpent = Math.round((roomRevenue + foodRevenue + directFbRevenue) * 100) / 100;

      return {
        ...guest,
        total_stays: guestBookings.length,
        total_spent: totalSpent,
      };
    });
  } catch (err) {
    console.error('Failed to connect to Supabase for guests:', err);
  }

  return [];
}

export async function getGuestById(guestId: string): Promise<Guest | null> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = staff?.hotel_id;
    const supabase = createClient();

    let guestQuery = supabase.from('guests').select('*').eq('id', guestId);
    if (activeHotelId) {
      guestQuery = guestQuery.eq('hotel_id', activeHotelId);
    }

    let bookingsQuery = supabase
      .from('bookings')
      .select('id, hotel_id, guest_id, total_amount, booking_status')
      .eq('guest_id', guestId);

    if (activeHotelId) {
      bookingsQuery = bookingsQuery.eq('hotel_id', activeHotelId);
    }

    const [guestRes, bookingsRes] = await Promise.all([
      guestQuery.maybeSingle(),
      bookingsQuery,
    ]);

    if (guestRes.error || !guestRes.data) {
      if (guestRes.error) {
        console.error(`Error fetching guest ${guestId} from Supabase:`, guestRes.error.message);
      }
      return null;
    }

    const guest = guestRes.data as Guest;
    const guestBookings = (bookingsRes.data || []).filter((b: any) => b.booking_status !== 'cancelled');
    const guestBookingIds = guestBookings.map((b: any) => b.id);

    const roomRevenue = guestBookings.reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0);

    // Query ONLY this guest's food charges from PostgreSQL
    let fcQuery = supabase
      .from('food_charges')
      .select('total_amount');
    if (guestBookingIds.length > 0) {
      fcQuery = fcQuery.or(`guest_id.eq.${guestId},booking_id.in.(${guestBookingIds.join(',')})`);
    } else {
      fcQuery = fcQuery.eq('guest_id', guestId);
    }
    if (activeHotelId) {
      fcQuery = fcQuery.eq('hotel_id', activeHotelId);
    }

    // Query ONLY this guest's direct F&B bills from PostgreSQL
    let fbQuery = supabase
      .from('fb_bills')
      .select('grand_total')
      .neq('billing_mode', 'charge_to_room')
      .not('bill_status', 'in', '("cancelled","void")');
    if (guestBookingIds.length > 0) {
      fbQuery = fbQuery.or(`guest_id.eq.${guestId},booking_id.in.(${guestBookingIds.join(',')})`);
    } else {
      fbQuery = fbQuery.eq('guest_id', guestId);
    }
    if (activeHotelId) {
      fbQuery = fbQuery.eq('hotel_id', activeHotelId);
    }

    const [fcRes, fbRes] = await Promise.all([fcQuery, fbQuery]);

    const foodRevenue = (fcRes.data || []).reduce(
      (sum: number, fc: any) => sum + (Number(fc.total_amount) || 0),
      0
    );
    const directFbRevenue = (fbRes.data || []).reduce(
      (sum: number, b: any) => sum + (Number(b.grand_total) || 0),
      0
    );

    const totalSpent = Math.round((roomRevenue + foodRevenue + directFbRevenue) * 100) / 100;

    return {
      ...guest,
      total_stays: guestBookings.length,
      total_spent: totalSpent,
    };
  } catch (err) {
    console.error(`Failed to connect to Supabase for guest ${guestId}:`, err);
  }

  return null;
}
