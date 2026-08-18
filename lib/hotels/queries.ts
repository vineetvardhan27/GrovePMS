import { createClient } from '../supabase/server';

export interface HotelSettings {
  gst_number: string | null;
  gst_rate: number; // e.g. 12 = 12%
  pan_number: string | null;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  phone: string;
  email: string;
  check_in_time: string;
  check_out_time: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  settings: HotelSettings;
}

// Fallback store — exact copy of seed.sql values
const DEFAULT_HOTEL: Hotel = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Hotel Greenery View',
  slug: 'hotelgreeneryview',
  settings: {
    gst_number: '07AAACH7409R1ZZ',
    gst_rate: 12, // 12% GST from hotels.settings — NEVER hardcoded in billing logic
    pan_number: 'AAACH7409R',
    address: '14 Hill View Road',
    city: 'Mussoorie',
    state: 'Uttarakhand',
    pin_code: '248179',
    phone: '+91 98765 43210',
    email: 'contact@hotelgreeneryview.com',
    check_in_time: '12:00',
    check_out_time: '11:00',
  },
};

let localHotelStore: Hotel = { ...DEFAULT_HOTEL };

export async function getHotel(hotelId?: string): Promise<Hotel> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', hotelId || DEFAULT_HOTEL.id)
      .single();

    if (!error && data) {
      return data as Hotel;
    }
  } catch {
    // Fallback to local store
  }
  return localHotelStore;
}

export async function getHotelSettings(hotelId?: string): Promise<HotelSettings> {
  const hotel = await getHotel(hotelId);
  return hotel.settings;
}
