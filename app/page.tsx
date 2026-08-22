import Link from 'next/link';
import type { Metadata } from 'next';
import { Route, Gauge, UserSearch } from 'lucide-react';
import { InstrumentPanel } from '@/components/landing/InstrumentPanel';
import { buttonClasses } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Campus Career Copilot — Placement readiness, measured',
  description:
    'AI-powered campus placement readiness: resume diagnosis, skill journeys, peer benchmarking, and cohort analytics — one instrument sheet.',
};

const capabilities = [
  {
    icon: <Route className="h-5 w-5" strokeWidth={1.8} />,
    title: 'Diagnosis becomes a next action',
    body: 'Every score ends in a prescribed skill journey — concept, challenge, quiz — not a report that sits still.',
  },
  {
    icon: <Gauge className="h-5 w-5" strokeWidth={1.8} />,
    title: 'Cohort risk, visible early',
    body: 'TPOs read severity across the batch while there is still a semester left to intervene.',
  },
  {
    icon: <UserSearch className="h-5 w-5" strokeWidth={1.8} />,
    title: 'TPOs rank by evidence',
    body: 'Job descriptions match against measured skills from real resumes, with student opt-in respected.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-ink-line bg-white font-mono text-sm font-semibold text-ink shadow-hairline">
            CC
            <span
              aria-hidden
              className="absolute -right-[3px] -top-[3px] h-2 w-2 border-2 border-sheet bg-instrument"
            />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-ink">
              Campus Career Copilot
            </div>
            <div className="mt-0.5 font-mono text-xxs font-medium uppercase tracking-[0.16em] text-ink-faint">
              Placement instruments
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-ink-soft md:flex" aria-label="Site">
          <Link href="/about" className="transition-colors hover:text-ink">
            About
          </Link>
          <Link href="/login" className="transition-colors hover:text-ink">
            Portal login
          </Link>
        </nav>
        <Link href="/signup" className={buttonClasses({ variant: 'signal', size: 'md' })}>
          Get started
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-4 sm:px-8">
        <section className="grid min-h-[calc(100vh-135px)] grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h1 className="max-w-3xl text-[clamp(2.9rem,6.5vw,5.4rem)] font-extrabold leading-[0.92] tracking-[-0.03em] text-ink">
              Placement readiness, measured.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-soft">
              One instrument panel for resume diagnosis, skill-gap resolution,
              cohort analytics across the campus
              placement cycle.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
                Open campus desk
              </Link>
              <Link href="/about" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
                View drive map
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-2 font-mono text-xxs font-medium uppercase tracking-[0.14em] text-ink-faint">
              <span aria-hidden className="h-1.5 w-1.5 bg-instrument" />
              Calibrated for the 2026 drive season
            </p>
          </div>

          <div className="lg:col-span-7">
            <InstrumentPanel />
          </div>
        </section>

        <section className="grid gap-4 py-10 md:grid-cols-3" aria-label="Capabilities">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="rounded-xl border border-ink-line bg-sheet-raise p-5 shadow-raise transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-line-strong hover:shadow-lift"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-line bg-white text-ink shadow-hairline">
                {cap.icon}
              </div>
              <h2 className="mt-4 text-base font-bold leading-snug tracking-[-0.01em] text-ink">
                {cap.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{cap.body}</p>
            </div>
          ))}
        </section>

        <footer className="flex flex-col items-start justify-between gap-3 border-t border-ink-line pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-xxs uppercase tracking-[0.12em] text-ink-faint">
            Campus Career Copilot — placement instruments
          </p>
          <p className="font-mono text-xxs uppercase tracking-[0.12em] text-ink-faint">
            Sheet 00 · Landing
          </p>
        </footer>
      </main>
    </div>
  );
}
