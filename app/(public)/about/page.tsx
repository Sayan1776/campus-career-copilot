import type { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { supabaseAdmin } from '@/lib/supabase/server';
import Link from 'next/link';
import { MapPin, ArrowRight, Gauge, Route, Users, ScanText } from 'lucide-react';
import { Sheet, TitleBlock } from '@/components/ui/Sheet';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { buttonClasses } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About · Campus Career Copilot',
  description: 'About the Campus Career Copilot placement readiness platform — built for students, TPOs, and placement cells.',
};

const CampusMap = nextDynamic(() => import('./CampusMap'), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[480px] w-full items-center justify-center bg-sheet-inset"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-sm space-y-3 px-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-[360px] w-full rounded-lg" />
        <span className="sr-only">Calibrating the About…</span>
      </div>
    </div>
  ),
});

const CAMPUS_LAT = 22.378;
const CAMPUS_LNG = 88.4409;
const CAMPUS_NAME = 'GMIT Placement Cell';

const features = [
  {
    icon: <ScanText className="h-5 w-5" strokeWidth={1.8} />,
    title: 'AI Resume Analysis',
    body: 'Automated skill extraction, gap detection, and a calibrated readiness score based on actual resume evidence.',
  },
  {
    icon: <Route className="h-5 w-5" strokeWidth={1.8} />,
    title: '4-Stage Skill Journeys',
    body: 'Structured learning roadmaps — concept, course, challenge, and a full MCQ exam — personalized per branch.',
  },
  {
    icon: <Users className="h-5 w-5" strokeWidth={1.8} />,
    title: 'Peer Benchmarking',
    body: 'Cross-branch cohort view with filterable department, skill, and readiness rankings across the batch.',
  },
  {
    icon: <Gauge className="h-5 w-5" strokeWidth={1.8} />,
    title: 'TPO Cohort Dashboard',
    body: 'Placement cell analytics — placement rate, skill gap distribution, workshop triggers, and push notifications.',
  },
];

// ─── Student flow nodes ────────────────────────────────────────────────────
const studentNodes = [
  { label: '01', title: 'Sign Up', sub: 'Email + dept + invite code', color: '#E8501A', light: '#FFF0EB' },
  { label: '02', title: 'Upload Resume', sub: 'PDF → AI extraction', color: '#3B5FC0', light: '#EEF2FF' },
  { label: '03', title: 'Readiness Score', sub: 'Skills + gap report', color: '#3B5FC0', light: '#EEF2FF' },
  { label: '04', title: 'Skill Journeys', sub: 'Concept→Course→Quiz', color: '#3B5FC0', light: '#EEF2FF' },
  { label: '05', title: 'Peer Hub', sub: 'Cross-branch ranking', color: '#3B5FC0', light: '#EEF2FF' },
  { label: '06', title: 'Placement Ready', sub: 'TPO review + notify', color: '#166534', light: '#F0FDF4' },
];

const studentAnnotations = [
  'Firebase Auth · invite-code role gate',
  '/api/resume/analyze · Gemini',
  'Supabase resumes table',
  '/api/student/journeys · AI gen',
  '/campus/peers · dept filter',
  'TPO dashboard · FCM notify',
];

// ─── TPO flow nodes ────────────────────────────────────────────────────────
const tpoNodes = [
  { label: '01', title: 'TPO Sign Up', sub: 'Email + TPO invite code', color: '#E8501A', light: '#FFF0EB' },
  { label: '02', title: 'Cohort View', sub: 'All students + scores', color: '#7C3AED', light: '#F5F3FF' },
  { label: '03', title: 'Gap Analytics', sub: 'Dept / batch filters', color: '#7C3AED', light: '#F5F3FF' },
  { label: '04', title: 'Student Drill', sub: 'Per-student resume', color: '#7C3AED', light: '#F5F3FF' },
  { label: '05', title: 'Push Notify', sub: 'FCM → gap students', color: '#7C3AED', light: '#F5F3FF' },
  { label: '06', title: 'Company Drives', sub: 'Pin visits on map', color: '#166534', light: '#F0FDF4' },
];

const tpoAnnotations = [
  'Firebase Auth · TPO invite code',
  '/tpo/dashboard · Supabase',
  'Recharts · dept/year filter',
  '/campus/peers · resume detail',
  '/api/tpo/notify · FCM tokens',
  'company_visits · Leaflet map',
];

