import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { signRoleCookie, ROLE_COOKIE, ROLE_COOKIE_MAX_AGE } from '@/lib/auth/role-cookie';

export const runtime = 'nodejs';

const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;
const FIVE_DAYS_S  = FIVE_DAYS_MS / 1000;

// Called from the client right after firebase/auth signInWithEmailAndPassword
// succeeds. Client sends the ID token; we mint a long-lived session cookie
// so middleware doesn't need the client to keep resending the ID token.
// We also write a short-lived HMAC-signed session_role cookie so middleware
// can read the role directly without an internal network round-trip.
export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: 'missing idToken' }, { status: 400 });
  }

  try {
    const [sessionCookie, decoded] = await Promise.all([
      adminAuth.createSessionCookie(idToken, { expiresIn: FIVE_DAYS_MS }),
      adminAuth.verifyIdToken(idToken),
    ]);

    const role = (decoded.role as string | undefined) ?? '';

    const res = NextResponse.json({ ok: true, role });

    // Primary session cookie (Firebase-signed, verified by firebase-admin)
    res.cookies.set('session', sessionCookie, {
      maxAge: FIVE_DAYS_S,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // Role cookie (HMAC-signed, read by Edge middleware without network hop)
    if (role) {
      const roleCookieValue = await signRoleCookie(role);
      res.cookies.set(ROLE_COOKIE, roleCookieValue, {
        maxAge: ROLE_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return res;
  } catch {
    return NextResponse.json({ error: 'could not create session' }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('session');
  res.cookies.delete(ROLE_COOKIE);
  return res;
}
