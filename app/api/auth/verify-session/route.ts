import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'no session' }, { status: 401 });
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return NextResponse.json({
      uid: decoded.uid,
      role: decoded.role ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'invalid session' }, { status: 401 });
  }
}
