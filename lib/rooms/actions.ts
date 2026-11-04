'use server';

import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { RoomStatus, HousekeepingStatus } from '../types/database.types';
import { RoomCategory } from './queries';
import { revalidatePath } from 'next/cache';
import { invalidateCacheByTags, CACHE_CONFIG } from '../cache/serverCache';
import { getServiceSupabaseClient } from '../supabase/admin';
import {
  BuilderCategory,
  BuilderFloor,
  GeneratedRoom,
  PropertySummaryStats,
} from '@/components/rooms/visual-builder/types';

export async function updateRoomStatusAction(
  roomId: string,
  newStatus: RoomStatus,
  newHousekeepingStatus?: HousekeepingStatus
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return { success: false, error: 'Please log in to continue.' };
  }

  const hkStatus: HousekeepingStatus =
    newHousekeepingStatus || (newStatus === 'cleaning' ? 'dirty' : 'clean');

  try {
    const supabase = createClient();
    const { data: updatedRoom, error } = await (supabase.from('rooms') as any)
      .update({
        status: newStatus,
        housekeeping_status: hkStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)
      .eq('hotel_id', staff.hotel_id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating room status in Supabase:', error.message);
      return { success: false, error: `Failed to update room status: ${error.message}` };
    }

    if (!updatedRoom) {
      return { success: false, error: 'Room not found in your hotel.' };
    }

    revalidatePath('/rooms');
    revalidatePath('/dashboard');

    invalidateCacheByTags([
      CACHE_CONFIG.DASHBOARD_STATS.tag(staff.hotel_id),
      CACHE_CONFIG.ROOMS_CONFIG.tag(staff.hotel_id),
      'dashboard-stats',
    ]);

    return { success: true, roomId, newStatus, housekeeping_status: hkStatus };
  } catch (err: any) {
    console.error('Failed to update room status:', err);
    return { success: false, error: err?.message || 'Database connection error.' };
  }
}

export async function saveRoomCategoryAction(category: Partial<RoomCategory>) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return { success: false, error: 'Please log in to continue.' };
  }

  if (staff.role !== 'owner' && staff.role !== 'manager') {
    return { success: false, error: 'Only owners and managers can modify room categories.' };
  }

  const id = category.id && category.id.trim() !== '' ? category.id : crypto.randomUUID();
  const categoryData: RoomCategory = {
    id,
    hotel_id: staff.hotel_id,
    name: category.name?.trim() || 'New Category',
    description: category.description?.trim() || null,
    base_rate: Number(category.base_rate) || 2000,
    weekend_rate: category.weekend_rate ? Number(category.weekend_rate) : null,
    max_occupancy: Number(category.max_occupancy) || 2,
    extra_bed_rate: category.extra_bed_rate ? Number(category.extra_bed_rate) : 0,
  };

  try {
    const supabase = createClient();
    const { error } = await (supabase.from('room_categories') as any)
      .upsert(categoryData)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error upserting room category in Supabase:', error.message);
      return { success: false, error: `Failed to save room category: ${error.message}` };
    }

    revalidatePath('/settings/room-categories');
    revalidatePath('/rooms');
    revalidatePath('/dashboard');

    invalidateCacheByTags([
      CACHE_CONFIG.ROOM_CATEGORIES.tag(staff.hotel_id),
      CACHE_CONFIG.ROOMS_CONFIG.tag(staff.hotel_id),
      'room-categories',
    ]);

    return { success: true, category: categoryData };
  } catch (err: any) {
    console.error('Failed to save room category:', err);
    return { success: false, error: err?.message || 'Database connection error.' };
  }
}

