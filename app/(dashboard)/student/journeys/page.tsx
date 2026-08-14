import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import SkillJourneyClient, { SkillJourney } from './SkillJourneyClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getCurrentUid(): Promise<{ uid: string; role: string; name: string } | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      role: (decoded.role as string) || 'student',
      name: decoded.name || 'Student',
    };
  } catch {
    return null;
  }
}

export default async function StudentJourneysPage() {
  const auth = await getCurrentUid();
  if (!auth) {
    redirect('/login');
  }

  // Fetch student journeys
  const { data: journeys } = await supabaseAdmin
    .from('skill_journeys')
    .select('*')
    .eq('user_id', auth.uid)
    .order('created_at', { ascending: false });

  // Fetch student latest resume for gaps
  const { data: resumes } = await supabaseAdmin
    .from('resumes')
    .select('skill_gaps')
    .eq('user_id', auth.uid)
    .eq('status', 'complete')
    .order('uploaded_at', { ascending: false })
    .limit(1);

  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('name')
    .eq('id', auth.uid)
    .single();

  const skillGaps = resumes?.[0]?.skill_gaps || [];

  return (
    <SkillJourneyClient
      initialJourneys={(journeys as SkillJourney[]) || []}
      skillGaps={skillGaps}
      studentName={userRow?.name || auth.name || 'Student'}
    />
  );
}
