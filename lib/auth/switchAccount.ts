'use server';

import { createClient as createServerSupabaseClient } from '../supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { StaffRole } from '../types/database.types';
import { SWITCH_ALLOWED_ROLES, canSwitchToAccount } from './switchAccountHelpers';
import { StaffProfile } from './types';

export interface AvailableStaffAccount {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  is_active: boolean;
  hotel_id: string;
}


/**
 * Fetch staff accounts the current authenticated user is authorized to switch into.
 *
 * - Strictly scoped to caller's hotel_id (server-side, not frontend-filtered).
 * - Applies role hierarchy: caller role determines which target roles are visible.
 * - Reception and Housekeeping only receive their own record.
 * - If callerStaff context is provided, reuses already-resolved staff identity
 *   avoiding redundant getUser() and staff queries.
 */
export async function getAvailableStaffAccounts(
  knownHotelId?: string,
  callerStaff?: StaffProfile | null
): Promise<AvailableStaffAccount[]> {
  try {
    const supabase = createServerSupabaseClient();

    let callerStaffId: string;
    let resolvedHotelId: string;
    let callerRole: StaffRole;
    let callerEmail: string | undefined;
    let callerFullName: string | undefined;
    let callerIsActive: boolean = true;

    if (callerStaff?.id && callerStaff?.hotel_id && callerStaff?.role) {
      // Fast path: Reuse caller context already resolved by getStaffResolution()
      callerStaffId = callerStaff.id;
      resolvedHotelId = callerStaff.hotel_id;
      callerRole = callerStaff.role;
      callerEmail = callerStaff.email;
      callerFullName = callerStaff.full_name;
      callerIsActive = callerStaff.is_active;
    } else {
      // 1. Resolve caller's authenticated identity
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) return [];

      // 2. Get caller's active staff record (hotel_id + role)
      const { data: staffRecord, error: callerErr } = (await supabase
        .from('staff')
        .select('id, email, full_name, hotel_id, role, is_active')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle()) as {
        data: { id: string; email: string; full_name: string; hotel_id: string; role: StaffRole; is_active: boolean } | null;
        error: any;
      };

      if (callerErr || !staffRecord?.hotel_id) return [];

      callerStaffId = staffRecord.id;
      resolvedHotelId = staffRecord.hotel_id;
      callerRole = staffRecord.role;
      callerEmail = staffRecord.email;
      callerFullName = staffRecord.full_name;
      callerIsActive = staffRecord.is_active;
    }

    // 3. Determine which roles this caller may switch into
    const allowedRoles = SWITCH_ALLOWED_ROLES[callerRole] ?? [];

    // Reception and Housekeeping can only see themselves — no switcher needed
    if (allowedRoles.length <= 1) {
      if (callerEmail && callerFullName) {
        return [
          {
            id: callerStaffId,
            email: callerEmail,
            full_name: callerFullName,
            role: callerRole,
            is_active: callerIsActive,
            hotel_id: resolvedHotelId,
          },
        ];
      }
      // Fallback query if caller details are missing
      const { data: self } = (await supabase
        .from('staff')
        .select('id, email, full_name, role, is_active, hotel_id')
        .eq('id', callerStaffId)
        .maybeSingle()) as { data: AvailableStaffAccount | null };
      return self ? [self] : [];
    }

    // 4. Query active staff in the SAME hotel only, filtered by hierarchy roles
    const { data: accounts, error: accountsErr } = (await supabase
      .from('staff')
      .select('id, email, full_name, role, is_active, hotel_id')
      .eq('hotel_id', resolvedHotelId)   // ← tenant boundary enforced server-side
      .eq('is_active', true)
      .in('role', allowedRoles)          // ← hierarchy enforced server-side
      .order('role', { ascending: true })) as {
      data: AvailableStaffAccount[] | null;
      error: any;
    };

    if (accountsErr || !accounts) {
      console.error('Error fetching available staff accounts:', accountsErr?.message);
      return [];
    }

    // Custom role ordering: owner → manager → reception → housekeeping
    const roleWeight: Record<StaffRole, number> = {
      owner: 1,
      manager: 2,
      reception: 3,
      housekeeping: 4,
    };

    return accounts.sort(
      (a, b) => (roleWeight[a.role] ?? 99) - (roleWeight[b.role] ?? 99)
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
 *
 * Full validation chain:
 *   1. Verify caller's Supabase Auth session
 *   2. Verify caller's staff record (hotel_id + role)
 *   3. Verify target staff exists, is active, same hotel
 *   4. Enforce hierarchy: canSwitchToAccount()
 *   5. Generate a server-signed magic-link token for the target account
 *   6. Verify the token to update HTTP-only session cookies
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
      .maybeSingle()) as {
      data: { id: string; hotel_id: string; is_active: boolean; role: StaffRole } | null;
      error: any;
    };

    if (callerErr || !callerStaff) {
      return { success: false, error: 'Caller account is not active or recognized as staff.' };
    }

    // Switching to self is always valid
    if (callerStaff.id === targetStaffId) {
      return { success: true };
    }

    // 3. Verify target staff: must be active AND in the exact same hotel
    const { data: targetStaff, error: targetErr } = (await ssrClient
      .from('staff')
      .select('id, email, full_name, role, is_active, hotel_id')
      .eq('id', targetStaffId)
      .eq('is_active', true)
      .eq('hotel_id', callerStaff.hotel_id)  // ← tenant boundary enforced
      .maybeSingle()) as {
      data: {
        id: string;
        email: string;
        full_name: string;
        role: StaffRole;
        is_active: boolean;
        hotel_id: string;
      } | null;
      error: any;
    };

    if (targetErr || !targetStaff) {
      return {
        success: false,
        error: 'Target account not found, deactivated, or belongs to a different property.',
      };
    }

    // 4. Enforce role hierarchy — central authorization check
    if (
      !canSwitchToAccount(
        callerStaff.role,
        callerStaff.hotel_id,
        targetStaff.role,
        targetStaff.hotel_id
      )
    ) {
      return {
        success: false,
        error: `Your role (${callerStaff.role}) is not authorized to switch into a ${targetStaff.role} account.`,
      };
    }

    // 5. Initialize Supabase Admin client for session token generation
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

    // 6. Verify the token on the SSR client to update HTTP-only session cookies
    const { data: verifyData, error: verifyErr } = await ssrClient.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'magiclink',
    });

    if (verifyErr || !verifyData?.session) {
      console.error('verifyOtp error during account switch:', verifyErr?.message);
      return { success: false, error: 'Failed to transition active session cookies.' };
    }

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
