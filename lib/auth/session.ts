import { createClient } from '../supabase/server';
import { StaffRole } from '../types/database.types';

export interface StaffProfile {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  hotel_id: string;
  hotel_name: string;
  hotel_slug?: string;
  is_active: boolean;
}

/**
 * Route access permissions per role according to PRD §5 & Architecture.md §4
 */
export const ROLE_NAV_ITEMS: Record<StaffRole, string[]> = {
  owner: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/reports', '/settings'],
  manager: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments', '/reports'],
  reception: ['/dashboard', '/rooms', '/bookings', '/guests', '/billing', '/payments'],
  housekeeping: ['/dashboard', '/rooms'],
};

/**
 * Check whether a role has permission to access a given pathname
 */
export function hasRouteAccess(role: StaffRole, pathname: string): boolean {
  const allowedRoutes = ROLE_NAV_ITEMS[role] || ['/dashboard', '/rooms'];
  
  return allowedRoutes.some(
    (basePath) => pathname === basePath || pathname.startsWith(`${basePath}/`)
  );
}

/**
 * Server-side helper to get the currently authenticated staff member.
 * Derives identity exclusively from Supabase Auth + public.staff table.
 * Returns null if unauthenticated, or an object with error details if not registered as staff.
 */
export async function getCurrentStaff(): Promise<StaffProfile | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return null;
    }

    // 1. Query staff row by authenticated user ID
    const { data: staffRow, error: staffErr } = (await supabase
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
          slug
        )
      `)
      .eq('id', user.id)
      .maybeSingle()) as { data: any; error: any };

    if (staffErr) {
      console.error('Error fetching staff profile from Supabase:', staffErr.message);
    }

    if (staffRow && staffRow.is_active && staffRow.hotel_id) {
      const hotelData = staffRow.hotel as any;
      return {
        id: staffRow.id,
        email: staffRow.email,
        full_name: staffRow.full_name,
        role: staffRow.role as StaffRole,
        hotel_id: staffRow.hotel_id,
        hotel_name: hotelData?.name || 'Hotel Greenery View',
        hotel_slug: hotelData?.slug || 'hotel-greenery-view',
        is_active: staffRow.is_active,
      };
    }

    return null;
  } catch (err) {
    console.error('getCurrentStaff exception:', err);
    return null;
  }
}
