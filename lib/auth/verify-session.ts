import { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export interface VerifiedSession {
  uid: string;
  role: string | undefined;
}

/**
 * Verifies the session cookie on an incoming request and returns the uid + role.
 * Returns null if there's no valid session — callers decide how to respond.
 */
export async function verifySession(req: NextRequest): Promise<VerifiedSession | null> {
  const sessionCookie = req.cookies.get('session')?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, role: decoded.role as string | undefined };
  } catch {
    return null;
  }
}