// ─── Architecture layers ───────────────────────────────────────────────────
const clientBoxes = [
  { x: 15,  label: 'Student Dashboard', sub: 'Resume score · Radar chart' },
  { x: 200, label: 'Skill Journeys', sub: 'Concept · Course · Quiz' },
  { x: 385, label: 'Peer Directory', sub: 'Cross-branch benchmarking' },
  { x: 570, label: 'TPO Analytics', sub: 'Cohort · gap charts · notify' },
  { x: 755, label: 'Public Pages', sub: 'Landing · About · Map' },
];

const serverBoxes = [
  { x: 15,  label: '/api/resume/analyze',    sub: 'Auth · PDF parse · Gemini · upsert',          color: '#3B5FC0' },
  { x: 245, label: '/api/student/journeys',   sub: 'Generate journey · toggle step · verify quiz', color: '#3B5FC0' },
  { x: 475, label: '/api/auth/*',             sub: 'set-role · session cookie · verify-session',   color: '#3B5FC0' },
  { x: 705, label: '/api/tpo/notify',         sub: 'FCM push · skill-gap filter · broadcast',      color: '#3B5FC0' },
];

const dataBoxes = [
  { x: 15,  label: 'Supabase (PostgreSQL)', sub: 'users · resumes · skill_journeys · company_visits', color: '#166534', light: '#F0FDF4' },
  { x: 260, label: 'Google Gemini AI',      sub: 'Resume analysis · Journey gen · LaTeX builder',      color: '#B45309', light: '#FFFBEB' },
  { x: 505, label: 'Firebase Auth',          sub: 'Session cookies · TOTP 2FA · FCM push tokens',       color: '#B91C1C', light: '#FFF1F2' },
  { x: 750, label: 'Leaflet / OSM',          sub: 'Campus map · company drive pins',                     color: '#1E40AF', light: '#EFF6FF' },
];

