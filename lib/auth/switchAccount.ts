'use server';

import { createClient as createServerSupabaseClient } from '../supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { StaffRole } from '../types/database.types';

export interface AvailableStaffAccount {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  hotel_id: string;
}

/**
 * Fetch all active staff accounts available under the caller's hotel.
 * Only returns accounts belonging to the exact same hotel_id.
 */
export async function getAvailableStaffAccounts(): Promise<AvailableStaffAccount[]> {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return [];
    }

    // 1. Get caller's active staff profile to determine hotel_id
    const { data: callerStaff, error: callerErr } = (await supabase
      .from('staff')
      .select('id, hotel_id, is_active, role')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle()) as { data: { id: string; hotel_id: string; is_active: boolean; role: string } | null; error: any };

    if (callerErr || !callerStaff?.hotel_id) {
      return [];
    }

    // 2. Query all active staff in the same hotel
    const { data: accounts, error: accountsErr } = (await supabase
      .from('staff')
      .select('id, email, full_name, role, is_active, hotel_id')
      .eq('hotel_id', callerStaff.hotel_id)
      .eq('is_active', true)
      .order('role', { ascending: true })) as { data: AvailableStaffAccount[] | null; error: any };

    if (accountsErr || !accounts) {
      console.error('Error fetching available staff accounts:', accountsErr?.message);
      return [];
    }

    // Custom role ordering: owner -> manager -> reception -> housekeeping
    const roleWeight: Record<StaffRole, number> = {
      owner: 1,
      manager: 2,
      reception: 3,
      housekeeping: 4,
    };

    return accounts.sort(
      (a, b) => (roleWeight[a.role] || 99) - (roleWeight[b.role] || 99)
    );
  } catch (err) {
    console.error('getAvailableStaffAccounts exception:', err);
    return [];
  }
}

export interface SwitchAccountResult {
  success: boolean;
  error?: string;
  newRole?: StaffRole;
  newName?: string;
}

/**
 * Secure Server Action to switch active staff account.
 * Validates session, hotel boundary, and establishes a genuine Supabase Auth session for the target account.
 */
export async function switchStaffAccountAction(targetStaffId: string): Promise<SwitchAccountResult> {
  try {
    const ssrClient = createServerSupabaseClient();

    // 1. Validate caller authentication
    const {
      data: { user: currentUser },
      error: userErr,
    } = await ssrClient.auth.getUser();

    if (userErr || !currentUser) {
      return { success: false, error: 'Your session has expired. Please sign in again.' };
    }

    // 2. Validate caller's staff profile
    const { data: callerStaff, error: callerErr } = (await ssrClient
      .from('staff')
      .select('id, hotel_id, is_active, role')
      .eq('id', currentUser.id)
      .eq('is_active', true)
      .maybeSingle()) as { data: { id: string; hotel_id: string; is_active: boolean; role: string } | null; error: any };

    if (callerErr || !callerStaff) {
      return { success: false, error: 'Caller account is not active or recognized as staff.' };
    }

    // If already on the target account, return success immediately
    if (callerStaff.id === targetStaffId) {
      return { success: true };
    }

    // 3. Verify target staff exists, is active, and is in the exact same hotel
    const { data: targetStaff, error: targetErr } = (await ssrClient
      .from('staff')
      .select('id, email, full_name, role, is_active, hotel_id')
      .eq('id', targetStaffId)
      .eq('is_active', true)
      .eq('hotel_id', callerStaff.hotel_id)
      .maybeSingle()) as { data: { id: string; email: string; full_name: string; role: StaffRole; is_active: boolean; hotel_id: string } | null; error: any };

    if (targetErr || !targetStaff) {
      return {
        success: false,
        error: 'Target account not found, deactivated, or unauthorized for this property.',
      };
    }

    // 4. Initialize Supabase Admin client to generate a secure magiclink verification token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!serviceRoleKey) {
      return { success: false, error: 'Server configuration error: Service role key missing.' };
    }

    const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: targetStaff.email,
    });

    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error('generateLink error during account switch:', linkErr?.message);
      return { success: false, error: 'Failed to generate authorization token for target account.' };
    }

    // 5. Verify the token on the SSR client instance to update active HTTP-only session cookies
    const { data: verifyData, error: verifyErr } = await ssrClient.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    });

    if (verifyErr || !verifyData?.session) {
      console.error('verifyOtp error during account switch:', verifyErr?.message);
      return { success: false, error: 'Failed to transition active session cookies.' };
    }

    // 6. Invalidate server component cache
    revalidatePath('/', 'layout');

    return {
      success: true,
      newRole: targetStaff.role,
      newName: targetStaff.full_name,
    };
  } catch (err: any) {
    console.error('switchStaffAccountAction unexpected error:', err);
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while switching accounts.',
    };
  }
}
