import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import nextDynamic from 'next/dynamic';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';
import type { PeerStudent } from './PeerProgressClient';

export const dynamic = 'force-dynamic';

// The directory console streams in behind its gauges.
const PeerProgressClient = nextDynamic(() => import('./PeerProgressClient'), {
  ssr: false,
  loading: () => (
    <div aria-busy="true" className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[86px] rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  ),
});

async function getCurrentUserRole(): Promise<{ uid: string; role: string } | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, role: (decoded.role as string) || 'student' };
  } catch {
    return null;
  }
}

export default async function CampusPeersPage() {
  const auth = await getCurrentUserRole();
  if (!auth) {
    redirect('/login');
  }

  // 1. Fetch all students in the institution
  const { data: students } = await supabaseAdmin
    .from('users')
    .select('id, name, department, batch_year, target_role')
    .eq('role', 'student');

  const studentList = students || [];
  const studentIds = studentList.map((s) => s.id);

  // 2. Fetch all completed resumes
  const { data: resumes } = studentIds.length
    ? await supabaseAdmin
        .from('resumes')
        .select('user_id, overall_score, extracted_skills, uploaded_at')
        .eq('status', 'complete')
        .in('user_id', studentIds)
        .order('uploaded_at', { ascending: false })
    : { data: [] };

  // Map to store latest resume per student
  const latestResumeMap = new Map<string, any>();
  for (const r of resumes || []) {
    if (!latestResumeMap.has(r.user_id)) {
      latestResumeMap.set(r.user_id, r);
    }
  }

  // 3. Fetch all skill journeys
  const { data: journeys } = studentIds.length
    ? await supabaseAdmin
        .from('skill_journeys')
        .select('user_id, skill, status, completed_steps, total_steps')
        .in('user_id', studentIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  // Map to store journey stats per student
  const journeyMap = new Map<
    string,
    {
      activeCount: number;
      completedCount: number;
      recent: { skill: string; status: string; completedSteps: number; totalSteps: number }[];
    }
  >();

  for (const j of journeys || []) {
    const existing = journeyMap.get(j.user_id) || {
      activeCount: 0,
      completedCount: 0,
      recent: [],
    };

    if (j.status === 'completed') {
      existing.completedCount += 1;
    } else {
      existing.activeCount += 1;
    }

    if (existing.recent.length < 3) {
      existing.recent.push({
        skill: j.skill,
        status: j.status,
        completedSteps: j.completed_steps || 0,
        totalSteps: j.total_steps || 4,
      });
    }

    journeyMap.set(j.user_id, existing);
  }

  // Combine into structured PeerStudent objects
  const peerStudents: PeerStudent[] = studentList.map((s) => {
    const resume = latestResumeMap.get(s.id);
    const journeyData = journeyMap.get(s.id) || {
      activeCount: 0,
      completedCount: 0,
      recent: [],
    };

    return {
      id: s.id,
      name: s.name || 'Anonymous Student',
      department: s.department || 'Not set',
      batchYear: s.batch_year || 2026,
      targetRole: s.target_role || '-',
      overallScore: resume?.overall_score || 0,
      extractedSkills: resume?.extracted_skills || [],
      activeJourneysCount: journeyData.activeCount,
      completedJourneysCount: journeyData.completedCount,
      recentJourneys: journeyData.recent,
      uploadedAt: resume?.uploaded_at || null,
    };
  });

  return (
    <div className="page-canvas">
      <PeerProgressClient
        students={peerStudents}
        userRole={auth.role === 'tpo' ? 'TPO' : 'Student'}
      />
    </div>
  );
}
