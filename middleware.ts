import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase/middleware';
import { StaffRole } from './lib/types/database.types';
import { hasRouteAccess } from './lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and internal Next.js assets bypass middleware
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Redirect /sign-in to /login
  if (pathname === '/sign-in') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Update supabase session and check auth
  const { response, user } = await updateSession(request);

  const isAuthenticated = Boolean(user);
  const activeRole: StaffRole = (user?.user_metadata?.role as StaffRole) || 'reception';

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/sign-in');

  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/rooms') ||
    pathname.startsWith('/bookings') ||
    pathname.startsWith('/checkin') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/billing') ||
    pathname.startsWith('/guests') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/inventory') ||
    pathname.startsWith('/banquet') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/settings');

  // 1. If unauthenticated and accessing protected routes -> redirect to login
  if (!isAuthenticated && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. If authenticated and accessing login -> redirect to dashboard
  if (isAuthenticated && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // 3. If authenticated, enforce Role-Based Route Gating per PRD §5 & Architecture.md §4
  if (isAuthenticated && isDashboardRoute) {
    const isAllowed = hasRouteAccess(activeRole, pathname);

    if (!isAllowed) {
      // Role not authorized for this specific route -> redirect to dashboard
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      redirectUrl.searchParams.set('access_denied', 'true');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
