import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, setUserRole } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Invite codes gate which role a new signup can claim. For the hackathon,
// hardcode these; in production these would be per-batch, single-use, and
// stored in Supabase instead.
const INVITE_CODES: Record<string, 'student' | 'tpo' | 'recruiter'> = {
  [process.env.STUDENT_INVITE_CODE || 'STUDENT2026']: 'student',
  [process.env.TPO_INVITE_CODE || 'TPOADMIN2026']: 'tpo',
  [process.env.RECRUITER_INVITE_CODE || 'RECRUIT2026']: 'recruiter',
};

export async function POST(req: NextRequest) {
  const { idToken, inviteCode } = await req.json();

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
    // Everything downstream (resumes.user_id, jds.recruiter_id) FKs against
    // this row, so it must exist before the user can do anything else.
    const { error: dbError } = await supabaseAdmin.from('users').upsert(
      {
        id: decoded.uid,
        role,
        name: decoded.email?.split('@')[0] ?? null,
      },
      { onConflict: 'id' }
    );

    if (dbError) {
      console.error('Supabase user upsert failed:', dbError.message);
      // Don't hard-fail signup over this, but surface it so it's visible in logs.
    }

    return NextResponse.json({ ok: true, role });
  } catch {
    return NextResponse.json({ error: 'could not verify token' }, { status: 401 });
  }
}
