import { cookies } from 'next/headers';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import CompetencyList from '@/components/CompetencyList';
import { ProcessingNotice } from '@/components/ProcessingNotice';
import { PageHeader } from '@/components/ui/PageHeader';
import { Sheet, TitleBlock } from '@/components/ui/Sheet';
import { Badge } from '@/components/ui/Badge';
import { SeverityBadge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { buttonClasses } from '@/components/ui/Button';
import { FileText, Route, Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Recharts is the heaviest instrument on this sheet — stream it in lazily.
const SkillRadarChart = nextDynamic(() => import('./SkillRadarChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-[320px] w-full rounded-lg" />,
});

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

export default async function StudentDashboard() {
  const uid = await getCurrentUid();
  if (!uid) {
    redirect('/login');
  }

  const { data: userProfile } = await supabaseAdmin
    .from('users')
    .select('name, department, batch_year, target_role')
    .eq('id', uid)
    .single();

  const { data: resumes } = await supabaseAdmin
    .from('resumes')
    .select('*')
    .eq('user_id', uid)
    .order('uploaded_at', { ascending: false })
    .limit(5);

  const { data: journeys } = await supabaseAdmin
    .from('skill_journeys')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  const latest = resumes?.[0];
  const journeyList = journeys || [];

  const score = latest?.overall_score || 0;
  const tier =
    score >= 75
      ? { label: 'Placement ready', tone: 'pass' as const }
      : score >= 50
        ? { label: 'On track', tone: 'warn' as const }
        : { label: 'Needs preparation', tone: 'danger' as const };

  return (
    <div className="page-canvas">
      <PageHeader
        title={userProfile?.name || 'Student'}
        sub={`${userProfile?.department || '—'} · Batch ${userProfile?.batch_year || 2026} · Target: ${userProfile?.target_role || '—'}`}
        meta="Sheet SD-01"
        actions={
          <>
            <Link
              href="/student/journeys"
              className={buttonClasses({ variant: 'outline', size: 'sm' })}
            >
              <Route className="h-3.5 w-3.5" strokeWidth={1.8} />
              Journeys ({journeyList.length})
            </Link>
            <Link
              href="/student/upload"
              className={buttonClasses({ variant: 'primary', size: 'sm' })}
            >
              Re-analyze resume
            </Link>
          </>
        }
      />

      {!latest && (
        <EmptyState
          icon={<FileText className="h-5 w-5" strokeWidth={1.8} />}
          title="No resume analyzed yet"
          body="Upload your resume (PDF) to get an instant AI evaluation, competency radar, and personalized skill learning journeys."
          action={
            <Link href="/student/upload" className={buttonClasses({ variant: 'signal' })}>
              Upload resume now
            </Link>
          }
        />
      )}

      {latest && latest.status === 'processing' && <ProcessingNotice />}

      {latest && latest.status === 'failed' && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-instrument/40 bg-instrument-wash px-6 py-10 text-center">
          <AlertTriangle className="mb-3 h-6 w-6 text-instrument-deep" strokeWidth={1.8} />
          <h3 className="text-sm font-bold text-instrument-deep">
            Resume analysis failed
          </h3>
          <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">
            We could not extract text from your PDF. Please ensure it is a
            standard text PDF, then measure again.
          </p>
          <Link
            href="/student/upload"
            className={buttonClasses({ variant: 'danger', size: 'md' })}
          >
            Try again
          </Link>
        </div>
      )}

      {latest && latest.status === 'complete' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left: readiness instrument */}
          <div className="space-y-5 lg:col-span-7">
            <Sheet className="overflow-hidden">
              <TitleBlock
                title="Readiness instrument"
                sub="Overall placement readiness metric"
                meta={`Evaluated ${new Date(latest.uploaded_at).toLocaleDateString()}`}
              />
              <div className="px-5 py-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="tabular font-mono text-[3.4rem] font-semibold leading-none tracking-[-0.02em] text-ink">
                      {latest.overall_score}
                    </span>
                    <span className="font-mono text-sm text-ink-faint">/100</span>
                  </div>
                  <Badge tone={tier.tone}>{tier.label}</Badge>
                </div>
                <div className="mt-4">
                  <Progress
                    value={latest.overall_score || 0}
                    tone={(latest.overall_score || 0) >= 75 ? 'pass' : 'instrument'}
                    label="Overall readiness score"
                  />
                </div>

                <div className="mt-6">
                  <h2 className="mb-2 font-mono text-xxs font-medium uppercase tracking-[0.12em] text-ink-faint">
                    Extracted competencies ({latest.extracted_skills?.length || 0})
                  </h2>
                  <CompetencyList skills={latest.extracted_skills || []} />
                </div>

                <div className="mt-6">
                  <h2 className="mb-2 font-mono text-xxs font-medium uppercase tracking-[0.12em] text-ink-faint">
                    360° competency radar
                  </h2>
                  <div className="graph-inset rounded-lg border border-ink-line p-2">
                    <SkillRadarChart
                      extractedSkills={latest.extracted_skills || []}
                      skillGaps={latest.skill_gaps || []}
                    />
                  </div>
                </div>
              </div>
            </Sheet>

            {resumes && resumes.length > 1 && (
              <Sheet className="overflow-hidden">
                <TitleBlock
                  title="Evaluation history"
                  sub="Previous measurements on file"
                  meta={`${resumes.length - 1} prior`}
                />
                <div className="divide-y divide-ink-line">
                  {resumes.slice(1).map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <span className="truncate font-mono text-xs text-ink-soft">
                        {new Date(r.uploaded_at).toLocaleDateString()} · {r.file_url || 'Resume.pdf'}
                      </span>
                      <span className="tabular shrink-0 font-mono text-xs font-semibold text-ink">
                        {r.status === 'complete' ? `${r.overall_score}/100` : r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Sheet>
            )}
          </div>

          {/* Right: journeys + gaps */}
          <div className="space-y-5 lg:col-span-5">
            <Sheet className="overflow-hidden">
              <TitleBlock
                title="Learning journeys"
                sub="Actionable gap roadmaps"
                meta={`${journeyList.length} active`}
              />
              <div className="px-5 py-4">
                {journeyList.length === 0 ? (
                  <EmptyState
                    icon={<Route className="h-5 w-5" strokeWidth={1.8} />}
                    title="No journeys started yet"
                    body="Resolve a measured gap below to open your first quest."
                    action={
                      <Link
                        href="/student/journeys"
                        className={buttonClasses({ variant: 'signal', size: 'sm' })}
                      >
                        Start first journey
                      </Link>
                    }
                    className="border-0 bg-transparent py-6"
                  />
                ) : (
                  <div className="space-y-3">
                    {journeyList.slice(0, 3).map((j) => {
                      const percent = Math.round(
                        (j.completed_steps / (j.total_steps || 4)) * 100
                      );
                      return (
                        <div
                          key={j.id}
                          className="rounded-lg border border-ink-line bg-white p-3"
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-bold text-ink">
                              {j.skill}
                            </span>
                            {j.status === 'completed' ? (
                              <Badge tone="pass">Mastered</Badge>
                            ) : (
                              <span className="tabular shrink-0 font-mono text-xxs text-ink-faint">
                                {percent}%
                              </span>
                            )}
                          </div>
                          <Progress
                            value={percent}
                            tone={j.status === 'completed' ? 'pass' : 'ink'}
                            label={`${j.skill} journey progress`}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Sheet>

            <Sheet className="overflow-hidden">
              <TitleBlock
                title="Skill gaps"
                sub="Identified from target role benchmark"
                meta={`${(latest.skill_gaps || []).length} missing`}
              />
              <div className="divide-y divide-ink-line">
                {(latest.skill_gaps || []).map(
                  (gap: { skill: string; severity: string }) => {
                    const hasJourney = journeyList.some(
                      (j) => j.skill.toLowerCase() === gap.skill.toLowerCase()
                    );
                    return (
                      <div
                        key={gap.skill}
                        className="flex items-center justify-between gap-3 px-5 py-3"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-xs font-bold text-ink">
                            {gap.skill}
                          </div>
                          <SeverityBadge severity={gap.severity} className="mt-1" />
                        </div>
                        {hasJourney ? (
                          <Link
                            href="/student/journeys"
                            className={buttonClasses({ variant: 'ghost', size: 'sm' })}
                          >
                            In progress
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <Link
                            href="/student/journeys"
                            className={buttonClasses({ variant: 'signal', size: 'sm' })}
                          >
                            + Start quest
                          </Link>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </Sheet>

            <Sheet className="overflow-hidden">
              <TitleBlock title="Peer benchmark" meta="Campus directory" />
              <div className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-line bg-white text-info shadow-hairline">
                    <Users className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">
                      Campus Peer Progress Hub
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      See how other students in your department are preparing
                      and find study peers with complementary skills.
                    </p>
                    <Link
                      href="/campus/peers"
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-instrument-deep underline-offset-2 hover:underline"
                    >
                      Explore campus directory
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </Sheet>
          </div>
        </div>
      )}
    </div>
  );
}
