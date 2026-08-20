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

    // Verify staff account exists
    const { data: staff, error: staffErr } = (await supabase
      .from('staff')
      .select('id, hotel_id, role, is_active')
      .eq('id', authData.user.id)
      .maybeSingle()) as { data: { id: string; hotel_id: string; role: string; is_active: boolean } | null; error: any };

    if (staffErr) {
      console.error('Staff lookup after login failed:', staffErr.message);
    }

    if (staff && !staff.is_active) {
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
 * Sign up a new staff member or hotel admin via Supabase Auth
 */
export async function signUp(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const fullName = (formData.get('full_name') as string)?.trim();
  const role = (formData.get('role') as StaffRole) || 'reception';

  if (!email || !password || !fullName) {
    return { error: 'Please provide email, password, and full name.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  try {
    const supabase = createClient();
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (signUpError) {
      console.error('Supabase signUp error:', signUpError.message);
      if (signUpError.message.includes('already registered')) {
        return { error: 'An account with this email already exists. Please sign in instead.' };
      }
      return { error: signUpError.message };
    }

    if (signUpData?.user && signUpData?.session) {
      // Auto-confirmed / session established
      redirect('/dashboard');
    }

    return {
      success: true,
      message: 'Account created successfully! If email confirmation is enabled on your project, please check your inbox before logging in.',
    };
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT') {
      throw err;
    }
    console.error('Unexpected signUp exception:', err);
    return { error: 'Failed to create account. Please try again.' };
  }
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
