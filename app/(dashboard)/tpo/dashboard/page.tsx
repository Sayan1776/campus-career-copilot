import { supabaseAdmin } from '@/lib/supabase/server';
import nextDynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/Skeleton';

export const dynamic = 'force-dynamic';

// The analytics console (recharts + table) streams in behind its gauges.
const CohortAnalyticsClient = nextDynamic(() => import('./CohortAnalyticsClient'), {
  ssr: false,
  loading: () => (
    <div aria-busy="true" className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[86px] rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  ),
});

interface SkillGap {
  skill: string;
  severity: 'high' | 'medium' | 'low';
}

interface ResumeRow {
  user_id: string;
  overall_score: number | null;
  skill_gaps: SkillGap[];
  extracted_skills: string[];
  status: string;
}

interface UserRow {
  id: string;
  name: string | null;
  department: string | null;
  target_role: string | null;
  batch_year: number | null;
}

interface JourneyRow {
  user_id: string;
  skill: string;
  status: string;
  completed_steps: number;
  total_steps: number;
}

export default async function TpoDashboard() {
  const { data: resumes } = await supabaseAdmin
    .from('resumes')
    .select('user_id, overall_score, skill_gaps, extracted_skills, status')
    .eq('status', 'complete')
    .returns<ResumeRow[]>();

  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name, department, target_role, batch_year')
    .eq('role', 'student')
    .returns<UserRow[]>();

  const { data: journeys } = await supabaseAdmin
    .from('skill_journeys')
    .select('user_id, skill, status, completed_steps, total_steps')
    .returns<JourneyRow[]>();

  const resumeList = resumes || [];
  const userMap = new Map((users || []).map((u) => [u.id, u]));

  // Map student journeys
  const studentJourneysMap = new Map<string, { inProgress: number; completed: number }>();
  for (const j of journeys || []) {
    const existing = studentJourneysMap.get(j.user_id) || { inProgress: 0, completed: 0 };
    if (j.status === 'completed') {
      existing.completed += 1;
    } else {
      existing.inProgress += 1;
    }
    studentJourneysMap.set(j.user_id, existing);
  }

  // --- Aggregate skill gaps across cohort ---
  const gapCounts = new Map<string, { count: number; severity: string }>();
  for (const r of resumeList) {
    for (const gap of r.skill_gaps || []) {
      const existing = gapCounts.get(gap.skill);
      if (existing) {
        existing.count += 1;
      } else {
        gapCounts.set(gap.skill, { count: 1, severity: gap.severity });
      }
    }
  }

  const skillGapData = Array.from(gapCounts.entries())
    .map(([skill, { count, severity }]) => ({
      skill,
      count,
      severity,
      percentage: resumeList.length > 0 ? Math.round((count / resumeList.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const totalEvaluated = resumeList.length;
  const averageScore =
    totalEvaluated > 0
      ? Math.round(
          resumeList.reduce((sum, r) => sum + (r.overall_score || 0), 0) / totalEvaluated
        )
      : 0;
  const criticalGapCount = skillGapData.filter((g) => g.severity === 'high').length;
  const topMissingSkill = skillGapData[0]?.skill ?? 'N/A';

  const totalJourneysResolved = (journeys || []).filter((j) => j.status === 'completed').length;
  const totalJourneysActive = (journeys || []).filter((j) => j.status === 'in_progress').length;

  const roster = resumeList
    .map((r) => {
      const user = userMap.get(r.user_id);
      const journeyStats = studentJourneysMap.get(r.user_id) || { inProgress: 0, completed: 0 };
      return {
        id: r.user_id,
        name: user?.name ?? 'Unknown Student',
        department: user?.department ?? 'Not set',
        targetRole: user?.target_role ?? '-',
        batchYear: user?.batch_year ?? null,
        score: r.overall_score ?? 0,
        gapCount: (r.skill_gaps || []).length,
        journeysActive: journeyStats.inProgress,
        journeysCompleted: journeyStats.completed,
        gaps: r.skill_gaps || [],
      };
    })
    .sort((a, b) => a.score - b.score); // weakest first

  return (
    <div className="page-canvas">
      <CohortAnalyticsClient
        totalStudents={userMap.size}
        totalEvaluated={totalEvaluated}
        averageScore={averageScore}
        criticalGapCount={criticalGapCount}
        topMissingSkill={topMissingSkill}
        totalJourneysResolved={totalJourneysResolved}
        totalJourneysActive={totalJourneysActive}
        skillGapData={skillGapData}
        roster={roster}
      />
    </div>
  );
}
