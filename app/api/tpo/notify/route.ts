import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendPushToTokens } from '@/lib/firebase/send-push';

export const runtime = 'nodejs';

interface SkillGap {
  skill: string;
  severity: string;
}

/** Normalize a skill name: trim + collapse internal whitespace. */
function normalize(s: string): string {
  return s.trim().replace(/\s+/g, ' ');
}

/**
 * Returns the sorted list of distinct skill-gap names currently present
 * across all fully-analyzed resumes.  The TPO UI MUST pick from this list
 * so the POST comparison is always verbatim.
 */
export async function GET(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }
  if (session.role !== 'tpo') {
    return NextResponse.json({ error: 'only TPO accounts can call this' }, { status: 403 });
  }

  const { data: resumes, error } = await supabaseAdmin
    .from('resumes')
    .select('skill_gaps')
    .eq('status', 'complete');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const seen = new Set<string>();
  for (const r of resumes || []) {
    for (const g of (r.skill_gaps as SkillGap[]) || []) {
      if (g.skill) seen.add(normalize(g.skill));
    }
  }

  const skills = Array.from(seen).sort((a, b) => a.localeCompare(b));
  return NextResponse.json({ skills });
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

  // --- Input-boundary guard ---
  // Fetch the current valid set and reject any skill name that doesn't exist
  // verbatim in the DB.  This prevents free-text drift from silently matching
  // zero students — the caller must pick from the GET /api/tpo/notify list.
  const { data: allResumes, error: allErr } = await supabaseAdmin
    .from('resumes')
    .select('user_id, skill_gaps')
    .eq('status', 'complete');

  if (allErr) {
    return NextResponse.json({ error: allErr.message }, { status: 500 });
  }

  const validSkills = new Set<string>();
  for (const r of allResumes || []) {
    for (const g of (r.skill_gaps as SkillGap[]) || []) {
      if (g.skill) validSkills.add(normalize(g.skill));
    }
  }

  if (!validSkills.has(normalize(skill))) {
    return NextResponse.json(
      {
        error: `Skill "${skill}" is not present in any analyzed resume. Use GET /api/tpo/notify to retrieve the valid list.`,
        validSkills: Array.from(validSkills).sort(),
      },
      { status: 422 }
    );
  }

  // Pull every complete resume and filter in JS — the guard above already
  // fetched them so we reuse that data rather than doing a second query.
  const affectedUserIds = (allResumes || [])
    .filter((r) =>
      (r.skill_gaps as SkillGap[]).some((g) => normalize(g.skill) === normalize(skill))
    )
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
