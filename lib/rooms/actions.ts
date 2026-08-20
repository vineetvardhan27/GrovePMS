'use server';

import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { RoomStatus, HousekeepingStatus } from '../types/database.types';
import { RoomCategory } from './queries';
import { revalidatePath } from 'next/cache';

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

    return { success: true, room: updatedRoom };
  } catch (err: any) {
    console.error('Failed to save room rate override:', err);
    return { success: false, error: err?.message || 'Database connection error.' };
  }
}

