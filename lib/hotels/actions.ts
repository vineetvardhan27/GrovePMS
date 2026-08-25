'use server';

import { createClient } from '../supabase/server';
import { getCurrentStaff } from '../auth/session';
import { HotelSettings } from './queries';
import { revalidatePath } from 'next/cache';

export async function updateHotelSettingsAction(
  hotelId: string,
  settings: Partial<HotelSettings>
): Promise<{ success: boolean; error?: string; settings?: HotelSettings }> {
  const staff = await getCurrentStaff();
  if (!staff) {
    return { success: false, error: 'Please log in to continue.' };
  }

  if (staff.role !== 'owner') {
    return { success: false, error: 'Only hotel owners can modify hotel settings.' };
  }

  const targetHotelId = staff.hotel_id;

  try {
    const supabase = createClient();

    // 1. Fetch current settings
    const { data: hotel, error: fetchErr } = (await supabase
      .from('hotels')
      .select('settings')
      .eq('id', targetHotelId)
      .single()) as { data: { settings: any } | null; error: any };

    if (fetchErr) {
      console.error('Error fetching current hotel settings:', fetchErr.message);
    }

    const currentSettings = (hotel?.settings || {}) as any;

    const updatedSettings = {
      ...currentSettings,
      ...settings,
      gst_percentage: settings.gst_percentage !== undefined ? Number(settings.gst_percentage) : (currentSettings.gst_percentage ?? 12),
      gst_rate: settings.gst_percentage !== undefined ? Number(settings.gst_percentage) : (currentSettings.gst_rate ?? 12),
      gst_enabled: settings.gst_enabled !== undefined ? settings.gst_enabled : (currentSettings.gst_enabled ?? true),
      gst_number: settings.gst_number !== undefined ? settings.gst_number : currentSettings.gst_number,
      pan_number: settings.pan_number !== undefined ? settings.pan_number : currentSettings.pan_number,
      updated_at: new Date().toISOString(),
    };

    // 2. Update hotel in Supabase
    const updatePayload: any = {
      settings: updatedSettings,
      updated_at: new Date().toISOString(),
    };
    if (settings.logo_url !== undefined) {
      updatePayload.logo_url = settings.logo_url;
    }

    const { error: updateErr } = await (supabase.from('hotels') as any)
      .update(updatePayload)
      .eq('id', targetHotelId);

    if (updateErr) {
      console.error('Error updating hotel settings in Supabase:', updateErr.message);
      return { success: false, error: `Failed to update hotel settings: ${updateErr.message}` };
    }

    revalidatePath('/settings');
    revalidatePath('/settings/gst');
    revalidatePath('/billing');
    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');

    return { success: true, settings: updatedSettings as HotelSettings };
  } catch (err: any) {
    console.error('Failed to update hotel settings:', err);
    return { success: false, error: err?.message || 'Database connection error.' };
  }
}
