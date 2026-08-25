'use server';

import { createClient as createServerSupabaseClient } from '../supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { getCurrentStaff } from '../auth/session';
import { StaffRole } from '../types/database.types';

export interface StaffAccount {
  id: string;
  hotel_id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface StaffActionResult {
  success: boolean;
  error?: string;
  message?: string;
  staff?: StaffAccount;
}

/**
 * Get Supabase Service Role Admin Client
 */
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
 * Query all staff accounts for the caller's hotel
 */
export async function getHotelStaffMembers(hotelIdParam?: string): Promise<StaffAccount[]> {
  try {
    const callerStaff = await getCurrentStaff();
    if (!callerStaff) return [];

    const activeHotelId = hotelIdParam || callerStaff.hotel_id;
    const supabase = createServerSupabaseClient();

    const { data, error } = (await supabase
      .from('staff')
      .select('id, hotel_id, email, full_name, role, is_active, created_at, updated_at')
      .eq('hotel_id', activeHotelId)
      .order('created_at', { ascending: true })) as { data: StaffAccount[] | null; error: any };

    if (error) {
      console.error('Error fetching hotel staff:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('getHotelStaffMembers exception:', err);
    return [];
  }
}

/**
 * Create a new staff account under the caller's hotel (Owner only)
 */
export async function createStaffAccountAction(
  prevState: StaffActionResult | null,
  formData: FormData
): Promise<StaffActionResult> {
  try {
    const callerStaff = await getCurrentStaff();
    if (!callerStaff) {
      return { success: false, error: 'Unauthorized. Please sign in.' };
    }

    // Only Owner can create staff accounts
    if (callerStaff.role !== 'owner') {
      return { success: false, error: 'Only the property owner can add new staff accounts.' };
    }

    const email = (formData.get('email') as string)?.trim().toLowerCase();
    const password = (formData.get('password') as string)?.trim();
    const fullName = (formData.get('full_name') as string)?.trim();
    const role = (formData.get('role') as StaffRole) || 'reception';

    if (!email || !password || !fullName) {
      return { success: false, error: 'Please provide full name, email, and password.' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    // Reject Owner creation — Owner is created exclusively during hotel onboarding
    if (role === 'owner') {
      return {
        success: false,
        error: 'Owner accounts cannot be created from Staff Management. Exactly one Owner exists per property.',
      };
    }

    const validOperationalRoles: StaffRole[] = ['manager', 'reception', 'housekeeping'];
    if (!validOperationalRoles.includes(role)) {
      return { success: false, error: 'Invalid operational role. Allowed roles: Manager, Reception, Housekeeping.' };
    }

    const admin = getAdminClient();

    // 1. Create user in Supabase Auth via Admin API
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
        hotel_id: callerStaff.hotel_id,
      },
    });

    if (authErr || !authData?.user) {
      if (authErr?.message?.includes('already registered')) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      return { success: false, error: authErr?.message || 'Failed to create auth identity.' };
    }

    // 2. Insert into public.staff with strictly caller's hotel_id
    const { data: newStaff, error: staffErr } = (await admin
      .from('staff')
      .upsert({
        id: authData.user.id,
        hotel_id: callerStaff.hotel_id,
        email,
        full_name: fullName,
        role,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()) as { data: StaffAccount | null; error: any };

    if (staffErr) {
      console.error('Error inserting staff profile:', staffErr.message);
      return { success: false, error: 'Failed to create staff record: ' + staffErr.message };
    }

    revalidatePath('/settings/staff');
    revalidatePath('/', 'layout');

    return {
      success: true,
      message: `Staff member ${fullName} (${role}) added successfully.`,
      staff: newStaff || undefined,
    };
  } catch (err: any) {
    console.error('createStaffAccountAction unexpected error:', err);
    return { success: false, error: err?.message || 'Failed to create staff account.' };
  }
}

/**
 * Update staff role (Owner only, operational roles only)
 */
export async function updateStaffRoleAction(staffId: string, newRole: StaffRole): Promise<StaffActionResult> {
  try {
    const callerStaff = await getCurrentStaff();
    if (!callerStaff || callerStaff.role !== 'owner') {
      return { success: false, error: 'Only the property owner can modify staff roles.' };
    }

    if (newRole === 'owner') {
      return {
        success: false,
        error: 'Staff members cannot be promoted to Owner. Exactly one Owner exists per property.',
      };
    }

    const validOperationalRoles: StaffRole[] = ['manager', 'reception', 'housekeeping'];
    if (!validOperationalRoles.includes(newRole)) {
      return { success: false, error: 'Invalid operational role.' };
    }

    const admin = getAdminClient();

    // Verify target belongs to same hotel
    const { data: target, error: targetErr } = await admin
      .from('staff')
      .select('id, hotel_id, role')
      .eq('id', staffId)
      .eq('hotel_id', callerStaff.hotel_id)
      .maybeSingle();

    if (targetErr || !target) {
      return { success: false, error: 'Target staff record not found under your property.' };
    }

    if (target.role === 'owner') {
      return { success: false, error: 'The property Owner account role cannot be modified.' };
    }

    const { error: updateErr } = await admin
      .from('staff')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', staffId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath('/settings/staff');
    revalidatePath('/', 'layout');

    return { success: true, message: 'Role updated successfully.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update role.' };
  }
}

/**
 * Toggle staff active/inactive status (Owner only, Owner cannot be deactivated)
 */
export async function toggleStaffStatusAction(staffId: string, isActive: boolean): Promise<StaffActionResult> {
  try {
    const callerStaff = await getCurrentStaff();
    if (!callerStaff || callerStaff.role !== 'owner') {
      return { success: false, error: 'Only the property owner can modify account status.' };
    }

    if (callerStaff.id === staffId) {
      return { success: false, error: 'You cannot deactivate your own active owner session.' };
    }

    const admin = getAdminClient();

    // Verify hotel boundary
    const { data: target, error: targetErr } = await admin
      .from('staff')
      .select('id, hotel_id, role')
      .eq('id', staffId)
      .eq('hotel_id', callerStaff.hotel_id)
      .maybeSingle();

    if (targetErr || !target) {
      return { success: false, error: 'Target staff account not found.' };
    }

    if (target.role === 'owner') {
      return { success: false, error: 'The property Owner account cannot be deactivated.' };
    }

    const { error: updateErr } = await admin
      .from('staff')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', staffId);

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath('/settings/staff');
    revalidatePath('/', 'layout');

    return {
      success: true,
      message: `Account status updated to ${isActive ? 'Active' : 'Deactivated'}.`,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to toggle status.' };
  }
}

/**
 * Delete a staff account (Owner only, Owner cannot be deleted)
 */
export async function deleteStaffAccountAction(staffId: string): Promise<StaffActionResult> {
  try {
    const callerStaff = await getCurrentStaff();
    if (!callerStaff || callerStaff.role !== 'owner') {
      return { success: false, error: 'Only the property owner can remove staff accounts.' };
    }

    if (callerStaff.id === staffId) {
      return { success: false, error: 'You cannot delete your own active owner account.' };
    }

    const admin = getAdminClient();

    // Verify hotel boundary
    const { data: target, error: targetErr } = await admin
      .from('staff')
      .select('id, hotel_id, role')
      .eq('id', staffId)
      .eq('hotel_id', callerStaff.hotel_id)
      .maybeSingle();

    if (targetErr || !target) {
      return { success: false, error: 'Staff account not found under your property.' };
    }

    if (target.role === 'owner') {
      return { success: false, error: 'The property Owner account cannot be deleted.' };
    }

    // 1. Delete from staff
    await admin.from('staff').delete().eq('id', staffId);

    // 2. Delete from auth.users
    try {
      await admin.auth.admin.deleteUser(staffId);
    } catch {
      // Non-fatal if auth record was already removed
    }

    revalidatePath('/settings/staff');
    revalidatePath('/', 'layout');

    return { success: true, message: 'Staff account removed successfully.' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to remove staff account.' };
  }
}

