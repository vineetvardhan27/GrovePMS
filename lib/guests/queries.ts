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

export const DEFAULT_GUESTS: Guest[] = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Amit Patel',
    phone: '+91 98234 56789',
    email: 'amit.patel@example.com',
    id_type: 'Aadhaar',
    id_number: '•••• •••• 1234',
    address: 'Mumbai, Maharashtra',
    total_stays: 3,
    total_spent: 18500,
    created_at: '2026-06-10T10:00:00.000Z',
    updated_at: '2026-08-15T14:30:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Dr. Sunita Rao',
    phone: '+91 98450 11223',
    email: 'sunita.rao@health.org',
    id_type: 'Passport',
    id_number: 'Z••••••8',
    address: 'Bangalore, Karnataka',
    total_stays: 1,
    total_spent: 7000,
    created_at: '2026-07-20T12:00:00.000Z',
    updated_at: '2026-07-22T11:00:00.000Z',
  },
  {
    id: 'b0000000-0000-0000-0000-000000000003',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    full_name: 'Vikram & Ananya Malhotra',
    phone: '+91 99887 76655',
    email: 'vikram.m@techcorp.in',
    id_type: 'Driving License',
    id_number: 'DL-••••••••',
    address: 'Delhi NCR',
    total_stays: 2,
    total_spent: 16500,
    created_at: '2026-08-01T09:00:00.000Z',
    updated_at: '2026-08-17T18:00:00.000Z',
  },
];

export let localGuestsStore: Guest[] = [...DEFAULT_GUESTS];

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

