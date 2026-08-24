import * as React from 'react';
import { createClient } from '../supabase/server';

const serverCache = typeof (React as any).cache === 'function' ? (React as any).cache : (<T extends (...args: any[]) => any>(fn: T): T => fn);

export interface HotelSettings {
  gst_enabled?: boolean;
  gst_percentage?: number;
  gst_rate: number; // e.g. 12 = 12%
  gst_number?: string | null;
  pan_number?: string | null;
  address?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  phone?: string;
  email?: string;
  check_in_time?: string;
  check_out_time?: string;
  currency_symbol?: string;
  currency_code?: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  settings: HotelSettings;
  address?: string;
  phone?: string;
  email?: string;
}

// Fallback store — exact copy of seed values
const DEFAULT_HOTEL: Hotel = {
  id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Hotel Greenery View',
  slug: 'hotelgreeneryview',
  address: '14 Hill View Road, Mussoorie',
  phone: '+91 98765 43210',
  email: 'contact@hotelgreeneryview.com',
  settings: {
    gst_enabled: true,
    gst_percentage: 12,
    gst_rate: 12,
    gst_number: '07AAACH7409R1ZZ',
    pan_number: 'AAACH7409R',
    address: '14 Hill View Road',
    city: 'Mussoorie',
    state: 'Uttarakhand',
    pin_code: '248179',
    phone: '+91 98765 43210',
    email: 'contact@hotelgreeneryview.com',
    check_in_time: '12:00',
    check_out_time: '11:00',
    currency_symbol: '₹',
    currency_code: 'INR',
  },
};

let localHotelStore: Hotel = { ...DEFAULT_HOTEL };

export const getHotel = serverCache(async function getHotel(hotelId?: string): Promise<Hotel> {
  try {
    const supabase = createClient();
    const { data, error } = (await supabase
      .from('hotels')
      .select('*')
      .eq('id', hotelId || DEFAULT_HOTEL.id)
      .single()) as { data: any; error: any };

    if (error) {
      console.error('Error fetching hotel from Supabase:', error.message);
    } else if (data) {
      const rawSettings = (data.settings || {}) as any;
      const normalizedSettings: HotelSettings = {
        ...rawSettings,
        gst_rate: Number(rawSettings.gst_percentage || rawSettings.gst_rate || 12),
        gst_percentage: Number(rawSettings.gst_percentage || rawSettings.gst_rate || 12),
        gst_enabled: rawSettings.gst_enabled !== false,
      };
      return {
        ...data,
        settings: normalizedSettings,
      } as Hotel;
    }
  } catch (err) {
    console.error('Failed to connect to Supabase for hotel:', err);
  }
  return localHotelStore;
});

export const getHotelSettings = serverCache(async function getHotelSettings(hotelId?: string): Promise<HotelSettings> {
  const hotel = await getHotel(hotelId);
  return hotel.settings;
});

