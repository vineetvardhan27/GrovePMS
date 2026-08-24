import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { getAllFoodCharges } from '../billing/food-actions';
import { getFBBills } from '../fb/queries';

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

    const [guestsRes, bookingsRes, foodCharges, fbBills] = await Promise.all([
      q,
      bookingsQuery,
      getAllFoodCharges(activeHotelId),
      getFBBills(activeHotelId),
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
      if (
        bill.billing_mode !== 'charge_to_room' &&
        bill.bill_status !== 'cancelled' &&
        bill.bill_status !== 'void'
      ) {
        const targetGuestId = bill.guest_id || (bill.booking_id ? bookingToGuestMap.get(bill.booking_id) : undefined);
        if (targetGuestId) {
          const currentSum = directFbBillsByGuest.get(targetGuestId) || 0;
          directFbBillsByGuest.set(targetGuestId, currentSum + (Number(bill.grand_total) || 0));
        }
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

    const [guestRes, bookingsRes, foodCharges, fbBills] = await Promise.all([
      guestQuery.maybeSingle(),
      bookingsQuery,
      getAllFoodCharges(activeHotelId),
      getFBBills(activeHotelId),
    ]);

    if (guestRes.error || !guestRes.data) {
      if (guestRes.error) {
        console.error(`Error fetching guest ${guestId} from Supabase:`, guestRes.error.message);
      }
      return null;
    }

    const guest = guestRes.data as Guest;
    const guestBookings = (bookingsRes.data || []).filter((b: any) => b.booking_status !== 'cancelled');
    const guestBookingIds = new Set(guestBookings.map((b: any) => b.id));

    const roomRevenue = guestBookings.reduce((sum: number, b: any) => sum + (Number(b.total_amount) || 0), 0);

    const guestFoodCharges = foodCharges.filter(
      (fc) => fc.guest_id === guestId || (fc.booking_id && guestBookingIds.has(fc.booking_id))
    );
    const foodRevenue = guestFoodCharges.reduce((sum, fc) => sum + (Number(fc.total_amount) || 0), 0);

    const guestDirectBills = fbBills.filter(
      (bill) =>
        (bill.guest_id === guestId || (bill.booking_id && guestBookingIds.has(bill.booking_id))) &&
        bill.billing_mode !== 'charge_to_room' &&
        bill.bill_status !== 'cancelled' &&
        bill.bill_status !== 'void'
    );
    const directFbRevenue = guestDirectBills.reduce((sum, b) => sum + (Number(b.grand_total) || 0), 0);

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
