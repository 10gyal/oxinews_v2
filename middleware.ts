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

export async function middleware(req: NextRequest) {
  // Skip static routes
  if (req.nextUrl.pathname.startsWith('/_next') || 
      req.nextUrl.pathname.startsWith('/public') ||
      req.nextUrl.pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const { data: { session } } = await supabase.auth.getSession();

    // Public routes: always accessible
    if (publicRoutes.some(route => req.nextUrl.pathname === route) || 
        req.nextUrl.pathname.startsWith('/api')) {
      
      // Redirect to dashboard if already logged in and trying to access auth pages
      if (session && (req.nextUrl.pathname === '/login' || 
                      req.nextUrl.pathname === '/signup' || 
                      req.nextUrl.pathname === '/')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      
      return res;
    }

    // Protected routes: require auth
    if (!session) {
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      console.log("Middleware: Redirecting unauthenticated user from", req.nextUrl.pathname, "to /login");
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

// Specify which routes should be protected
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
