import * as React from 'react';
import { createClient } from '../supabase/server';
import { StaffRole } from '../types/database.types';
import { User } from '@supabase/supabase-js';

// Safe server-only cache helper that gracefully falls back if evaluated in client bundler
const serverCache = typeof (React as any).cache === 'function' ? (React as any).cache : (<T extends (...args: any[]) => any>(fn: T): T => fn);

import { hasRoutePermission, ROLE_ALLOWED_ROUTES } from './permissions';

export interface StaffProfile {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  hotel_id: string;
  hotel_name: string;
  hotel_slug?: string;
  hotel_logo_url?: string | null;
  hotel_settings?: Record<string, any> | null;
  is_active: boolean;
}

export type StaffResolutionResult =
  | { status: 'unauthenticated'; user: null; staff: null }
  | { status: 'no_staff_record'; user: User; staff: null }
  | { status: 'inactive_staff'; user: User; staff: any }
  | { status: 'hotel_not_found'; user: User; staff: any }
  | { status: 'success'; user: User; staff: StaffProfile };

export const ROLE_NAV_ITEMS = ROLE_ALLOWED_ROUTES;
export const hasRouteAccess = hasRoutePermission;

/**
 * Detailed staff and hotel resolution for authenticated users.
 * Resolves identity through auth.users.id -> staff.id -> staff.hotel_id -> hotels.id.
 * Deduplicated per-request via serverCache.
 */
export const getStaffResolution = serverCache(async function getStaffResolution(): Promise<StaffResolutionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return { status: 'unauthenticated', user: null, staff: null };
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] User authenticated: ${user.id} (${user.email})`);
    }

    // 1. Primary lookup: auth.users.id === staff.id
    let { data: staffRow, error: staffErr } = (await supabase
      .from('staff')
      .select(`
        id,
        email,
        full_name,
        role,
        is_active,
        hotel_id,
        hotel:hotel_id (
          id,
          name,
          slug,
          settings
        )
      `)
      .eq('id', user.id)
      .maybeSingle()) as { data: any; error: any };

    if (staffErr) {
      console.error('[AUTH] Error querying staff by id:', staffErr.message);
    }

    // 2. Secondary fallback lookup by email (case-insensitive) if ID lookup did not find a row
    if (!staffRow && user.email) {
      const normalizedEmail = user.email.toLowerCase().trim();
      const { data: staffByEmail, error: emailErr } = (await supabase
        .from('staff')
        .select(`
          id,
          email,
          full_name,
          role,
          is_active,
          hotel_id,
          hotel:hotel_id (
            id,
            name,
            slug,
            settings
          )
        `)
        .ilike('email', normalizedEmail)
        .maybeSingle()) as { data: any; error: any };

      if (!emailErr && staffByEmail) {
        staffRow = staffByEmail;
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[AUTH] Staff matched via email fallback for user ${user.id}`);
        }
      }
    }

    if (!staffRow) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AUTH] Staff found: false');
      }
      return { status: 'no_staff_record', user, staff: null };
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] Staff found: true`);
      console.log(`[AUTH] Staff ID: ${staffRow.id}`);
      console.log(`[AUTH] Staff hotel_id: ${staffRow.hotel_id}`);
      console.log(`[AUTH] Role: ${staffRow.role}`);
      console.log(`[AUTH] Active: ${staffRow.is_active}`);
    }

    if (!staffRow.is_active) {
      return { status: 'inactive_staff', user, staff: staffRow };
    }

    // If hotel was not joined directly or hotel_id missing
    let hotelData = staffRow.hotel;
    if (!hotelData && staffRow.hotel_id) {
      const { data: directHotel, error: hotelErr } = await supabase
        .from('hotels')
        .select('id, name, slug, settings')
        .eq('id', staffRow.hotel_id)
        .maybeSingle();

      if (hotelErr) {
        console.error('[AUTH] Error fetching hotel directly:', hotelErr.message);
      }
      hotelData = directHotel;
    }

    if (!hotelData && !staffRow.hotel_id) {
      return { status: 'hotel_not_found', user, staff: staffRow };
    }

    const hotelName = hotelData?.name || 'Hotel Greenery View';
    const hotelSlug = hotelData?.slug || 'hotel-greenery-view';
    const hotelSettings = hotelData?.settings || null;
    const hotelLogoUrl = (hotelSettings as any)?.logo_url || (hotelData as any)?.logo_url || null;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUTH] Hotel found: ${Boolean(hotelData)}`);
      console.log(`[AUTH] Login resolution successful`);
    }

    const profile: StaffProfile = {
      id: staffRow.id,
      email: staffRow.email,
      full_name: staffRow.full_name,
      role: staffRow.role as StaffRole,
      hotel_id: staffRow.hotel_id,
      hotel_name: hotelName,
      hotel_slug: hotelSlug,
      hotel_logo_url: hotelLogoUrl,
      hotel_settings: hotelSettings,
      is_active: staffRow.is_active,
    };


    return { status: 'success', user, staff: profile };
  } catch (err) {
    console.error('[AUTH] getCurrentStaff exception:', err);
    return { status: 'unauthenticated', user: null, staff: null };
  }
});

/**
 * Server-side helper to get the currently authenticated staff member.
 * Derives identity exclusively from Supabase Auth + public.staff table.
 * Deduplicated per-request via serverCache.
 */
export const getCurrentStaff = serverCache(async function getCurrentStaff(): Promise<StaffProfile | null> {
  const resolution = await getStaffResolution();
  if (resolution.status === 'success') {
    return resolution.staff;
  }
  return null;
});

