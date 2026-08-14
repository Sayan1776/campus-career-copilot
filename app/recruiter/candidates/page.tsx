import { cookies } from 'next/headers';
import Link from 'next/link';
import { adminAuth } from '@/lib/firebase/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import NavBar from '@/components/NavBar';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Jd {
  id: string;
  title: string;
  required_skills: string[];
  posted_at: string;
}

interface CandidateResume {
  user_id: string;
  overall_score: number | null;
  extracted_skills: string[];
}

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

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: { jd?: string };
}) {
  const uid = await getCurrentUid();
  if (!uid) {
    redirect('/login');
  }

  const { data: jds } = await supabaseAdmin
    .from('jds')
    .select('*')
    .eq('recruiter_id', uid)
    .order('posted_at', { ascending: false })
    .returns<Jd[]>();

  const selectedJd = searchParams.jd
    ? jds?.find((j) => j.id === searchParams.jd)
    : jds?.[0];

  let ranked: {
    id: string;
    name: string;
    department: string;
    score: number;
    overlap: number;
    matchedSkills: string[];
    allSkills: string[];
  }[] = [];

  if (selectedJd) {
    // Only opted-in students, only completed resumes.
    const { data: optedInUsers } = await supabaseAdmin
      .from('users')
      .select('id, name, department')
      .eq('role', 'student')
      .eq('opted_in_recruiter', true);

    const optedInIds = (optedInUsers || []).map((u) => u.id);

    const { data: resumes } = optedInIds.length
      ? await supabaseAdmin
          .from('resumes')
          .select('user_id, overall_score, extracted_skills')
          .eq('status', 'complete')
          .in('user_id', optedInIds)
          .returns<CandidateResume[]>()
      : { data: [] };

    const userMap = new Map((optedInUsers || []).map((u) => [u.id, u]));
    const requiredSet = new Set(
      (selectedJd.required_skills || []).map((s) => s.toLowerCase())
    );

    ranked = (resumes || [])
      .map((r) => {
        const user = userMap.get(r.user_id);
        const matched = (r.extracted_skills || []).filter((s) =>
          requiredSet.has(s.toLowerCase())
        );
        return {
          id: r.user_id,
          name: user?.name || 'Anonymous Candidate',
          department: user?.department || 'Computer Science',
          score: r.overall_score || 0,
          overlap: matched.length,
          matchedSkills: matched,
          allSkills: r.extracted_skills || [],
        };
      })
      .filter((c) => c.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap || b.score - a.score);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <NavBar label="Recruiter" />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Campus Candidate Matching</h1>
              <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                Recruiter Portal
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Ranked talent matching institutional job descriptions by skill overlap and competency scores.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/campus/peers"
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-subtle"
            >
              Browse Full Talent Pool
            </Link>
            <Link
              href="/recruiter/post-jd"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-subtle"
            >
              + Post New JD
            </Link>
          </div>
        </div>

        {!jds || jds.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xl">
              💼
            </div>
            <h3 className="text-base font-bold text-slate-800">No Job Descriptions Posted Yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Post your job opening with required skill requirements to instantly match with vetted campus candidates.
            </p>
            <Link
              href="/recruiter/post-jd"
              className="inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-card"
            >
              Post First JD
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* JD selector tabs */}
            <div className="flex flex-wrap gap-2">
              {jds.map((jd) => {
                const isSelected = selectedJd?.id === jd.id;
                return (
                  <Link
                    key={jd.id}
                    href={`/recruiter/candidates?jd=${jd.id}`}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-subtle ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {jd.title}
                  </Link>
                );
              })}
            </div>

            {selectedJd && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Required Competencies for {selectedJd.title}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedJd.required_skills || []).map((s) => (
                    <span
                      key={s}
                      className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Candidates List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Ranked Matching Candidates ({ranked.length})
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  Filtered to students opted-in for campus placement
                </span>
              </div>

              {ranked.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No opted-in students match this JD&apos;s required skills yet. Check back as students update their resumes and complete skill journeys.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ranked.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:border-indigo-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                            <div className="text-xs text-slate-500 font-medium">{c.department}</div>
                          </div>
                          <div className="text-right">
                            <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                              {c.overlap} skills matched
                            </span>
                            <div className="text-[11px] text-slate-500 mt-0.5">Score: {c.score}/100</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Matched Skills:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {c.matchedSkills.map((s) => (
                              <span
                                key={s}
                                className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                              >
                                ✓ {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
