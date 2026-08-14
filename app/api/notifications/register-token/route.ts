import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await verifySession(req);
  if (!session) {
    return NextResponse.json({ error: 'not authenticated' }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ fcm_token: token })
    .eq('id', session.uid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
