import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

const FIVE_DAYS_MS = 60 * 60 * 24 * 5 * 1000;

// Called from the client right after firebase/auth signInWithEmailAndPassword
// succeeds. Client sends the ID token; we mint a long-lived session cookie
// so middleware doesn't need the client to keep resending the ID token.
export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: 'missing idToken' }, { status: 400 });
  }

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: FIVE_DAYS_MS,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set('session', sessionCookie, {
      maxAge: FIVE_DAYS_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'could not create session' }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('session');
  return res;
}
