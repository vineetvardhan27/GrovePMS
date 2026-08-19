import { createClient } from '../supabase/server';
import { RoomStatus, HousekeepingStatus } from '../types/database.types';

export interface RoomCategory {
  id: string;
  hotel_id: string;
  name: string;
  description: string | null;
  base_rate: number;
  weekend_rate: number | null;
  max_occupancy: number;
  extra_bed_rate: number | null;
}

export interface RoomWithCategory {
  id: string;
  hotel_id: string;
  category_id: string;
  room_number: string;
  floor: number;
  status: RoomStatus;
  housekeeping_status: HousekeepingStatus;
  category: RoomCategory;
  created_at?: string;
  updated_at?: string;
}

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

// Actual hotel rooms for Hotel Greenery View — 19 accommodation units across 5 floors
// Floor mapping: Basement=0, Ground=1, First=2, Second=3, Upper=4
export const DEFAULT_ROOMS: RoomWithCategory[] = [
  // Basement (floor=0): 1 Family Apartment
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000005',
    room_number: 'FA-01',
    floor: 0,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[4],
  },
  // Ground Floor (floor=1): 4 Premium Rooms
  {
    id: 'd0000000-0000-0000-0000-000000000101',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '001',
    floor: 1,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000102',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '002',
    floor: 1,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000103',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '003',
    floor: 1,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000104',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '004',
    floor: 1,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  // First Floor (floor=2): 2 Deluxe + 5 Premium = 7 rooms
  {
    id: 'd0000000-0000-0000-0000-000000000201',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    room_number: '101',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[1],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000202',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    room_number: '102',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[1],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000203',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '103',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000204',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '104',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000205',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '105',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000206',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '106',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000207',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '107',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  // Second Floor (floor=3): 2 Luxury + 1 Deluxe = 3 rooms
  // Restaurant area also on this floor — physical reference only, no room record
  {
    id: 'd0000000-0000-0000-0000-000000000301',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000003',
    room_number: '201',
    floor: 3,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[2],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000302',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000003',
    room_number: '202',
    floor: 3,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[2],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000303',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    room_number: '203',
    floor: 3,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[1],
  },
  // Upper Floor (floor=4): 4 Mountain View Rooms
  {
    id: 'd0000000-0000-0000-0000-000000000401',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    room_number: '301',
    floor: 4,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[3],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000402',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    room_number: '302',
    floor: 4,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[3],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000403',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    room_number: '303',
    floor: 4,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[3],
  },
  {
    id: 'd0000000-0000-0000-0000-000000000404',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000004',
    room_number: '304',
    floor: 4,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[3],
  },
];

// In-memory working stores
export let localRoomsStore = [...DEFAULT_ROOMS];
export let localCategoriesStore = [...DEFAULT_ROOM_CATEGORIES];

export async function getRoomCategories(hotelId?: string): Promise<RoomCategory[]> {
  try {
    const supabase = createClient();
    let query = supabase.from('room_categories').select('*').order('base_rate', { ascending: true });
    if (hotelId) {
      query = query.eq('hotel_id', hotelId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching room categories from Supabase:', error.message);
      return localCategoriesStore;
    }
    if (data && data.length > 0) {
      return data as RoomCategory[];
    }
  } catch (err) {
    console.error('Failed to connect to Supabase for room categories:', err);
  }
  return localCategoriesStore;
}

export async function getRooms(hotelId?: string): Promise<RoomWithCategory[]> {
  try {
    const supabase = createClient();
    // Sort by floor first (Basement=0 comes first), then room_number within each floor
    let query = supabase
      .from('rooms')
      .select(`
        *,
        category:category_id (*)
      `)
      .order('floor', { ascending: true })
      .order('room_number', { ascending: true });

    if (hotelId) {
      query = query.eq('hotel_id', hotelId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching rooms from Supabase:', error.message);
      return localRoomsStore;
    }
    if (data && data.length > 0) {
      return data.map((r: any) => ({
        ...r,
        category: r.category || DEFAULT_ROOM_CATEGORIES[0],
      })) as RoomWithCategory[];
    }
  } catch (err) {
    console.error('Failed to connect to Supabase for rooms:', err);
  }

  // Fallback to local store
  return localRoomsStore.map((room) => {
    const dynamicCategory =
      localCategoriesStore.find((c) => c.id === room.category_id) || room.category;
    return {
      ...room,
      category: dynamicCategory,
    };
  });
}


