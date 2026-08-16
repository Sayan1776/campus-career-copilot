import { cookies } from 'next/headers';
import Link from 'next/link';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SkillRadarChart from '@/app/(dashboard)/student/dashboard/SkillRadarChart';
import CompetencyList from '@/components/CompetencyList';

export const dynamic = 'force-dynamic';

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

  // Fetch the peer's base profile
  const { data: peer, error: peerError } = await supabaseAdmin
    .from('users')
    .select('id, name, department, batch_year, target_role, github_url, linkedin_url, role')
    .eq('id', peerId)
    .single();

  if (peerError || !peer) {
    return (
      <div className="dashboard-content">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
          <h2 className="text-lg font-bold mb-2">Student not found</h2>
          <p className="text-sm">The requested student profile could not be located.</p>
          <Link href="/campus/peers" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">
            ← Back to Peer Hub
          </Link>
        </div>
      </div>
    );
  }

  // Fetch their latest completed resume
  const { data: resumes } = await supabaseAdmin
    .from('resumes')
    .select('overall_score, extracted_skills, skill_gaps, uploaded_at')
    .eq('user_id', peerId)
    .eq('status', 'complete')
    .order('uploaded_at', { ascending: false })
    .limit(1);

  const latestResume = resumes?.[0];

  // Fetch their skill journeys
  const { data: journeys } = await supabaseAdmin
    .from('skill_journeys')
    .select('id, skill, status, steps, created_at, last_updated_at')
    .eq('user_id', peerId)
    .order('last_updated_at', { ascending: false });

  const journeyList = journeys || [];
  const completedJourneys = journeyList.filter((j) => j.status === 'completed');
  const inProgressJourneys = journeyList.filter((j) => j.status === 'in_progress');

  return (
    <div className="dashboard-content">
      {/* Back button */}
      <div className="mb-4">
        <Link href="/campus/peers" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
          ← Back to Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 font-bold text-white text-3xl shadow-md mb-4">
              {peer.name.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{peer.name}</h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              {peer.department || 'Computer Science'} • Class of {peer.batch_year || 2026}
            </p>
            
            <div className="mt-4 inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
              🎯 Target: {peer.target_role || 'Software Engineer'}
            </div>

            {/* Social Links */}
            {(peer.github_url || peer.linkedin_url) && (
              <div className="mt-6 flex justify-center gap-3">
                {peer.github_url && (
                  <a href={peer.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                  </a>
                )}
                {peer.linkedin_url && (
                  <a href={peer.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          {latestResume && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Readiness Score
                </div>
                <div className="text-5xl font-extrabold text-indigo-600">
                  {latestResume.overall_score}
                  <span className="text-2xl text-slate-400">/100</span>
                </div>
                <div className="mt-4 text-xs font-semibold text-slate-400">
                  Last evaluated: {new Date(latestResume.uploaded_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Deep Dive */}
        <div className="lg:col-span-2 space-y-6">
          {!latestResume ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                📄
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Resume Data</h3>
              <p className="mt-2 text-sm text-slate-500">
                This student hasn't uploaded a resume for evaluation yet.
              </p>
            </div>
          ) : (
            <>
              {/* Radar Chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                  360° Competency Radar
                </h2>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2">
                  <SkillRadarChart 
                    extractedSkills={latestResume.extracted_skills || []} 
                    skillGaps={latestResume.skill_gaps || []} 
                  />
                </div>
              </div>

              {/* Verified Extracted Skills */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Verified Extracted Skills
                </h2>
                <CompetencyList skills={latestResume.extracted_skills || []} />
              </div>

              {/* Learning Journeys */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Skill Journeys & Gap Learning
                </h2>

                {journeyList.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No active learning journeys.</p>
                ) : (
                  <div className="space-y-4">
                    {/* In Progress */}
                    {inProgressJourneys.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 mb-2">In Progress</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {inProgressJourneys.map((j) => {
                            const stepsObj = j.steps as any[];
                            const total = stepsObj?.length || 3;
                            const completed = stepsObj?.filter((s) => s.completed)?.length || 0;
                            const progress = Math.round((completed / total) * 100);

                            return (
                              <div key={j.id} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                                <h4 className="font-semibold text-slate-900 mb-2 truncate">{j.skill}</h4>
                                <div className="flex items-center justify-between text-xs font-medium text-indigo-600 mb-1.5">
                                  <span>{completed}/{total} steps</span>
                                  <span>{progress}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-100">
                                  <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Completed */}
                    {completedJourneys.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 mb-2 mt-4">Mastered</h3>
                        <div className="flex flex-wrap gap-2">
                          {completedJourneys.map((j) => (
                            <span key={j.id} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {j.skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
