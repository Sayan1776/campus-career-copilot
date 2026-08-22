import { NextRequest, NextResponse } from 'next/server';
import { verifyRoleCookie, ROLE_COOKIE } from '@/lib/auth/role-cookie';

// Route -> required role mapping. Anything not listed here is public.
const ROLE_PREFIXES: Record<string, 'student' | 'tpo'> = {
  '/student': 'student',
  '/tpo': 'tpo',
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const matchedPrefix = Object.keys(ROLE_PREFIXES).find((prefix) =>
    pathname.startsWith(prefix)
  );

  // Not a protected route -> let it through
  if (!matchedPrefix) return NextResponse.next();

  const sessionCookie = req.cookies.get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Read the role from the HMAC-signed session_role cookie directly.
  // No network round-trip needed — verifyRoleCookie uses Web Crypto API
  // which is available in the Edge runtime.
  //
  // NOTE: The Firebase session cookie is still verified by firebase-admin
  // in every API route via verifySession(). Middleware only needs the role
  // for route-matching; the actual auth check happens server-side per route.
  const roleCookieValue = req.cookies.get(ROLE_COOKIE)?.value;

  if (!roleCookieValue) {
    // No role cookie — could be an existing session before this deploy.
    // Redirect to login to re-issue both cookies.
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = await verifyRoleCookie(roleCookieValue);

  if (!role) {
    // Signature invalid or cookie expired
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const requiredRole = ROLE_PREFIXES[matchedPrefix];

  if (role !== requiredRole) {
    // Logged in, but wrong role for this section -> bounce to their own home
    const fallback = `/${role}/dashboard`;
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/tpo/:path*'],
};
