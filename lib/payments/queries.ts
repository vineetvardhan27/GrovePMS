import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { PaymentMode, PaymentType } from '../types/database.types';

export interface EnrichedPayment {
  id: string;
  hotel_id: string;
  booking_id: string;
  amount: number;
  payment_mode: PaymentMode;
  payment_type: PaymentType;
  notes: string | null;
  recorded_by?: string | null;
  created_at: string;
  booking_number: string;
  guest_name: string;
  guest_phone: string;
  room_number: string;
}

export async function getPayments(hotelId?: string): Promise<EnrichedPayment[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;

    const supabase = createClient();
    let q = supabase
      .from('payments')
      .select(`
        *,
        booking:booking_id (
          id,
          booking_number,
          guest:guest_id (
            full_name,
            phone
          ),
          room:room_id (
            room_number
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (activeHotelId) {
      q = q.eq('hotel_id', activeHotelId);
    }

    const { data, error } = await q;

    if (error) {
      console.error('Error fetching payments from Supabase:', error.message);
      return [];
    }
    
    if (data) {
      return data.map((p: any) => ({
        id: p.id,
        hotel_id: p.hotel_id,
        booking_id: p.booking_id,
        amount: Number(p.amount),
        payment_mode: p.payment_mode,
        payment_type: p.payment_type,
        notes: p.notes,
        recorded_by: p.recorded_by,
        created_at: p.created_at,
        booking_number: p.booking?.booking_number || '—',
        guest_name: p.booking?.guest?.full_name || 'Guest',
        guest_phone: p.booking?.guest?.phone || '',
        room_number: p.booking?.room?.room_number || '—',
      }));
    }
  } catch (err) {
    console.error('Failed to connect to Supabase for payments:', err);
  }

  return [];
}
