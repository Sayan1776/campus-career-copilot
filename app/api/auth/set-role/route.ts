import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, setUserRole } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { DEPARTMENTS } from '@/lib/departments';
import { signRoleCookie, ROLE_COOKIE, ROLE_COOKIE_MAX_AGE } from '@/lib/auth/role-cookie';

export const runtime = 'nodejs';

// Invite codes gate which role a new signup can claim. For the hackathon,
// hardcode these; in production these would be per-batch, single-use, and
// stored in Supabase instead.
const INVITE_CODES: Record<string, 'student' | 'tpo'> = {
  [process.env.STUDENT_INVITE_CODE || 'CAMPUS2026']: 'student',
  [process.env.TPO_INVITE_CODE || 'ADMIN2026']: 'tpo',
};

export async function POST(req: NextRequest) {
  const { idToken, inviteCode, department } = await req.json();

  if (!idToken || !inviteCode) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const role = INVITE_CODES[inviteCode];
  if (!role) {
    return NextResponse.json({ error: 'invalid invite code' }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    await setUserRole(decoded.uid, role);

    // Mirror the user into Supabase with the SAME id as the Firebase UID.
    // Everything downstream (resumes.user_id) FKs against
    // this row, so it must exist before the user can do anything else.
    // Students also record their department (branch) — it drives resume
    // analysis, journeys, and cohort views, so capture it at the door.
    const validDepartment =
      typeof department === 'string' && (DEPARTMENTS as readonly string[]).includes(department.trim())
        ? department.trim()
        : null;

    const { error: dbError } = await supabaseAdmin.from('users').upsert(
      {
        id: decoded.uid,
        role,
        name: decoded.email?.split('@')[0] ?? null,
        ...(role === 'student' && validDepartment ? { department: validDepartment } : {}),
      },
      { onConflict: 'id' }
    );

    if (dbError) {
      console.error('Supabase user upsert failed:', dbError.message);
      // Don't hard-fail signup over this, but surface it so it's visible in logs.
    }

    // Write a short-lived HMAC-signed role cookie so middleware can read the
    // role directly without an internal fetch to /api/auth/verify-session.
    const roleCookieValue = await signRoleCookie(role);
    const res = NextResponse.json({ ok: true, role });
    res.cookies.set(ROLE_COOKIE, roleCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ROLE_COOKIE_MAX_AGE,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'could not verify token' }, { status: 401 });
  }
}

