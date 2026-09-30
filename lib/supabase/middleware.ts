import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { Database } from '../types/database.types';

/**
 * Checks whether the incoming request carries any Supabase authentication cookies.
 * Supabase SSR stores session tokens in cookies named `sb-<project-ref>-auth-token`
 * (or chunked `sb-<project-ref>-auth-token.0`, `sb-<project-ref>-auth-token.1`, etc.).
 */
export function hasAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => {
    const name = cookie.name;
    return (
      name.includes('-auth-token') ||
      name.endsWith('-token') ||
      (name.startsWith('sb-') && (name.includes('auth') || name.includes('token')))
    );
  });
}

/**
 * Helper to construct a redirect response while preserving cookies
 * (such as cleared or refreshed auth tokens) set by Supabase during updateSession.
 */
export function createRedirectResponse(
  redirectUrl: URL,
  supabaseResponse?: NextResponse
): NextResponse {
  const redirectResponse = NextResponse.redirect(redirectUrl);
  if (supabaseResponse) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
  }
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return { response: supabaseResponse, user: null, supabase: null };
  }

  // Fast bypass: if no auth session cookies exist on the request, skip remote getUser() call
  if (!hasAuthCookie(request)) {
    return { response: supabaseResponse, user: null, supabase: null };
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response: supabaseResponse, user, supabase };
}

