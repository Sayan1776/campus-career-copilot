import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendPushToTokens } from '@/lib/firebase/send-push';

export const runtime = 'nodejs';

interface SkillGap {
  skill: string;
  severity: string;
}

export async function POST(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }
  if (session.role !== 'tpo') {
    return NextResponse.json({ error: 'only TPO accounts can send notifications' }, { status: 403 });
  }

  const { skill, message } = await req.json();
  if (!skill) {
    return NextResponse.json({ error: 'skill is required' }, { status: 400 });
  }

  // Pull every complete resume and filter in JS. skill_gaps is a jsonb
  // array of objects, and with ~20 rows a server-side filter is far less
  // risky to get right under time pressure than a jsonb_array_elements
  // query written live during a hackathon.
  const { data: resumes, error } = await supabaseAdmin
    .from('resumes')
    .select('user_id, skill_gaps')
    .eq('status', 'complete');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const affectedUserIds = (resumes || [])
    .filter((r) => (r.skill_gaps as SkillGap[]).some((g) => g.skill === skill))
    .map((r) => r.user_id);

  if (affectedUserIds.length === 0) {
    return NextResponse.json({ ok: true, notifiedCount: 0, affectedStudents: [] });
  }

  const { data: users, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, name, fcm_token')
    .in('id', affectedUserIds);

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const tokens = (users || []).map((u) => u.fcm_token);
  const actuallySent = await sendPushToTokens(
    tokens,
    `Workshop: ${skill}`,
    message || `We're running a workshop on ${skill}. Sign up to close this gap.`
  );

  return NextResponse.json({
    ok: true,
    notifiedCount: users?.length ?? 0,
    actuallySent,
    affectedStudents: (users || []).map((u) => u.name),
  });
}
