import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import nextDynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';
import type { SkillJourney } from './SkillJourneyClient';

export const dynamic = 'force-dynamic';

// The journey console is a heavy client chunk — stream the sheet in first.
const SkillJourneyClient = nextDynamic(() => import('./SkillJourneyClient'), {
  ssr: false,
  loading: () => (
    <div aria-busy="true" className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="space-y-5 lg:col-span-4">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
      <Skeleton className="h-[26rem] rounded-xl lg:col-span-8" />
    </div>
  ),
});

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

  const { data: journeys } = await supabaseAdmin
    .from('skill_journeys')
    .select('*')
    .eq('user_id', auth.uid)
    .order('created_at', { ascending: false });

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
    <div className="page-canvas">
      <SkillJourneyClient
        initialJourneys={(journeys as SkillJourney[]) || []}
        skillGaps={skillGaps}
        studentName={userRow?.name || auth.name || 'Student'}
      />
    </div>
  );
}
