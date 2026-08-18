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

// Initial seed categories for Hotel Greenery View
export const DEFAULT_ROOM_CATEGORIES: RoomCategory[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Deluxe Room',
    description: 'Comfortable queen bed with valley view and attached bath',
    base_rate: 2500,
    weekend_rate: 3000,
    max_occupancy: 2,
    extra_bed_rate: 500,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Super Deluxe',
    description: 'Spacious king bed with private balcony and valley view',
    base_rate: 3500,
    weekend_rate: 4200,
    max_occupancy: 3,
    extra_bed_rate: 700,
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Family Suite',
    description: 'Two interconnecting bedrooms with panoramic mountain view',
    base_rate: 5500,
    weekend_rate: 6500,
    max_occupancy: 4,
    extra_bed_rate: 1000,
  },
];

// Initial seed rooms across 3 floors
export const DEFAULT_ROOMS: RoomWithCategory[] = [
  {
    id: 'r0000000-0000-0000-0000-000000000101',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '101',
    floor: 1,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'r0000000-0000-0000-0000-000000000102',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '102',
    floor: 1,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'r0000000-0000-0000-0000-000000000103',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '103',
    floor: 1,
    status: 'occupied',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'r0000000-0000-0000-0000-000000000104',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000001',
    room_number: '104',
    floor: 1,
    status: 'cleaning',
    housekeeping_status: 'dirty',
    category: DEFAULT_ROOM_CATEGORIES[0],
  },
  {
    id: 'r0000000-0000-0000-0000-000000000201',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    room_number: '201',
    floor: 2,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[1],
  },
  {
    id: 'r0000000-0000-0000-0000-000000000202',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    room_number: '202',
    floor: 2,
    status: 'arriving_today',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[1],
  },
  {
    id: 'r0000000-0000-0000-0000-000000000203',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    room_number: '203',
    floor: 2,
    status: 'reserved',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[1],
  },
  {
    id: 'r0000000-0000-0000-0000-000000000204',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000002',
    room_number: '204',
    floor: 2,
    status: 'maintenance',
    housekeeping_status: 'dirty',
    category: DEFAULT_ROOM_CATEGORIES[1],
  },
  {
    id: 'r0000000-0000-0000-0000-000000000301',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000003',
    room_number: '301',
    floor: 3,
    status: 'available',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[2],
  },
  {
    id: 'r0000000-0000-0000-0000-000000000302',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    category_id: 'c0000000-0000-0000-0000-000000000003',
    room_number: '302',
    floor: 3,
    status: 'occupied',
    housekeeping_status: 'clean',
    category: DEFAULT_ROOM_CATEGORIES[2],
  },
];

// In-memory working stores
export let localRoomsStore = [...DEFAULT_ROOMS];
export let localCategoriesStore = [...DEFAULT_ROOM_CATEGORIES];

export async function getRoomCategories(hotelId?: string): Promise<RoomCategory[]> {
  try {
    const supabase = createClient();
    const query = supabase.from('room_categories').select('*').order('base_rate', { ascending: true });
    if (hotelId) {
      query.eq('hotel_id', hotelId);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as RoomCategory[];
    }
  } catch {
    // Fallback
  }
  return localCategoriesStore;
}

export async function getRooms(hotelId?: string): Promise<RoomWithCategory[]> {
  try {
    const supabase = createClient();
    const query = supabase
      .from('rooms')
      .select(`
        *,
        category:category_id (*)
      `)
      .order('room_number', { ascending: true });

    if (hotelId) {
      query.eq('hotel_id', hotelId);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((r: any) => ({
        ...r,
        category: r.category || DEFAULT_ROOM_CATEGORIES[0],
      })) as RoomWithCategory[];
    }
  } catch {
    // Fallback
  }

  // Dynamically join category from localCategoriesStore to ensure rate updates propagate
  return localRoomsStore.map((room) => {
    const dynamicCategory =
      localCategoriesStore.find((c) => c.id === room.category_id) || room.category;
    return {
      ...room,
      category: dynamicCategory,
    };
  });
}
