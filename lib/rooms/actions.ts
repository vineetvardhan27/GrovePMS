'use server';

import { createClient } from '../supabase/server';
import { RoomStatus, HousekeepingStatus } from '../types/database.types';
import { RoomCategory, localRoomsStore, localCategoriesStore } from './queries';
import { revalidatePath } from 'next/cache';

export async function updateRoomStatusAction(
  roomId: string,
  newStatus: RoomStatus,
  newHousekeepingStatus?: HousekeepingStatus
) {
  const hkStatus: HousekeepingStatus =
    newHousekeepingStatus || (newStatus === 'cleaning' ? 'dirty' : 'clean');

  try {
    const supabase = createClient();
    await (supabase.from('rooms') as any)
      .update({
        status: newStatus,
        housekeeping_status: hkStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);
  } catch {
    // Update local memory store fallback
  }

  // Update in-memory fallback
  const idx = localRoomsStore.findIndex((r) => r.id === roomId);
  if (idx >= 0) {
    localRoomsStore[idx] = {
      ...localRoomsStore[idx],
      status: newStatus,
      housekeeping_status: hkStatus,
    };
  }

  revalidatePath('/rooms');
  revalidatePath('/dashboard');

  return { success: true, roomId, newStatus, housekeeping_status: hkStatus };
}

export async function saveRoomCategoryAction(category: Partial<RoomCategory>) {
  const id = category.id || `c${Date.now()}`;
  const categoryData: RoomCategory = {
    id,
    hotel_id: category.hotel_id || 'a0000000-0000-0000-0000-000000000001',
    name: category.name || 'New Category',
    description: category.description || null,
    base_rate: Number(category.base_rate) || 2000,
    weekend_rate: category.weekend_rate ? Number(category.weekend_rate) : null,
    max_occupancy: Number(category.max_occupancy) || 2,
    extra_bed_rate: category.extra_bed_rate ? Number(category.extra_bed_rate) : 0,
  };

  try {
    const supabase = createClient();
    await (supabase.from('room_categories') as any).upsert(categoryData);
  } catch {
    // Fallback
  }

  const existingIdx = localCategoriesStore.findIndex((c) => c.id === id);
  if (existingIdx >= 0) {
    localCategoriesStore[existingIdx] = categoryData;
  } else {
    localCategoriesStore.push(categoryData);
  }

  revalidatePath('/settings/room-categories');
  revalidatePath('/rooms');

  return { success: true, category: categoryData };
}