export default async function AboutPage() {
  const { data: visits } = await supabaseAdmin
    .from('company_visits')
    .select('*')
    .order('visit_date', { ascending: true });

  return (
    <div className="min-h-screen pb-20">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-ink-line bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-ink-line bg-white font-mono text-xs font-semibold text-ink shadow-hairline">
              CC
              <span
                aria-hidden
                className="absolute -right-[3px] -top-[3px] h-1.5 w-1.5 border-2 border-white bg-instrument"
              />
            </div>
            <span className="text-sm font-bold text-ink">Campus Career Copilot</span>
          </Link>
          <Link
            href="/login"
            className={buttonClasses({ variant: 'outline', size: 'sm' })}
          >
            Portal sign in
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 pt-8 sm:px-6 pb-20">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 auto-rows-min">

          {/* Hero block - span 8 */}
          <Sheet className="flex flex-col overflow-hidden lg:col-span-12 xl:col-span-8">
            <TitleBlock title="About the system" meta="Sheet AB-01" />
            <div className="flex flex-col flex-1 p-6 md:p-8 lg:p-10">
              <div className="max-w-3xl">
                <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl lg:text-5xl">
                  Campus Career Copilot
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base lg:text-lg">
                  An institutional placement and skill readiness platform built for
                  engineering students, faculty coordinators, and placement cells.
                  Every claim on the sheet is traceable to measured resume evidence —
                  no guesswork, no vanity metrics.
                </p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <Badge tone="info">Institutional placement cell</Badge>
                  <Badge tone="neutral">All engineering branches</Badge>
                  <Badge tone="neutral">AI-powered · Gemini</Badge>
                </div>
              </div>

              {/* Quick-stats strip */}
              <div className="mt-auto pt-10">
                <div className="grid grid-cols-2 gap-px rounded-xl border border-ink-line overflow-hidden bg-ink-line text-center shadow-sm sm:grid-cols-4">
                  {[
                    { label: 'Departments', value: '11' },
                    { label: 'Journey steps', value: '4' },
                    { label: 'AI model', value: 'Gemini' },
                    { label: 'Security', value: 'TOTP 2FA' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white px-4 py-4 md:px-6 md:py-5">
                      <div className="font-mono text-xl font-bold text-ink md:text-2xl">{s.value}</div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint md:text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Sheet>

          {/* Feature grid - span 4 */}
          <Sheet className="flex flex-col overflow-hidden lg:col-span-12 xl:col-span-4">
            <TitleBlock title="System capabilities" sub="What the instrument measures" meta="4 modules" />
            <div className="flex-1 grid grid-cols-1 divide-y divide-ink-line sm:grid-cols-2 xl:grid-cols-1 sm:divide-x xl:divide-x-0 sm:divide-y-0 xl:divide-y">
              {features.map((f, i) => (
                <div key={i} className="px-6 py-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2.5">
                    <span className="text-instrument">{f.icon}</span>
                    <h3 className="text-sm font-bold text-ink">{f.title}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">{f.body}</p>
                </div>
              ))}
            </div>
          </Sheet>

          {/* ── Student User Flow ── */}
          <Sheet className="flex flex-col overflow-hidden lg:col-span-12 xl:col-span-6">
            <TitleBlock
              title="Student user flow"
              sub="From signup to placement-ready — 6 measured steps"
              meta="Sheet AB-02"
            />
            <div className="flex-1 overflow-x-auto px-6 py-8 flex items-center justify-center">
              <svg
                viewBox="-10 -24 960 272"
                className="w-full min-w-[680px] drop-shadow-sm"
                role="img"
                aria-label="Student user flow diagram"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <marker id="arr-s" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#94A3B8" />
                  </marker>
                </defs>

                {/* Role pill */}
                <rect x="0" y="-22" width="82" height="16" rx="4" fill="#FFF0EB" />
                <text x="6" y="-10" fontFamily="ui-monospace,monospace" fontSize="9" fontWeight="700" fill="#E8501A" letterSpacing="0.08em">
                  STUDENT
                </text>

                {/* Connector lines between nodes */}
                {[130, 290, 450, 610, 770].map((x) => (
                  <line key={x} x1={x} y1="110" x2={x + 20} y2="110" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arr-s)" />
                ))}

                {/* Step nodes */}
                {studentNodes.map((n, i) => (
                  <g key={n.label} transform={`translate(${i * 160}, 54)`}>
                    <rect width="126" height="112" rx="10" fill={n.light} stroke={n.color} strokeWidth="1.5" />
                    <text x="10" y="20" fontFamily="ui-monospace,monospace" fontSize="10" fontWeight="700" fill={n.color} letterSpacing="0.08em">
                      {n.label}
                    </text>
                    <text x="10" y="48" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" fill="#1E293B">
                      {n.title}
                    </text>
                    <text x="10" y="66" fontFamily="system-ui,sans-serif" fontSize="10" fill="#64748B">
                      {n.sub.replace('→', '→').split(' ').slice(0, 3).join(' ')}
                    </text>
                    {n.sub.split(' ').length > 3 && (
                      <text x="10" y="80" fontFamily="system-ui,sans-serif" fontSize="10" fill="#64748B">
                        {n.sub.split(' ').slice(3).join(' ')}
                      </text>
                    )}
                  </g>
                ))}

                {/* Annotation labels under nodes */}
                {studentAnnotations.map((a, i) => (
                  <text key={i} x={i * 160 + 2} y="188" fontFamily="ui-monospace,monospace" fontSize="8" fill="#CBD5E1" letterSpacing="0.04em">
                    {a}
                  </text>
                ))}
              </svg>
            </div>
          </Sheet>

          {/* ── TPO User Flow ── */}
          <Sheet className="flex flex-col overflow-hidden lg:col-span-12 xl:col-span-6">
            <TitleBlock
              title="TPO user flow"
              sub="From login to cohort intervention — 6 operational steps"
              meta="Sheet AB-03"
            />
            <div className="flex-1 overflow-x-auto px-6 py-8 flex items-center justify-center">
              <svg
                viewBox="-10 -24 960 272"
                className="w-full min-w-[680px] drop-shadow-sm"
                role="img"
                aria-label="TPO user flow diagram"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <marker id="arr-t" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#94A3B8" />
                  </marker>
                </defs>

                {/* Role pill */}
                <rect x="0" y="-22" width="156" height="16" rx="4" fill="#F5F3FF" />
                <text x="6" y="-10" fontFamily="ui-monospace,monospace" fontSize="9" fontWeight="700" fill="#7C3AED" letterSpacing="0.08em">
                  TPO / PLACEMENT CELL
                </text>

                {/* Connector lines */}
                {[130, 290, 450, 610, 770].map((x) => (
                  <line key={x} x1={x} y1="110" x2={x + 20} y2="110" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arr-t)" />
                ))}

                {/* Step nodes */}
                {tpoNodes.map((n, i) => (
                  <g key={n.label} transform={`translate(${i * 160}, 54)`}>
                    <rect width="126" height="112" rx="10" fill={n.light} stroke={n.color} strokeWidth="1.5" />
                    <text x="10" y="20" fontFamily="ui-monospace,monospace" fontSize="10" fontWeight="700" fill={n.color} letterSpacing="0.08em">
                      {n.label}
                    </text>
                    <text x="10" y="48" fontFamily="system-ui,sans-serif" fontSize="12" fontWeight="700" fill="#1E293B">
                      {n.title}
                    </text>
                    <text x="10" y="66" fontFamily="system-ui,sans-serif" fontSize="10" fill="#64748B">
                      {n.sub.split(' ').slice(0, 3).join(' ')}
                    </text>
                    {n.sub.split(' ').length > 3 && (
                      <text x="10" y="80" fontFamily="system-ui,sans-serif" fontSize="10" fill="#64748B">
                        {n.sub.split(' ').slice(3).join(' ')}
                      </text>
                    )}
                  </g>
                ))}

                {/* Annotation labels under nodes */}
                {tpoAnnotations.map((a, i) => (
                  <text key={i} x={i * 160 + 2} y="188" fontFamily="ui-monospace,monospace" fontSize="8" fill="#CBD5E1" letterSpacing="0.04em">
                    {a}
                  </text>
                ))}
              </svg>
            </div>
          </Sheet>

          {/* ── System Architecture ── full width */}
          <Sheet className="flex flex-col overflow-hidden lg:col-span-12">
            <TitleBlock
              title="System architecture"
              sub="Three-layer stack powering both student and TPO workflows"
              meta="Sheet AB-04"
            />
            <div className="flex-1 overflow-x-auto px-6 py-8 flex items-center justify-center">
              <svg
                viewBox="-10 -10 960 430"
                className="w-full min-w-[860px] drop-shadow-sm"
                role="img"
                aria-label="System architecture diagram"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="#94A3B8" />
                  </marker>
                </defs>

                {/* Layer labels */}
                {[
                  { y: 12,  label: 'CLIENT LAYER — Next.js 14 · React Server Components + Client Islands' },
                  { y: 142, label: 'SERVER LAYER — Next.js App Router API Routes · Node.js runtime' },
                  { y: 272, label: 'DATA & AI LAYER — External services' },
                ].map((l) => (
                  <text key={l.y} x="10" y={l.y} fontFamily="ui-monospace,monospace" fontSize="9" fontWeight="600" fill="#94A3B8" letterSpacing="0.10em">
                    {l.label}
                  </text>
                ))}

                {/* Layer background bands */}
                <rect x="0" y="18"  width="940" height="118" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <rect x="0" y="148" width="940" height="118" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                <rect x="0" y="278" width="940" height="118" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

                {/* CLIENT LAYER boxes */}
                {clientBoxes.map((b) => (
                  <g key={b.x} transform={`translate(${b.x}, 26)`}>
                    <rect width="162" height="100" rx="7" fill="white" stroke="#CBD5E1" strokeWidth="1.2" />
                    <text x="10" y="22" fontFamily="system-ui,sans-serif" fontSize="11" fontWeight="700" fill="#1E293B">{b.label}</text>
                    <text x="10" y="40" fontFamily="ui-monospace,monospace" fontSize="9" fill="#64748B">{b.sub.split(' · ')[0]}</text>
                    {b.sub.includes(' · ') && (
                      <text x="10" y="54" fontFamily="ui-monospace,monospace" fontSize="9" fill="#64748B">{b.sub.split(' · ').slice(1).join(' · ')}</text>
                    )}
                  </g>
                ))}

                {/* Vertical connectors client → server */}
                {[96, 281, 466, 651, 836].map((cx) => (
                  <line key={cx} x1={cx} y1="126" x2={cx} y2="148" stroke="#CBD5E1" strokeWidth="1.2" markerEnd="url(#arr2)" />
                ))}

                {/* SERVER LAYER boxes */}
                {serverBoxes.map((b) => (
                  <g key={b.x} transform={`translate(${b.x}, 156)`}>
                    <rect width="212" height="100" rx="7" fill="white" stroke={b.color} strokeWidth="1.4" />
                    <text x="10" y="22" fontFamily="ui-monospace,monospace" fontSize="10" fontWeight="700" fill={b.color}>{b.label}</text>
                    <text x="10" y="40" fontFamily="ui-monospace,monospace" fontSize="8.5" fill="#64748B">{b.sub.split(' · ')[0]}</text>
                    {b.sub.includes(' · ') && (
                      <text x="10" y="54" fontFamily="ui-monospace,monospace" fontSize="8.5" fill="#64748B">{b.sub.split(' · ').slice(1).join(' · ')}</text>
                    )}
                  </g>
                ))}

                {/* Vertical connectors server → data */}
                {[121, 351, 581, 811].map((cx) => (
                  <line key={cx} x1={cx} y1="256" x2={cx} y2="278" stroke="#CBD5E1" strokeWidth="1.2" markerEnd="url(#arr2)" />
                ))}

                {/* DATA & AI LAYER boxes */}
                {dataBoxes.map((b) => (
                  <g key={b.x} transform={`translate(${b.x}, 286)`}>
                    <rect width="218" height="100" rx="7" fill={b.light} stroke={b.color} strokeWidth="1.4" />
                    <text x="10" y="22" fontFamily="system-ui,sans-serif" fontSize="11" fontWeight="700" fill={b.color}>{b.label}</text>
                    <text x="10" y="40" fontFamily="ui-monospace,monospace" fontSize="8.5" fill="#64748B">{b.sub.split(' · ')[0]}</text>
                    {b.sub.includes(' · ') && (
                      <text x="10" y="54" fontFamily="ui-monospace,monospace" fontSize="8.5" fill="#64748B">{b.sub.split(' · ').slice(1).join(' · ')}</text>
                    )}
                  </g>
                ))}

                {/* Edge Middleware note */}
                <text
                  x="470" y="418"
                  fontFamily="ui-monospace,monospace"
                  fontSize="8"
                  fill="#94A3B8"
                  textAnchor="middle"
                  letterSpacing="0.06em"
                >
                  Edge Middleware guards /student/* and /tpo/* — HMAC-signed role cookie + Firebase session cookie verified per route
                </text>
              </svg>
            </div>
          </Sheet>

          {/* Map section - span 8 */}
          <Sheet className="flex flex-col overflow-hidden lg:col-span-12 xl:col-span-8">
            <TitleBlock
              title="Placement cell location & campus drives"
              sub="Company stations plotted around the GMIT placement cell"
              meta="Live map"
            />
            <div className="relative flex-1 min-h-[360px] border-b border-ink-line bg-sheet-inset">
              <CampusMap
                campusLat={CAMPUS_LAT}
                campusLng={CAMPUS_LNG}
                campusName={CAMPUS_NAME}
                visits={visits || []}
              />
              {/* Map legend overlay */}
              <div className="absolute bottom-3 left-3 z-[400] flex flex-col gap-1.5 rounded-lg border border-ink-line bg-white/90 px-3 py-2.5 backdrop-blur-sm shadow-lift">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-instrument text-[8px] font-bold text-white">CC</span>
                  <span className="font-mono text-xxs text-ink-soft">Placement cell</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ink text-[8px] font-bold text-white">C</span>
                  <span className="font-mono text-xxs text-ink-soft">Company drive</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <h3 className="font-mono text-xxs font-medium uppercase tracking-[0.12em] text-ink-faint">
                Confirmed campus drives
              </h3>
              {visits && visits.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {visits.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-ink-line bg-white px-3 py-2.5 transition-colors hover:border-ink-line-strong"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-instrument" strokeWidth={1.8} />
                        <span className="truncate">{v.company_name}</span>
                      </span>
                      <span className="shrink-0 rounded-md border border-ink-line px-2 py-0.5 font-mono text-xxs text-ink-soft">
                        {v.visit_date
                          ? new Date(v.visit_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'Scheduled'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-soft">
                  No company visits scheduled yet — the map shows the placement
                  cell station only.
                </p>
              )}
            </div>
          </Sheet>

          {/* Footer CTA - span 4 */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-ink-line bg-gradient-to-b from-white to-sheet-inset px-8 py-12 text-center shadow-sm lg:col-span-12 xl:col-span-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-instrument/10 text-instrument">
              <ScanText className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-ink md:text-2xl">
              Ready to measure your readiness?
            </h2>
            <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
              Sign in to the placement portal to upload your resume, start a skill journey, and track your progress on the instrument sheet.
            </p>
            <Link href="/login" className={buttonClasses({ variant: 'primary', size: 'lg' }) + " mt-4 w-full sm:w-auto"}>
              Go to portal <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
