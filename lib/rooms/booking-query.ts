'use client';

import { createClient } from '../supabase/client';

export interface ActiveRoomBooking {
  id: string;
  booking_number: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  rate_per_night: number;
  total_amount: number;
  advance_amount: number;
  payment_status: string;
  booking_status: string;
  source: string;
  remarks: string | null;
  guest: {
    id: string;
    full_name: string;
    phone: string;
    email: string | null;
  };
}

/**
 * Fetches the active (checked_in or confirmed) booking for a specific room.
 * Used by the RoomDetailDrawer to display guest and booking info.
 * Returns null if the room has no active booking or if the query fails.
 */
export async function getActiveRoomBooking(
  roomId: string
): Promise<ActiveRoomBooking | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_number,
        check_in_date,
        check_out_date,
        adults,
        children,
        rate_per_night,
        total_amount,
        advance_amount,
        payment_status,
        booking_status,
        source,
        remarks,
        guest:guest_id (
          id,
          full_name,
          phone,
          email
        )
      `)
      .eq('room_id', roomId)
      .in('booking_status', ['checked_in', 'confirmed'])
      .order('check_in_date', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      return data as ActiveRoomBooking;
    }
  } catch {
    // Gracefully fail — the drawer will show empty state
  }
  return null;
}
