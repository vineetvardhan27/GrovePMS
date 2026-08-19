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
    const { error } = await (supabase.from('rooms') as any)
      .update({
        status: newStatus,
        housekeeping_status: hkStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    if (error) {
      console.error('Error updating room status in Supabase:', error.message);
      return { success: false, error: 'Failed to update room status in database.' };
    }
  } catch (err: any) {
    console.error('Failed to update room status:', err);
    return { success: false, error: err?.message || 'Database connection error.' };
  }

  // Update in-memory store
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
  const id = category.id && category.id.trim() !== '' ? category.id : crypto.randomUUID();
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
    const { error } = await (supabase.from('room_categories') as any).upsert(categoryData);
    if (error) {
      console.error('Error upserting room category in Supabase:', error.message);
      return { success: false, error: 'Failed to save room category to database.' };
    }
  } catch (err: any) {
    console.error('Failed to save room category:', err);
    return { success: false, error: err?.message || 'Database connection error.' };
  }

  const existingIdx = localCategoriesStore.findIndex((c) => c.id === id);
  if (existingIdx >= 0) {
    localCategoriesStore[existingIdx] = categoryData;
  } else {
    localCategoriesStore.push(categoryData);
  }

  revalidatePath('/settings/room-categories');
  revalidatePath('/rooms');
  revalidatePath('/dashboard');

  return { success: true, category: categoryData };
}

