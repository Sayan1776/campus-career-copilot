import { NextRequest, NextResponse } from 'next/server';

// Route -> required role mapping. Anything not listed here is public.
const ROLE_PREFIXES: Record<string, 'student' | 'tpo' | 'recruiter'> = {
  '/student': 'student',
  '/tpo': 'tpo',
  '/recruiter': 'recruiter',
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

  // We can't use firebase-admin directly inside Edge middleware (it needs
  // Node APIs), so we verify the session via a lightweight internal API
  // route running in the Node runtime, and read the role back out.
  const verifyUrl = new URL('/api/auth/verify-session', req.url);
  const verifyRes = await fetch(verifyUrl, {
    headers: { cookie: `session=${sessionCookie}` },
  });

  if (!verifyRes.ok) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const { role } = (await verifyRes.json()) as { role?: string };
  const requiredRole = ROLE_PREFIXES[matchedPrefix];

  if (role !== requiredRole) {
    // Logged in, but wrong role for this section -> bounce to their own home
    const fallback = role ? `/${role}/dashboard` : '/login';
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/tpo/:path*', '/recruiter/:path*'],
};
