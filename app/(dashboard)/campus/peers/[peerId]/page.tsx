import { cookies } from 'next/headers';
import Link from 'next/link';
import nextDynamic from 'next/dynamic';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CompetencyList from '@/components/CompetencyList';
import { PageHeader } from '@/components/ui/PageHeader';
import { Sheet, TitleBlock } from '@/components/ui/Sheet';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { buttonClasses } from '@/components/ui/Button';
import { Crosshair, UserX, ArrowLeft } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/BrandIcons';

export const dynamic = 'force-dynamic';

const SkillRadarChart = nextDynamic(
  () => import('@/app/(dashboard)/student/dashboard/SkillRadarChart'),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[320px] w-full rounded-lg" />,
  }
);

export default async function PeerProfilePage({ params }: { params: { peerId: string } }) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    redirect('/login');
  }

  const peerId = params.peerId;

  const { data: peer, error: peerError } = await supabaseAdmin
    .from('users')
    .select('id, name, department, batch_year, target_role, github_url, linkedin_url, role')
    .eq('id', peerId)
    .single();

  if (peerError || !peer) {
    return (
      <div className="page-canvas">
        <EmptyState
          icon={<UserX className="h-5 w-5" strokeWidth={1.8} />}
          title="Student not found"
          body="The requested student profile could not be located on this sheet."
          action={
            <Link href="/campus/peers" className={buttonClasses({ variant: 'outline' })}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to directory
            </Link>
          }
          className="border-instrument/40 bg-instrument-wash/50"
        />
      </div>
    );
  }

  const { data: resumes } = await supabaseAdmin
    .from('resumes')
    .select('overall_score, extracted_skills, skill_gaps, uploaded_at')
    .eq('user_id', peerId)
    .eq('status', 'complete')
    .order('uploaded_at', { ascending: false })
    .limit(1);

  const latestResume = resumes?.[0];

  const { data: journeys } = await supabaseAdmin
    .from('skill_journeys')
    .select('id, skill, status, steps, created_at, last_updated_at')
    .eq('user_id', peerId)
    .order('last_updated_at', { ascending: false });

  const journeyList = journeys || [];
  const completedJourneys = journeyList.filter((j) => j.status === 'completed');
  const inProgressJourneys = journeyList.filter((j) => j.status === 'in_progress');

  return (
    <div className="page-canvas">
      <div>
        <Link
          href="/campus/peers"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to directory
        </Link>
      </div>

      <PageHeader
        title={peer.name}
        sub={`${peer.department || '—'} · Class of ${peer.batch_year || 2026} · Target: ${peer.target_role || '—'}`}
        meta="Sheet PD-05"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: profile station */}
        <div className="space-y-5 lg:col-span-1">
          <Sheet className="overflow-hidden">
            <TitleBlock title="Profile" meta="Station card" />
            <div className="px-5 py-5 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-ink-line bg-white font-mono text-2xl font-semibold text-ink shadow-hairline">
                {peer.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-ink">{peer.name}</h2>
              <p className="mt-1 font-mono text-xxs text-ink-faint">
                {peer.department || '—'} · {peer.batch_year || 2026}
              </p>

              <div className="mt-4">
                <span className="inline-flex max-w-full items-center gap-1.5 rounded border border-ink-line bg-sheet-inset px-2.5 py-1.5 text-xs font-semibold text-ink">
                  <Crosshair className="h-3.5 w-3.5 shrink-0 text-instrument" strokeWidth={1.8} />
                  <span className="truncate">{peer.target_role || '—'}</span>
                </span>
              </div>

              {(peer.github_url || peer.linkedin_url) && (
                <div className="mt-5 flex justify-center gap-2">
                  {peer.github_url && (
                    <a
                      href={peer.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${peer.name}'s GitHub profile`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-line bg-white text-ink-soft shadow-hairline transition-colors hover:text-ink"
                    >
                      <GithubIcon className="h-4 w-4" />
                    </a>
                  )}
                  {peer.linkedin_url && (
                    <a
                      href={peer.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${peer.name}'s LinkedIn profile`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-line bg-white text-ink-soft shadow-hairline transition-colors hover:text-ink"
                    >
                      <LinkedinIcon className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </Sheet>

          {latestResume && (
            <Sheet className="overflow-hidden">
              <TitleBlock title="Readiness reading" meta="Latest measurement" />
              <div className="flex flex-col items-center px-5 py-6 text-center">
                <div className="flex items-baseline gap-1">
                  <span className="tabular font-mono text-[3.4rem] font-semibold leading-none tracking-[-0.02em] text-ink">
                    {latestResume.overall_score}
                  </span>
                  <span className="font-mono text-sm text-ink-faint">/100</span>
                </div>
                <div className="mt-4 w-full max-w-[220px]">
                  <Progress
                    value={latestResume.overall_score || 0}
                    tone={(latestResume.overall_score || 0) >= 75 ? 'pass' : 'instrument'}
                    label={`${peer.name} readiness score`}
                  />
                </div>
                <div className="mt-3 font-mono text-xxs text-ink-faint">
                  Measured {new Date(latestResume.uploaded_at).toLocaleDateString()}
                </div>
              </div>
            </Sheet>
          )}
        </div>

        {/* Right: deep dive */}
        <div className="space-y-5 lg:col-span-2">
          {!latestResume ? (
            <EmptyState
              icon={<Crosshair className="h-5 w-5" strokeWidth={1.8} />}
              title="No resume data"
              body="This student hasn't put a resume under measurement yet."
              className="bg-sheet-raise"
            />
          ) : (
            <>
              <Sheet className="overflow-hidden">
                <TitleBlock title="360° competency radar" sub="Strengths and measured gaps in one shape" />
                <div className="graph-inset m-4 rounded-lg border border-ink-line p-2 md:m-5">
                  <SkillRadarChart
                    extractedSkills={latestResume.extracted_skills || []}
                    skillGaps={latestResume.skill_gaps || []}
                  />
                </div>
              </Sheet>

              <Sheet className="overflow-hidden">
                <TitleBlock
                  title="Measured competencies"
                  meta={`${latestResume.extracted_skills?.length || 0} on file`}
                />
                <div className="px-5 py-5">
                  <CompetencyList skills={latestResume.extracted_skills || []} />
                </div>
              </Sheet>

              <Sheet className="overflow-hidden">
                <TitleBlock
                  title="Skill journeys & gap learning"
                  meta={`${inProgressJourneys.length} active · ${completedJourneys.length} mastered`}
                />
                <div className="px-5 py-5">
                  {journeyList.length === 0 ? (
                    <p className="text-sm italic text-ink-faint">
                      No active learning journeys.
                    </p>
                  ) : (
                    <div className="space-y-5">
                      {inProgressJourneys.length > 0 && (
                        <div>
                          <h3 className="mb-2 font-mono text-xxs font-medium uppercase tracking-[0.12em] text-ink-faint">
                            In progress
                          </h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {inProgressJourneys.map((j) => {
                              const stepsObj = j.steps as any[];
                              const total = stepsObj?.length || 3;
                              const completed = stepsObj?.filter((s) => s.completed)?.length || 0;
                              const progress = Math.round((completed / total) * 100);
                              return (
                                <div
                                  key={j.id}
                                  className="rounded-lg border border-ink-line bg-white p-3.5"
                                >
                                  <h4 className="mb-2 truncate text-xs font-bold text-ink">
                                    {j.skill}
                                  </h4>
                                  <div className="mb-1.5 flex items-center justify-between font-mono text-xxs text-ink-faint">
                                    <span>
                                      {completed}/{total} steps
                                    </span>
                                    <span>{progress}%</span>
                                  </div>
                                  <Progress value={progress} label={`${j.skill} progress`} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {completedJourneys.length > 0 && (
                        <div>
                          <h3 className="mb-2 mt-2 font-mono text-xxs font-medium uppercase tracking-[0.12em] text-ink-faint">
                            Mastered
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {completedJourneys.map((j) => (
                              <Badge key={j.id} tone="pass" className="px-2.5 py-1 text-xs normal-case tracking-normal">
                                {j.skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
