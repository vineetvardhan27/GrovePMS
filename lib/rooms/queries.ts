import * as React from 'react';
import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { RoomStatus, HousekeepingStatus } from '../types/database.types';
import {
  RoomCategory,
  RoomWithCategory,
  PropertyResource,
  getEffectiveRoomRates,
} from './types';
import { getOrSetCache, CACHE_CONFIG } from '../cache/serverCache';

const serverCache = typeof (React as any).cache === 'function' ? (React as any).cache : (<T extends (...args: any[]) => any>(fn: T): T => fn);

export type { RoomCategory, RoomWithCategory, PropertyResource };
export { getEffectiveRoomRates };



// Actual hotel room categories for Hotel Greenery View
export const DEFAULT_ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Premium Room',
    description: 'Comfortable room with attached bath and garden-facing view',
    base_rate: 2500,
    weekend_rate: 3000,
    max_occupancy: 2,
    extra_bed_rate: 500,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Deluxe Room',
    description: 'Spacious room with valley view and premium furnishings',
    base_rate: 3500,
    weekend_rate: 4200,
    max_occupancy: 2,
    extra_bed_rate: 700,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Luxury Room',
    description: 'Luxurious room with panoramic views and premium amenities',
    base_rate: 5000,
    weekend_rate: 6000,
    max_occupancy: 2,
    extra_bed_rate: 1000,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Mountain View Room',
    description: 'Stunning mountain-facing room on the upper floor with private balcony',
    base_rate: 4500,
    weekend_rate: 5500,
    max_occupancy: 2,
    extra_bed_rate: 800,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000005',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Family Apartment',
    description: 'Spacious multi-room apartment in the basement, ideal for families',
    base_rate: 7500,
    weekend_rate: 9000,
    max_occupancy: 6,
    extra_bed_rate: 1200,
  },
];

