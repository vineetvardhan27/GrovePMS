import { createClient } from '../supabase/server';

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

export const DEFAULT_GUESTS: Guest[] = [];

export let localGuestsStore: Guest[] = [];


export async function getGuests(hotelId?: string, query?: string): Promise<Guest[]> {
  try {
    const supabase = createClient();
    let q = supabase.from('guests').select('*').order('full_name', { ascending: true });

    if (hotelId) {
      q = q.eq('hotel_id', hotelId);
    }
    if (query && query.trim()) {
      const s = `%${query.trim()}%`;
      q = q.or(`full_name.ilike.${s},phone.ilike.${s},email.ilike.${s}`);
    }

    const { data, error } = await q;
    if (error) {
      console.error('Error fetching guests from Supabase:', error.message);
      return localGuestsStore;
    }
    if (data && data.length > 0) {
      return data as Guest[];
    }

  } catch (err) {
    console.error('Failed to connect to Supabase for guests:', err);
  }

  let result = [...localGuestsStore];
  if (query && query.trim()) {
    const s = query.trim().toLowerCase();
    result = result.filter(
      (g) =>
        g.full_name.toLowerCase().includes(s) ||
        g.phone.toLowerCase().includes(s) ||
        (g.email && g.email.toLowerCase().includes(s))
    );
  }
  return result;
}

export async function getGuestById(guestId: string): Promise<Guest | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('guests').select('*').eq('id', guestId).single();
    if (error) {
      console.error(`Error fetching guest ${guestId} from Supabase:`, error.message);
      return localGuestsStore.find((g) => g.id === guestId) || null;
    }
    if (data) {
      return data as Guest;
    }
  } catch (err) {
    console.error(`Failed to connect to Supabase for guest ${guestId}:`, err);
  }

  return localGuestsStore.find((g) => g.id === guestId) || null;
}

