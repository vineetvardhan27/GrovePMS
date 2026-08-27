'use server';

import { createClient as createServerClient } from '../supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getCurrentStaff } from '../auth/session';
import { HotelSettings } from './queries';
import { revalidatePath } from 'next/cache';

const BUCKET_NAME = 'hotel-logos';
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server configuration error: Service role key is missing.');
  }

  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Ensure storage bucket exists with public access
 */
async function ensureLogoBucketExists(admin: ReturnType<typeof getAdminClient>) {
  try {
    const { data: buckets } = await admin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await admin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE_BYTES,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      });
    }
  } catch (err) {
    console.warn('Could not verify/create hotel-logos bucket:', err);
  }
}

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
    const supabase = createServerClient();

    // 1. Fetch current hotel record and settings
    const { data: hotel, error: fetchErr } = (await supabase
      .from('hotels')
      .select('settings, address, phone, email')
      .eq('id', targetHotelId)
      .single()) as { data: { settings: any; address?: string; phone?: string; email?: string } | null; error: any };

    if (fetchErr) {
      console.error('Error fetching current hotel settings:', fetchErr.message);
    }

    const currentSettings = (hotel?.settings || {}) as any;

    // Server-side validation
    let gstPercentage = currentSettings.gst_percentage ?? 12;
    if (settings.gst_percentage !== undefined) {
      const parsedGst = Number(settings.gst_percentage);
      if (isNaN(parsedGst) || parsedGst < 0 || parsedGst > 100) {
        return { success: false, error: 'GST percentage must be a valid number between 0% and 100%.' };
      }
      gstPercentage = parsedGst;
    }

    const updatedSettings: HotelSettings = {
      ...currentSettings,
      ...settings,
      gst_percentage: gstPercentage,
      gst_rate: gstPercentage,
      gst_enabled: settings.gst_enabled !== undefined ? Boolean(settings.gst_enabled) : (currentSettings.gst_enabled ?? true),
      gst_number: settings.gst_number !== undefined
        ? (settings.gst_number ? String(settings.gst_number).trim() : null)
        : currentSettings.gst_number,
      pan_number: settings.pan_number !== undefined
        ? (settings.pan_number ? String(settings.pan_number).trim() : null)
        : currentSettings.pan_number,
      address: settings.address !== undefined
        ? String(settings.address).trim()
        : (currentSettings.address ?? hotel?.address),
      city: settings.city !== undefined
        ? String(settings.city).trim()
        : currentSettings.city,
      state: settings.state !== undefined
        ? String(settings.state).trim()
        : currentSettings.state,
      pin_code: settings.pin_code !== undefined
        ? String(settings.pin_code).trim()
        : currentSettings.pin_code,
      phone: settings.phone !== undefined
        ? String(settings.phone).trim()
        : (currentSettings.phone ?? hotel?.phone),
      email: settings.email !== undefined
        ? String(settings.email).trim()
        : (currentSettings.email ?? hotel?.email),
      logo_url: settings.logo_url !== undefined
        ? (settings.logo_url ? String(settings.logo_url).trim() : null)
        : (currentSettings.logo_url ?? null),
    };

    // 2. Build update payload for hotels table
    // Note: logo_url is housed inside settings JSONB; it is not a direct column on hotels
    const updatePayload: Record<string, any> = {
      settings: {
        ...updatedSettings,
        updated_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    };

    if (settings.address !== undefined && updatedSettings.address) {
      updatePayload.address = updatedSettings.address;
    }
    if (settings.phone !== undefined && updatedSettings.phone) {
      updatePayload.phone = updatedSettings.phone;
    }
    if (settings.email !== undefined && updatedSettings.email) {
      updatePayload.email = updatedSettings.email;
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
    revalidatePath('/food-beverage');
    revalidatePath('/banquet');
    revalidatePath('/reports');
    revalidatePath('/', 'layout');

    return { success: true, settings: updatedSettings };
  } catch (err: any) {
    console.error('Failed to update hotel settings:', err);
    return { success: false, error: err?.message || 'Database connection error.' };
  }
}

