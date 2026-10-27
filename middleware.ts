import { type NextRequest, NextResponse } from 'next/server';
import { updateSession, hasAuthCookie, createRedirectResponse } from './lib/supabase/middleware';
import { StaffRole } from './lib/types/database.types';
import { hasRoutePermission } from './lib/auth/permissions';

/**
 * Public routes that do not require authentication:
 * Marketing, information, policy, and FAQ pages.
 */
const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/compliance',
  '/privacy-policy',
  '/terms',
  '/security',
  '/cookie-policy',
  '/faqs',
  '/hotel-management-software',
  '/features',
];

/**
 * Protected routes requiring authenticated staff session:
 * Dashboard, operational modules, PMS management, settings.
 */
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/rooms',
  '/bookings',
  '/checkin',
  '/checkout',
  '/billing',
  '/guests',
  '/payments',
  '/food-beverage',
  '/inventory',
  '/banquet',
  '/reports',
  '/settings',
];

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_ROUTES.some(
    (route) => route !== '/' && (pathname === route || pathname.startsWith(`${route}/`))
  );
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static files, API routes, and internal Next.js assets bypass middleware
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Normalize legacy /sign-in route to canonical /login
  if (pathname === '/sign-in') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  const hasSession = hasAuthCookie(request);

  // 3. Optimization for Public Routes:
  // If request is for a public marketing/info page and has no auth session cookie,
  // immediately continue without calling Supabase auth or updateSession().
  if (isPublicRoute(pathname)) {
    if (!hasSession) {
      return NextResponse.next();
    }
    // If a session cookie is present, refresh tokens in the background to keep cookies valid
    const { response } = await updateSession(request);
    return response;
  }

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register-hotel');
  const isProtected = isProtectedRoute(pathname);

  // 4. Fast-path for unauthenticated users accessing protected routes:
  // Without any session cookie, the user cannot be authenticated.
  // Redirect immediately to login without incurring remote Supabase auth overhead.
  if (!hasSession && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 5. Fast-path for unauthenticated users accessing auth routes (e.g. /login, /register-hotel):
  // Allow immediate rendering without Supabase auth calls.
  if (!hasSession && isAuthRoute) {
    return NextResponse.next();
  }

  // 6. For routes requiring verification (or when auth session cookies are present):
  // Validate session against Supabase Auth, refreshing tokens if needed.
  const { response, user } = await updateSession(request);
  const isAuthenticated = Boolean(user);
  const activeRole: StaffRole = (user?.user_metadata?.role as StaffRole) || 'reception';

  // 7. If unauthenticated after token validation and accessing a protected route -> redirect to login
  if (!isAuthenticated && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return createRedirectResponse(redirectUrl, response);
  }

  // 8. If authenticated and accessing login or sign-in -> redirect to dashboard
  if (isAuthenticated && (pathname.startsWith('/login') || pathname === '/sign-in')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return createRedirectResponse(redirectUrl, response);
  }

  // 9. If authenticated, enforce Role-Based Route Gating per PRD §5 & Architecture.md §4
  if (isAuthenticated && isProtected) {
    const isAllowed = hasRoutePermission(activeRole, pathname);

    if (!isAllowed) {
      // Role not authorized for this specific route -> redirect to dashboard
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      redirectUrl.searchParams.set('access_denied', 'true');
      return createRedirectResponse(redirectUrl, response);
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

