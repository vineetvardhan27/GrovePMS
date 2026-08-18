'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';
import { DEMO_STAFF_ACCOUNTS } from '../../../lib/auth/session';
import { StaffRole } from '../../../lib/types/database.types';

export interface AuthState {
  error?: string;
  success?: boolean;
}

export async function signIn(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  // Check if credentials match any of the seeded demo accounts
  const demoRole = Object.keys(DEMO_STAFF_ACCOUNTS).find(
    (role) => DEMO_STAFF_ACCOUNTS[role as StaffRole].email.toLowerCase() === email.toLowerCase().trim()
  ) as StaffRole | undefined;

  // Attempt live Supabase Auth
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      // If live Supabase Auth has not yet seeded test accounts, allow demo role fallback
      if (demoRole && (password === 'password123' || password === 'test1234' || password === 'admin123')) {
        cookies().set('pms_demo_role', demoRole, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        redirect('/dashboard');
      }

      // Plain language translation of errors per Rules.md §3
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Invalid email or password. Please verify your credentials and try again.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Your email address is not yet confirmed. Please check your inbox or contact the manager.' };
      }
      return { error: 'Unable to sign in. Please verify your details or try one of the test accounts below.' };
    }

    // Clear demo role cookie if live login succeeded
    cookies().delete('pms_demo_role');
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT') {
      throw err;
    }
    
    if (demoRole) {
      cookies().set('pms_demo_role', demoRole, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
      });
      redirect('/dashboard');
    }

    return { error: 'An unexpected connection issue occurred. Please check your internet connection.' };
  }

  redirect('/dashboard');
}

export async function switchDemoRole(role: StaffRole) {
  if (!DEMO_STAFF_ACCOUNTS[role]) {
    throw new Error('Invalid role specified');
  }

  cookies().set('pms_demo_role', role, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect('/dashboard');
}

export async function signOut() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // Continue
  }

  cookies().delete('pms_demo_role');
  redirect('/login');
}
