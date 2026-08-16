import { cookies } from 'next/headers';
import Link from 'next/link';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import SkillRadarChart from './SkillRadarChart';
import CompetencyList from '@/components/CompetencyList';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function getCurrentUid(): Promise<string | null> {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

function severityBadge(severity: string) {
  if (severity === 'high') return 'bg-rose-100 text-rose-700 border-rose-200';
  if (severity === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-[#080B09] text-slate-400 border-[#1e2923]';
}

export default async function StudentDashboard() {
  const uid = await getCurrentUid();
  if (!uid) {
    redirect('/login');
  }

  // 1. Fetch student user profile
  const { data: userProfile } = await supabaseAdmin
    .from('users')
    .select('name, department, batch_year, target_role')
    .eq('id', uid)
    .single();

  // 2. Fetch resumes
  const { data: resumes } = await supabaseAdmin
    .from('resumes')
    .select('*')
    .eq('user_id', uid)
    .order('uploaded_at', { ascending: false })
    .limit(5);

  // 3. Fetch active skill journeys
  const { data: journeys } = await supabaseAdmin
    .from('skill_journeys')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  const latest = resumes?.[0];
  const journeyList = journeys || [];
  const completedJourneys = journeyList.filter((j) => j.status === 'completed');
  const inProgressJourneys = journeyList.filter((j) => j.status === 'in_progress');

  return (
    <div className="dashboard-content">
        {/* Top Profile & Placement Readiness Header */}
        <div className="rounded-2xl border border-[#1e2923] bg-[#121815] p-6 shadow-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00D68F] font-bold text-[#041a12] text-xl shadow-md">
                {(userProfile?.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">
                    {userProfile?.name || 'Student'}
                  </h1>
                  <span className="rounded-full bg-[#080B09] px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                    {userProfile?.department || 'Computer Science'} &bull; {userProfile?.batch_year || 2026}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Career Role: <span className="font-semibold text-slate-300">{userProfile?.target_role || 'Software Engineer'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/student/journeys"
                className="rounded-xl border border-[#00D68F]/20 bg-[#00D68F]/10 px-4 py-2.5 text-xs font-bold text-[#00e89b] hover:bg-[#00D68F]/20 transition-colors shadow-subtle"
              >
                🗺️ View Skill Journeys ({journeyList.length})
              </Link>
              <Link
                href="/student/upload"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-subtle"
              >
                + Re-analyze Resume
              </Link>
            </div>
          </div>
        </div>

        {!latest && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-[#121815] p-12 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#00D68F]/10 text-[#00D68F] text-xl">
              📄
            </div>
            <h3 className="text-base font-bold text-white">No Resume Analyzed Yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto mb-4">
              Upload your resume (PDF) to get an instant AI evaluation, competency radar, and personalized skill learning journeys.
            </p>
            <Link
              href="/student/upload"
              className="inline-block rounded-xl bg-[#00D68F] px-5 py-2.5 text-xs font-bold text-[#041a12] hover:bg-[#00e89b] transition-colors shadow-card"
            >
              Upload Resume Now
            </Link>
          </div>
        )}

        {latest && latest.status === 'processing' && (
          <div className="rounded-2xl border border-[#00D68F]/20 bg-[#00D68F]/10/50 p-6 text-center shadow-card">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mb-2" />
            <h3 className="text-sm font-bold text-white">Resume is being evaluated by AI...</h3>
            <p className="text-xs text-slate-500 mt-1">
              Extracting technical competencies and mapping institutional placement gaps. Refresh in 5 seconds.
            </p>
          </div>
        )}

        {latest && latest.status === 'failed' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-card">
            <h3 className="text-sm font-bold text-rose-800">Resume Analysis Failed</h3>
            <p className="text-xs text-rose-600 mt-1 mb-3">
              We could not extract text from your PDF. Please ensure it is a standard text PDF.
            </p>
            <Link
              href="/student/upload"
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
            >
              Try Again
            </Link>
          </div>
        )}

        {latest && latest.status === 'complete' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Readiness Score & Competency Radar */}
            <div className="lg:col-span-7 space-y-6">
              {/* Score & Skill Summary Card */}
              <div className="rounded-2xl border border-[#1e2923] bg-[#121815] p-6 shadow-card">
                <div className="flex items-center justify-between border-b border-[#233028] pb-4 mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Placement Readiness Metric
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-4xl font-extrabold text-white">
                        {latest.overall_score}
                      </span>
                      <span className="text-sm font-semibold text-slate-400">/ 100</span>
                      <span
                        className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          (latest.overall_score || 0) >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : (latest.overall_score || 0) >= 50
                            ? 'bg-[#00D68F]/20 text-[#00D68F]'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {(latest.overall_score || 0) >= 75
                          ? 'Placement Ready'
                          : (latest.overall_score || 0) >= 50
                          ? 'On Track'
                          : 'Needs Preparation'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-medium text-slate-400">Evaluated on</div>
                    <div className="text-xs font-bold text-slate-300">
                      {new Date(latest.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Verified Extracted Skills */}
                <div className="mb-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Extracted Technical Competencies ({latest.extracted_skills?.length || 0})
                  </h2>
                  <CompetencyList skills={latest.extracted_skills || []} />
                </div>

                {/* Radar Chart */}
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    360° Competency Radar
                  </h2>
                  <div className="rounded-xl border border-[#233028] bg-[#1a231d]/50 p-2">
                    <SkillRadarChart
                      extractedSkills={latest.extracted_skills || []}
                      skillGaps={latest.skill_gaps || []}
                    />
                  </div>
                </div>
              </div>

              {/* Upload History */}
              {resumes && resumes.length > 1 && (
                <div className="rounded-2xl border border-[#1e2923] bg-[#121815] p-5 shadow-card">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Resume Evaluation History
                  </h2>
                  <div className="space-y-2">
                    {resumes.slice(1).map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-lg border border-[#233028] bg-[#1a231d] px-3 py-2 text-xs"
                      >
                        <span className="text-slate-400 font-medium">
                          {new Date(r.uploaded_at).toLocaleDateString()} &bull; {r.file_url || 'Resume.pdf'}
                        </span>
                        <span className="font-bold text-white">
                          {r.status === 'complete' ? `${r.overall_score}/100` : r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Col: Active Journeys & Skill Gap Resolution */}
            <div className="lg:col-span-5 space-y-6">
              {/* Gamified Skill Journeys Widget */}
              <div className="rounded-2xl border border-[#1e2923] bg-[#121815] p-5 shadow-card">
                <div className="flex items-center justify-between mb-3 border-b border-[#233028] pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white">Skill Learning Journeys</h2>
                    <p className="text-[11px] text-slate-500">Actionable gap roadmaps</p>
                  </div>
                  <Link
                    href="/student/journeys"
                    className="rounded-lg bg-[#00D68F]/10 border border-[#00D68F]/20 px-2.5 py-1 text-xs font-bold text-[#00e89b] hover:bg-[#00D68F]/20"
                  >
                    View All →
                  </Link>
                </div>

                {journeyList.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#1e2923] bg-[#1a231d] p-4 text-center">
                    <p className="text-xs text-slate-500 mb-2">
                      You have not started any skill journeys yet.
                    </p>
                    <Link
                      href="/student/journeys"
                      className="inline-block rounded-lg bg-[#00D68F] px-3 py-1.5 text-xs font-bold text-[#041a12] hover:bg-[#00e89b]"
                    >
                      Start First Journey
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {journeyList.slice(0, 3).map((j) => {
                      const percent = Math.round((j.completed_steps / (j.total_steps || 3)) * 100);
                      return (
                        <div
                          key={j.id}
                          className="rounded-xl border border-[#233028] bg-[#1a231d] p-3"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs text-white">{j.skill}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                j.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-[#00D68F]/20 text-[#00D68F]'
                              }`}
                            >
                              {j.status === 'completed' ? '✓ Mastered' : `${percent}% Done`}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${
                                j.status === 'completed' ? 'bg-emerald-500' : 'bg-[#00D68F]'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Identified Placement Skill Gaps */}
              <div className="rounded-2xl border border-[#1e2923] bg-[#121815] p-5 shadow-card">
                <div className="flex items-center justify-between mb-3 border-b border-[#233028] pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white">Placement Skill Gaps</h2>
                    <p className="text-[11px] text-slate-500">Identified from target role benchmark</p>
                  </div>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                    {(latest.skill_gaps || []).length} Missing
                  </span>
                </div>

                <div className="space-y-2">
                  {(latest.skill_gaps || []).map((gap: { skill: string; severity: string }) => {
                    const hasJourney = journeyList.some(
                      (j) => j.skill.toLowerCase() === gap.skill.toLowerCase()
                    );

                    return (
                      <div
                        key={gap.skill}
                        className="flex items-center justify-between rounded-xl border border-[#1e2923] bg-[#1a231d] p-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-200">{gap.skill}</div>
                          <span
                            className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-bold border mt-0.5 ${severityBadge(
                              gap.severity
                            )}`}
                          >
                            {gap.severity} priority
                          </span>
                        </div>

                        {hasJourney ? (
                          <Link
                            href="/student/journeys"
                            className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            In Progress →
                          </Link>
                        ) : (
                          <Link
                            href="/student/journeys"
                            className="rounded-lg bg-[#00D68F] px-2.5 py-1 text-xs font-bold text-[#041a12] hover:bg-[#00e89b] shadow-subtle"
                          >
                            + Start Quest
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Campus Peer Benchmark Shortcut */}
              <div className="rounded-2xl border border-[#00D68F]/10 bg-gradient-to-br from-indigo-50 to-slate-50 p-5 shadow-card">
                <h3 className="text-sm font-bold text-[#00e89b]">Campus Peer Progress Hub</h3>
                <p className="text-xs text-[#00e89b] mt-1 mb-3">
                  See how other students in your department are preparing and find study peers with complementary skills.
                </p>
                <Link
                  href="/campus/peers"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#00D68F] hover:text-[#00D68F] underline"
                >
                  Explore Campus Directory →
                </Link>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
