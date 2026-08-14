import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }
  if (session.role !== 'recruiter') {
    return NextResponse.json({ error: 'only recruiters can post a JD' }, { status: 403 });
  }

  const { title, requiredSkills } = await req.json();
  if (!title || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    return NextResponse.json(
      { error: 'title and at least one required skill are needed' },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from('jds')
    .insert({
      recruiter_id: session.uid,
      title,
      required_skills: requiredSkills,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, jd: data });
}
