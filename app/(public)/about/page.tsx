import nextDynamic from 'next/dynamic';
import { supabaseAdmin } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const CampusMap = nextDynamic(() => import('./CampusMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] w-full items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-400">
      Loading Campus Placement Map...
    </div>
  ),
});

const CAMPUS_LAT = 22.378;
const CAMPUS_LNG = 88.4409;
const CAMPUS_NAME = 'Apex Institute Placement Cell';

export default async function AboutPage() {
  const { data: visits } = await supabaseAdmin
    .from('company_visits')
    .select('*')
    .order('visit_date', { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-subtle mb-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 font-bold text-white text-sm">
              🎓
            </div>
            <span className="text-sm font-bold text-slate-900">Campus Career Copilot</span>
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
          >
            Portal Sign In →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">
              Institutional Placement Cell
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">About Campus Career Copilot</h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            An institutional placement and skill readiness platform for students, faculty coordinators, and visiting recruiters. Designed to provide transparent cohort diagnostics, personalized AI skill journeys, and direct candidate-job alignment.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Visiting Companies & Placement Drive Locations
          </h2>
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <CampusMap
              campusLat={CAMPUS_LAT}
              campusLng={CAMPUS_LNG}
              campusName={CAMPUS_NAME}
              visits={visits || []}
            />
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Confirmed Campus Drives:
            </h3>
            {visits && visits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {visits.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                  >
                    <span className="font-bold text-slate-800">{v.company_name}</span>
                    <span className="rounded bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                      {v.visit_date ? new Date(v.visit_date).toLocaleDateString() : 'Scheduled'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No company visits scheduled yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