export async function saveRoomRateOverrideAction(
  roomId: string,
  baseRateOverride: number | null,
  weekendRateOverride: number | null
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return { success: false, error: 'Please log in to continue.' };
  }

  if (staff.role !== 'owner' && staff.role !== 'manager') {
    return { success: false, error: 'Only owners and managers can configure room-specific rate overrides.' };
  }

  try {
    const supabase = createClient();
    const { data: updatedRoom, error } = await (supabase.from('rooms') as any)
      .update({
        base_rate_override: baseRateOverride !== null && baseRateOverride > 0 ? baseRateOverride : null,
        weekend_rate_override: weekendRateOverride !== null && weekendRateOverride > 0 ? weekendRateOverride : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId)
      .eq('hotel_id', staff.hotel_id)
      .select('*, category:category_id(*)')
      .maybeSingle();

    if (error) {
      console.error('Error updating room override in Supabase:', error.message);
      return { success: false, error: `Failed to update room override: ${error.message}` };
    }

    revalidatePath('/settings/room-categories');
    revalidatePath('/rooms');
    revalidatePath('/dashboard');

    invalidateCacheByTags([
      CACHE_CONFIG.ROOM_CATEGORIES.tag(staff.hotel_id),
      CACHE_CONFIG.ROOMS_CONFIG.tag(staff.hotel_id),
      'room-categories',
    ]);

    return { success: true, room: updatedRoom };
  } catch (err: any) {
    console.error('Failed to save room rate override:', err);
    return { success: false, error: err?.message || 'Database connection error.' };
  }
}

/**
 * Persists the entire visual room and floor builder layout into the hotel's
 * database schema (room_categories, rooms, and hotels.settings.property_layout).
 * 
 * Safety features:
 * - Upserts room categories with custom pricing & extra bed adjustments.
 * - Synchronizes generated rooms with floor numbers and category associations.
 * - Retains rooms with active reservations to prevent foreign-key constraints or loss of guest booking records.
 * - Stores the full layout block structure in hotels.settings for live restoration.
 */
