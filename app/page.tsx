import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campus Career Copilot - AI-Powered Placement Readiness',
  description:
    'AI-powered campus placement assistant with resume analysis, skill journeys, and peer benchmarking.',
};

const signals = [
  { label: 'Resume parsed', value: '04m', tone: 'bg-[#2fbf91]' },
  { label: 'Critical gaps', value: '12', tone: 'bg-[#ff6b57]' },
  { label: 'JD matches', value: '38', tone: 'bg-[#f5c542]' },
];

const lanes = [
  ['Resume upload', 'Competency extraction', 'Readiness score'],
  ['Gap diagnosis', 'AI learning journey', 'Quiz verification'],
  ['Cohort analytics', 'Workshop broadcast', 'Recruiter match'],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden dispatch-grid text-[#14213d]">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14213d] text-sm font-black text-[#fffdf8] shadow-card">CC</div>
          <div>
            <div className="text-sm font-black leading-tight">Campus Career Copilot</div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#65718b]">Placement command desk</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-[#34425f] md:flex">
          <Link href="/about" className="hover:text-[#14213d]">Campus map</Link>
          <Link href="/login" className="hover:text-[#14213d]">Portal login</Link>
        </nav>
        <Link href="/signup" className="ops-button-signal px-5 py-2.5 text-sm">Get started</Link>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-12 pt-4 sm:px-8">
        <section className="grid min-h-[calc(100vh-120px)] grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h1 className="max-w-3xl text-[clamp(3rem,7vw,6rem)] font-black leading-[0.88] tracking-[-0.04em] text-[#14213d]">
              Placement readiness, on dispatch.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#34425f]">
              One operating surface for resume diagnosis, skill gap resolution, cohort analytics, and recruiter matching across the campus placement cycle.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="ops-button-primary px-6 py-3 text-center text-sm">Open campus desk</Link>
              <Link href="/about" className="rounded-xl border border-[#b6c3d5] bg-[#fffdf8]/80 px-6 py-3 text-center text-sm font-black text-[#14213d] shadow-subtle hover:bg-white">View drive map</Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="ops-panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#d6deea] bg-[#14213d] px-5 py-3 text-[#fffdf8]">
                <div className="text-xs font-black uppercase tracking-[0.16em]">Live placement board</div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#c9d4e6]"><span className="h-2 w-2 rounded-full bg-[#2fbf91]" /> Active</div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[1fr_220px]">
                <div className="p-5 sm:p-7">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {signals.map((signal) => (
                      <div key={signal.label} className="rounded-xl border border-[#d6deea] bg-[#fffdf8] p-4 shadow-subtle">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#65718b]"><span className={`h-2.5 w-2.5 rounded-full ${signal.tone}`} />{signal.label}</div>
                        <div className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#14213d]">{signal.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    {lanes.map((lane, laneIndex) => (
                      <div key={lane.join('-')} className="rounded-xl border border-[#d6deea] bg-[#eef5ff] p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#65718b]">Lane {laneIndex + 1}</div>
                          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#d6deea]"><div className="h-full rounded-full bg-[#f5c542]" style={{ width: `${72 - laneIndex * 14}%` }} /></div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {lane.map((item, itemIndex) => (
                            <div key={item} className="relative rounded-lg border border-[#b6c3d5] bg-[#fffdf8] px-3 py-3 text-sm font-extrabold text-[#14213d]">
                              <span className="absolute right-2 top-2 text-[10px] font-black text-[#9a6b00]">{String(itemIndex + 1).padStart(2, '0')}</span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <aside className="border-t border-[#d6deea] bg-[#fff7d7] p-5 lg:border-l lg:border-t-0">
                  <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#9a6b00]">Focus bracket</div>
                  <div className="mt-3 rounded-xl border border-[#f5c542] bg-[#fffdf8] p-4">
                    <div className="text-sm font-black text-[#14213d]">Software Engineer 2026</div>
                    <div className="mt-2 text-xs leading-5 text-[#65718b]">Python, React, Docker, SQL matched against opted-in student profiles.</div>
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#65718b]">Match pool</div>
                        <div className="text-4xl font-black tracking-[-0.04em]">38</div>
                      </div>
                      <div className="rounded-lg bg-[#14213d] px-3 py-2 text-xs font-black text-[#fffdf8]">Review</div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-4 py-8 md:grid-cols-3">
          {['Students get a next action after every score.', 'TPOs see cohort risk before placement week.', 'Recruiters rank candidates by skill evidence.'].map((copy) => (
            <div key={copy} className="ops-panel p-5">
              <p className="text-lg font-black leading-6 text-[#14213d]">{copy}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}