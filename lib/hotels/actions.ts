'use server';

import { createClient } from '../supabase/server';
import { HotelSettings } from './queries';
import { revalidatePath } from 'next/cache';

export async function updateHotelSettingsAction(
  hotelId: string,
  settings: Partial<HotelSettings>
): Promise<{ success: boolean; error?: string; settings?: HotelSettings }> {
  try {
    const supabase = createClient();
    const targetHotelId = hotelId || 'a0000000-0000-0000-0000-000000000001';

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
    const { error: updateErr } = await (supabase.from('hotels') as any)
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetHotelId);

    if (updateErr) {
      console.error('Error updating hotel settings in Supabase:', updateErr.message);
      return { success: false, error: 'Failed to update hotel settings in database.' };
    }

    revalidatePath('/settings');
    revalidatePath('/settings/gst');
    revalidatePath('/billing');
    revalidatePath('/dashboard');

    return { success: true, settings: updatedSettings as HotelSettings };
  } catch (err: any) {
    console.error('Failed to update hotel settings:', err);
    return { success: false, error: err?.message || 'Database connection error.' };
  }
}
