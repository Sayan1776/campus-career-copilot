import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// There's no single "recruiter dashboard" page — a recruiter's home is
// either "post a JD" (first time) or "view matches" (once they have one).
// This route exists purely so /recruiter/dashboard (what login/signup
// redirect to for every role) has somewhere valid to land.
export default async function RecruiterDashboardRedirect() {
  const sessionCookie = cookies().get('session')?.value;
  let uid: string | null = null;

  if (sessionCookie) {
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
      uid = decoded.uid;
    } catch {
      // fall through, redirect to post-jd below
    }
  }

  if (uid) {
    const { data: jds } = await supabaseAdmin
      .from('jds')
      .select('id')
      .eq('recruiter_id', uid)
      .limit(1);

    if (jds && jds.length > 0) {
      redirect('/recruiter/candidates');
    }
  }

  redirect('/recruiter/post-jd');
}