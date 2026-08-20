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
  base_rate_override?: number | null;
  weekend_rate_override?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface PropertyResource {
  id: string;
  hotel_id: string;
  name: string;
  resource_type: string;
  capacity: number;
  status: 'available' | 'reserved' | 'occupied' | 'cleaning' | 'maintenance';
  description: string;
  daily_rate: number;
  hourly_rate: number;
  is_active: boolean;
}

export function getEffectiveRoomRates(room: RoomWithCategory): {
  base_rate: number;
  weekend_rate: number | null;
  hasOverride: boolean;
} {
  const hasBaseOverride =
    room.base_rate_override !== undefined &&
    room.base_rate_override !== null &&
    Number(room.base_rate_override) > 0;
  const hasWeekendOverride =
    room.weekend_rate_override !== undefined &&
    room.weekend_rate_override !== null &&
    Number(room.weekend_rate_override) > 0;

  const base_rate = hasBaseOverride
    ? Number(room.base_rate_override)
    : Number(room.category?.base_rate || 2500);

  const weekend_rate = hasWeekendOverride
    ? Number(room.weekend_rate_override)
    : room.category?.weekend_rate !== undefined && room.category?.weekend_rate !== null
    ? Number(room.category.weekend_rate)
    : null;

  return {
    base_rate,
    weekend_rate,
    hasOverride: hasBaseOverride || hasWeekendOverride,
  };
}
