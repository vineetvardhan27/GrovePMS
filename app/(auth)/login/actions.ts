'use server';

import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { StaffRole } from '../../../lib/types/database.types';

export interface AuthState {
  error?: string;
  success?: boolean;
  message?: string;
}

/**
 * Sign in existing user via Supabase Auth
 */
export async function signIn(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  try {
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase signInWithPassword error:', authError.message);

      if (authError.message.includes('Invalid login credentials')) {
        return { error: 'Invalid email or password. Please verify your credentials.' };
      }
      if (authError.message.includes('Email not confirmed')) {
        return { error: 'Your email address is not yet confirmed. Please verify your email before logging in.' };
      }
      if (authError.message.includes('rate limit')) {
        return { error: 'Too many login attempts. Please wait a few moments and try again.' };
      }
      return { error: authError.message || 'Unable to sign in. Please verify your credentials.' };
    }

    if (!authData?.user) {
      return { error: 'Sign-in failed to establish an authenticated session. Please try again.' };
    }

    // Verify staff account exists by auth.users.id
    let { data: staff, error: staffErr } = (await supabase
      .from('staff')
      .select('id, hotel_id, role, is_active')
      .eq('id', authData.user.id)
      .maybeSingle()) as { data: { id: string; hotel_id: string; role: string; is_active: boolean } | null; error: any };

    if (staffErr) {
      console.error('Staff lookup after login failed:', staffErr.message);
    }

    // Fallback lookup by email
    if (!staff && authData.user.email) {
      const { data: staffByEmail } = await supabase
        .from('staff')
        .select('id, hotel_id, role, is_active')
        .ilike('email', authData.user.email.trim().toLowerCase())
        .maybeSingle();

      if (staffByEmail) {
        staff = staffByEmail;
      }
    }

    if (!staff) {
      await supabase.auth.signOut();
      return {
        error: 'Your account is not associated with any active hotel property. Please contact your hotel owner or register your property.',
      };
    }

    if (!staff.is_active) {
      await supabase.auth.signOut();
      return { error: 'Your staff account is currently deactivated. Please contact the hotel owner.' };
    }


  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('Unexpected signIn exception:', err);
    return { error: 'An unexpected connection issue occurred. Please check your internet connection.' };
  }

  redirect('/dashboard');
}

/**
 * Public staff registration is disabled. Staff accounts must be created by authenticated owners inside the PMS.
 */
export async function signUp(): Promise<AuthState> {
  return {
    error: 'Public staff registration is disabled. Please contact your hotel owner/administrator to create your staff account.',
  };
}


/**
 * Sign out and clear Supabase session
 */
export async function signOut() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Sign out error:', err);
  }

  redirect('/login');
}