// Actual hotel inventory for Hotel Greenery View:
// Exactly 19 Accommodation Units (18 Numbered Rooms + 1 Basement Family Apartment)
// Ground Floor = 4, First Floor = 7, Second Floor = 3, Upper Floor = 4, Basement = 1
export const DEFAULT_ROOMS: RoomWithCategory[] = [
  // Basement (floor=0): 1 Family Apartment
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000005',
    room_number: 'FAMILY-APT',
    floor: 0,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[4],
  },
  // Ground Floor / Road Level (floor=1): 4 Premium Rooms (801-804)
  {
    id: 'd0000000-0000-0000-0000-000000000101',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '801',
    floor: 1,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000102',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '802',
    floor: 1,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000103',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '803',
    floor: 1,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000104',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '804',
    floor: 1,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  // First Floor (floor=2): 7 rooms (2 Deluxe + 5 Premium)
  {
    id: 'd0000000-0000-0000-0000-000000000201',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    room_number: '805',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[1],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000202',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    room_number: '806',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[1],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000203',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '807',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000204',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '808',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000205',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '809',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000206',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '810',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000207',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '811',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  // Second Floor (floor=3): 3 rooms (2 Luxury + 1 Deluxe) + Restaurant (Facility)
  {
    id: 'd0000000-0000-0000-0000-000000000301',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000003',
    room_number: '812',
    floor: 3,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[2],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000302',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000003',
    room_number: '813',
    floor: 3,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[2],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000303',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    room_number: '814',
    floor: 3,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[1],
  },
  // Upper Floor (floor=4): 4 Mountain View Rooms (815-818)
  {
    id: 'd0000000-0000-0000-0000-000000000401',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    room_number: '815',
    floor: 4,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[3],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000402',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    room_number: '816',
    floor: 4,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[3],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000403',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    room_number: '817',
    floor: 4,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[3],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000404',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    room_number: '818',
    floor: 4,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[3],
  },
];

// Default Banquet Hall resource (separate non-bedroom resource)
export const DEFAULT_BANQUET_HALL: PropertyResource = {
  id: 'res-banquet-0001',
  hotel_id: 'a0000000-0000-0000-0000-000000000001',
  name: 'Banquet Hall',
  resource_type: 'banquet_hall',
  capacity: 200,
  status: 'available',
  description: 'Spacious Grand Banquet & Event Hall with modern AV setup and catering space',
  daily_rate: 35000,
  hourly_rate: 5000,
  is_active: true,
};

export const getRoomCategories = serverCache(async function getRoomCategories(hotelId?: string): Promise<RoomCategory[]> {
  const staff = await getCurrentStaff();
  const activeHotelId = hotelId || staff?.hotel_id || 'a0000000-0000-0000-0000-000000000001';

  const { data } = await getOrSetCache(
    {
      key: ['room-categories', activeHotelId],
      tags: [CACHE_CONFIG.ROOM_CATEGORIES.tag(activeHotelId), 'room-categories'],
      ttlSeconds: CACHE_CONFIG.ROOM_CATEGORIES.ttl,
    },
    async () => {
      try {
        const supabase = createClient();
        let query = supabase.from('room_categories').select('*').order('base_rate', { ascending: true });
        if (activeHotelId) {
          query = query.eq('hotel_id', activeHotelId);
        }
        const { data, error } = await query;
        if (error) {
          console.error('Error fetching room categories from Supabase:', error.message);
          return activeHotelId === 'a0000000-0000-0000-0000-000000000001' ? DEFAULT_ROOM_CATEGORIES : [];
        }
        if (data) {
          if (data.length > 0) return data as RoomCategory[];
          if (activeHotelId && activeHotelId !== 'a0000000-0000-0000-0000-000000000001') return [];
        }
      } catch (err) {
        console.error('Failed to connect to Supabase for room categories:', err);
      }
      return DEFAULT_ROOM_CATEGORIES;
    }
  );

  return data;
});

export const getRooms = serverCache(async function getRooms(hotelId?: string): Promise<RoomWithCategory[]> {
  try {
    const staff = await getCurrentStaff();
    const activeHotelId = hotelId || staff?.hotel_id;

    const supabase = createClient();
    // Sort by floor (Basement=0 first, then Floor 8) and room_number
    let query = supabase
      .from('rooms')
      .select(`
        *,
        category:category_id (*)
      `)
      .order('floor', { ascending: true })
      .order('room_number', { ascending: true });

    if (activeHotelId) {
      query = query.eq('hotel_id', activeHotelId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching rooms from Supabase:', error.message);
      return activeHotelId === 'a0000000-0000-0000-0000-000000000001' ? DEFAULT_ROOMS : [];
    }
    if (data) {
      if (data.length > 0) {
        return data.map((r: any) => ({
          ...r,
          category: r.category || DEFAULT_ROOM_CATEGORIES[0],
        })) as RoomWithCategory[];
      }
      if (activeHotelId && activeHotelId !== 'a0000000-0000-0000-0000-000000000001') return [];
    }
  } catch (err) {
    console.error('Failed to connect to Supabase for rooms:', err);
  }

  return DEFAULT_ROOMS;
});

export const getPropertyResources = serverCache(async function getPropertyResources(hotelId?: string): Promise<PropertyResource[]> {
  const staff = await getCurrentStaff();
  const activeHotelId = hotelId || staff?.hotel_id || 'a0000000-0000-0000-0000-000000000001';

  const { data } = await getOrSetCache(
    {
      key: ['property-resources', activeHotelId],
      tags: [CACHE_CONFIG.ROOMS_CONFIG.tag(activeHotelId), 'property-resources'],
      ttlSeconds: CACHE_CONFIG.ROOMS_CONFIG.ttl,
    },
    async () => {
      try {
        const supabase = createClient();
        let query = supabase.from('property_resources').select('*').order('created_at', { ascending: true });
        if (activeHotelId) {
          query = query.eq('hotel_id', activeHotelId);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as PropertyResource[];
        }
      } catch (err) {
        // Return fallback
      }
      return [DEFAULT_BANQUET_HALL];
    }
  );

  return data;
});