/**
 * Upload Hotel Logo directly to Supabase Storage and update hotel branding settings
 */
export async function uploadHotelLogoAction(
  formData: FormData
): Promise<{ success: boolean; logoUrl?: string; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { success: false, error: 'Please log in to continue.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return { success: false, error: 'Only hotel owners or managers can update the property logo.' };
    }

    const file = formData.get('logo') as File | null;
    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: 'No image file provided. Please choose a valid image.' };
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file format. Please upload a PNG, JPG, JPEG, or WebP image.',
      };
    }

    // Validate File Size (5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: 'File size exceeds the 5MB limit. Please upload an image under 5MB.',
      };
    }

    const admin = getAdminClient();
    await ensureLogoBucketExists(admin);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const cleanExt = ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext) ? ext : 'png';
    const filePath = `${staff.hotel_id}/logo_${Date.now()}.${cleanExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await admin.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return {
        success: false,
        error: `Failed to upload image to storage: ${uploadError.message}`,
      };
    }

    // Obtain public URL
    const { data: publicUrlData } = admin.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    const logoUrl = publicUrlData.publicUrl;

    if (!logoUrl) {
      return { success: false, error: 'Could not generate public URL for uploaded logo.' };
    }

    // Fetch current settings to preserve existing configuration
    const { data: hotelData } = (await admin
      .from('hotels')
      .select('settings')
      .eq('id', staff.hotel_id)
      .single()) as { data: { settings: any } | null; error: any };

    const currentSettings = hotelData?.settings || {};
    const updatedSettings = {
      ...currentSettings,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    };

    // Update hotels table settings
    const { error: updateDbError } = await (admin.from('hotels') as any)
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', staff.hotel_id);

    if (updateDbError) {
      console.error('Error saving logo URL to hotel record:', updateDbError);
      return { success: false, error: `Failed to save logo URL: ${updateDbError.message}` };
    }

    revalidatePath('/settings');
    revalidatePath('/settings/gst');
    revalidatePath('/billing');
    revalidatePath('/dashboard');
    revalidatePath('/food-beverage');
    revalidatePath('/banquet');
    revalidatePath('/reports');
    revalidatePath('/', 'layout');

    return { success: true, logoUrl };
  } catch (err: any) {
    console.error('Unexpected error during logo upload:', err);
    return { success: false, error: err?.message || 'An unexpected error occurred during upload.' };
  }
}

/**
 * Remove Hotel Logo and reset to default branding
 */
export async function deleteHotelLogoAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { success: false, error: 'Please log in to continue.' };
    }

    if (staff.role !== 'owner' && staff.role !== 'manager') {
      return { success: false, error: 'Only hotel owners or managers can remove the property logo.' };
    }

    const admin = getAdminClient();

    // Fetch current settings
    const { data: hotelData } = (await admin
      .from('hotels')
      .select('settings')
      .eq('id', staff.hotel_id)
      .single()) as { data: { settings: any } | null; error: any };

    const currentSettings = hotelData?.settings || {};
    const updatedSettings = {
      ...currentSettings,
      logo_url: null,
      updated_at: new Date().toISOString(),
    };

    // Update hotels table: set settings.logo_url = null
    const { error: updateDbError } = await (admin.from('hotels') as any)
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', staff.hotel_id);

    if (updateDbError) {
      console.error('Error clearing logo URL from hotel record:', updateDbError);
      return { success: false, error: `Failed to remove logo: ${updateDbError.message}` };
    }

    revalidatePath('/settings');
    revalidatePath('/settings/gst');
    revalidatePath('/billing');
    revalidatePath('/dashboard');
    revalidatePath('/food-beverage');
    revalidatePath('/banquet');
    revalidatePath('/reports');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (err: any) {
    console.error('Unexpected error during logo removal:', err);
    return { success: false, error: err?.message || 'An unexpected error occurred.' };
  }
}

