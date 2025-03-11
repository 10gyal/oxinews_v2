import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/',
];

// Define static routes that should be excluded from middleware
const staticRoutes = [
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/public',
];

export async function middleware(req: NextRequest) {
  try {
    // Check if the current path is a static route
    const isStaticRoute = staticRoutes.some(route => 
      req.nextUrl.pathname.startsWith(route)
    );

    if (isStaticRoute) {
      return NextResponse.next();
    }

    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession();

    // If there's an error getting the session, redirect to login
    if (error) {
      console.error('Session error:', error);
      return redirectToLogin(req);
    }

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => 
      req.nextUrl.pathname === route || 
      req.nextUrl.pathname.startsWith('/api')
    );

    // If there's no session and the route is not public, redirect to login
    if (!session && !isPublicRoute) {
      return redirectToLogin(req);
    }

    // If there's a session and the user is on a public route, redirect to dashboard
    if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup' || req.nextUrl.pathname === '/')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Check if session is expired
    if (session) {
      const expiresAt = new Date(session.expires_at! * 1000);
      if (expiresAt < new Date()) {
        // Session expired, redirect to login
        return redirectToLogin(req);
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return redirectToLogin(req);
  }
}

// Helper function to redirect to login
function redirectToLogin(req: NextRequest) {
  const redirectUrl = new URL('/login', req.url);
  redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
  console.log("Middleware: Redirecting unauthenticated user from", req.nextUrl.pathname, "to /login");
  return NextResponse.redirect(redirectUrl);
}

// Specify which routes should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 