import { cookies } from 'next/headers';
import { createClient } from '../supabase/server';
import { StaffRole } from '../types/database.types';

export interface StaffProfile {
  id: string;
  email: string;
  full_name: string;
  role: StaffRole;
  hotel_id: string;
  hotel_name: string;
}

export const DEMO_STAFF_ACCOUNTS: Record<StaffRole, StaffProfile> = {
  owner: {
    id: 's0000000-0000-0000-0000-000000000001',
    email: 'owner@hotelgreeneryview.com',
    full_name: 'Ohm Adhikari',
    role: 'owner',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    hotel_name: 'Hotel Greenery View',
  },
  manager: {
    id: 's0000000-0000-0000-0000-000000000002',
    email: 'manager@hotelgreeneryview.com',
    full_name: 'Priya Sharma',
    role: 'manager',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    hotel_name: 'Hotel Greenery View',
  },
  reception: {
    id: 's0000000-0000-0000-0000-000000000003',
    email: 'reception@hotelgreeneryview.com',
    full_name: 'Rahul Verma',
    role: 'reception',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    hotel_name: 'Hotel Greenery View',
  },
  housekeeping: {
    id: 's0000000-0000-0000-0000-000000000004',
    email: 'housekeeping@hotelgreeneryview.com',
    full_name: 'Sunita Devi',
    role: 'housekeeping',
    hotel_id: 'a0000000-0000-0000-0000-000000000001',
    hotel_name: 'Hotel Greenery View',
  },
};

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
 * Server-side helper to get the currently authenticated staff member
 */
export async function getCurrentStaff(): Promise<StaffProfile | null> {
  const cookieStore = cookies();
  const demoRoleCookie = cookieStore.get('pms_demo_role')?.value as StaffRole | undefined;

  // Check demo/test role session first
  if (demoRoleCookie && DEMO_STAFF_ACCOUNTS[demoRoleCookie]) {
    return DEMO_STAFF_ACCOUNTS[demoRoleCookie];
  }

  // Check live Supabase Auth session
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (user && !userErr) {
      const { data: staff, error: staffErr } = (await supabase
        .from('staff')
        .select('id, email, full_name, role, hotel_id')
        .eq('id', user.id)
        .maybeSingle()) as { data: { id: string; email: string; full_name: string; role: string; hotel_id: string } | null; error: any };

      if (staffErr || !staff) {
        const metaRole = (user.user_metadata?.role as StaffRole) || 'reception';
        return {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Staff Member',
          role: metaRole,
          hotel_id: 'a0000000-0000-0000-0000-000000000001',
          hotel_name: 'Hotel Greenery View',
        };
      }

      return {
        id: staff.id,
        email: staff.email,
        full_name: staff.full_name,
        role: staff.role as StaffRole,
        hotel_id: staff.hotel_id,
        hotel_name: 'Hotel Greenery View',
      };
    }
  } catch {
    // Fallback to default owner profile
  }

  // Default to owner demo account for development/demo testing
  return DEMO_STAFF_ACCOUNTS.owner;
}