export async function saveVisualRoomLayoutAction(layout: {
  categories: BuilderCategory[];
  floors: BuilderFloor[];
  generatedRooms: GeneratedRoom[];
  stats?: PropertySummaryStats;
}) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return { success: false, error: 'Please log in to continue.' };
  }

  if (staff.role !== 'owner' && staff.role !== 'manager') {
    return { success: false, error: 'Only owners and managers can reconfigure property rooms and floors.' };
  }

  if (!layout.categories || layout.categories.length === 0) {
    return { success: false, error: 'At least one room category is required.' };
  }

  if (!layout.generatedRooms || layout.generatedRooms.length === 0) {
    return { success: false, error: 'At least one room allocation is required across your floors.' };
  }

  const hotelId = staff.hotel_id;
  const admin = getServiceSupabaseClient();

  try {
    // 1. Process Categories: upsert each category into room_categories
    const { data: rawCategories } = await (admin.from('room_categories') as any)
      .select('id, name')
      .eq('hotel_id', hotelId);

    const existingCategories = (rawCategories as Array<{ id: string; name: string }>) || [];
    const existingCatMap = new Map<string, string>();
    existingCategories.forEach((c) => {
      existingCatMap.set(c.id, c.id);
      existingCatMap.set(c.name.trim().toLowerCase(), c.id);
    });

    const categoryIdMapping = new Map<string, string>(); // builder ID -> database UUID

    for (const cat of layout.categories) {
      const isRealUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cat.id);
      let targetDbId = isRealUuid ? cat.id : existingCatMap.get(cat.id) || existingCatMap.get(cat.name.trim().toLowerCase());

      if (!targetDbId) {
        targetDbId = crypto.randomUUID();
      }

      const catRecord = {
        id: targetDbId,
        hotel_id: hotelId,
        name: cat.name.trim(),
        description: cat.description?.trim() || null,
        base_rate: Number(cat.base_rate) || 2000,
        weekend_rate: cat.weekend_rate ? Number(cat.weekend_rate) : null,
        max_occupancy: Number(cat.max_occupancy) || 2,
        extra_bed_rate: cat.extra_bed_rate ? Number(cat.extra_bed_rate) : 0,
      };

      const { error: catUpsertErr } = await (admin.from('room_categories') as any).upsert(catRecord);
      if (catUpsertErr) {
        console.error('Error upserting room category in builder sync:', catUpsertErr.message);
      }

      categoryIdMapping.set(cat.id, targetDbId);
      categoryIdMapping.set(cat.name.trim().toLowerCase(), targetDbId);
    }

    // 2. Process Rooms: fetch existing rooms and check booking references
    const { data: rawRooms } = await (admin.from('rooms') as any)
      .select('id, room_number, floor, category_id')
      .eq('hotel_id', hotelId);

    const existingRooms = (rawRooms as Array<{ id: string; room_number: string; floor: number; category_id: string }>) || [];

    const { data: rawBookings } = await (admin.from('bookings') as any)
      .select('room_id')
      .eq('hotel_id', hotelId)
      .in('status', ['confirmed', 'checked_in', 'pending']);

    const bookedRows = (rawBookings as Array<{ room_id: string }>) || [];
    const bookedRoomIds = new Set(bookedRows.map((b) => b.room_id));

    const existingRoomMap = new Map<string, { id: string; floor: number; category_id: string }>();
    existingRooms.forEach((r) => {
      existingRoomMap.set(r.room_number.trim(), { id: r.id, floor: r.floor, category_id: r.category_id });
    });

    const currentManifestNumbers = new Set(layout.generatedRooms.map((r) => r.roomNumber.trim()));

    // Synchronize generated rooms
    for (const genRoom of layout.generatedRooms) {
      const roomNum = genRoom.roomNumber.trim();
      const targetCatId =
        categoryIdMapping.get(genRoom.categoryId) ||
        categoryIdMapping.get(genRoom.categoryName.trim().toLowerCase()) ||
        existingCategories?.[0]?.id;

      if (!targetCatId) continue;

      const existing = existingRoomMap.get(roomNum);
      if (existing) {
        // Update floor and category if altered in builder
        await (admin.from('rooms') as any)
          .update({
            floor: genRoom.floor,
            category_id: targetCatId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .eq('hotel_id', hotelId);
      } else {
        // Insert new room
        await (admin.from('rooms') as any).insert({
          hotel_id: hotelId,
          category_id: targetCatId,
          room_number: roomNum,
          floor: genRoom.floor,
          status: 'available',
          housekeeping_status: 'clean',
        });
      }
    }

    // Handle existing rooms that are no longer in the builder manifest
    const retainedRoomsWithBookings: string[] = [];
    existingRoomMap.forEach((rData, roomNum) => {
      if (!currentManifestNumbers.has(roomNum)) {
        if (bookedRoomIds.has(rData.id)) {
          retainedRoomsWithBookings.push(roomNum);
        } else {
          // Safe to delete room without active bookings
          (admin.from('rooms') as any).delete().eq('id', rData.id).eq('hotel_id', hotelId);
        }
      }
    });

    // 3. Persist layout metadata in hotel settings
    const { data: hotelData } = await admin
      .from('hotels')
      .select('settings')
      .eq('id', hotelId)
      .maybeSingle();

    const currentSettings = ((hotelData as any)?.settings as Record<string, any>) || {};
    const updatedSettings = {
      ...currentSettings,
      property_layout: {
        categories: layout.categories,
        floors: layout.floors,
        updated_at: new Date().toISOString(),
      },
    };

    await (admin.from('hotels') as any)
      .update({ settings: updatedSettings, updated_at: new Date().toISOString() })
      .eq('id', hotelId);

    revalidatePath('/settings/room-categories');
    revalidatePath('/rooms');
    revalidatePath('/dashboard');

    invalidateCacheByTags([
      CACHE_CONFIG.ROOM_CATEGORIES.tag(hotelId),
      CACHE_CONFIG.ROOMS_CONFIG.tag(hotelId),
      CACHE_CONFIG.DASHBOARD_STATS.tag(hotelId),
      'room-categories',
      'dashboard-stats',
    ]);

    let message = `Successfully updated property inventory with ${layout.generatedRooms.length} room(s) across ${layout.floors.length} floor(s).`;
    if (retainedRoomsWithBookings.length > 0) {
      message += ` (Note: Room(s) ${retainedRoomsWithBookings.join(', ')} were retained because they have active guest reservations).`;
    }

    return { success: true, message };
  } catch (err: any) {
    console.error('Error in saveVisualRoomLayoutAction:', err);
    return { success: false, error: err?.message || 'Failed to persist room layout.' };
  }
}

