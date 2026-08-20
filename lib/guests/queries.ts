import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';

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

    const { data, error } = await q;
    if (error) {
      console.error('Error fetching guests from Supabase:', error.message);
      return [];
    }
    if (data) {
      return data as Guest[];
    }
  } catch (err) {
    console.error('Failed to connect to Supabase for guests:', err);
  }

  return [];
}

export async function getGuestById(guestId: string): Promise<Guest | null> {
  try {
    const staff = await getCurrentStaff();
    const supabase = createClient();
    let q = supabase.from('guests').select('*').eq('id', guestId);

    if (staff?.hotel_id) {
      q = q.eq('hotel_id', staff.hotel_id);
    }

    const { data, error } = await q.maybeSingle();
    if (error) {
      console.error(`Error fetching guest ${guestId} from Supabase:`, error.message);
      return null;
    }
    if (data) {
      return data as Guest;
    }
  } catch (err) {
    console.error(`Failed to connect to Supabase for guest ${guestId}:`, err);
  }

  return null;
}
