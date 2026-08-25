import { StaffRole } from '../types/database.types';
import { User } from '@supabase/supabase-js';

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
