'use client';

import { motion } from 'framer-motion';
import { EASE_OUT } from '@/components/motion';
import { Progress } from '@/components/ui/Progress';
import { cn } from '@/lib/cn';

const readings = [
  { label: 'CORE', value: 0.84 },
  { label: 'DOMAIN', value: 0.62 },
  { label: 'TOOLS', value: 0.71 },
  { label: 'PROJECTS', value: 0.9 },
  { label: 'COMM', value: 0.55 },
];

const gauges = [
  { label: 'Resume parsed', value: '04m', tone: 'text-pass' },
  { label: 'Critical gaps', value: '12', tone: 'text-instrument-deep' },
  { label: 'JD matches', value: '38', tone: 'text-ink' },
];

const sequence = [
  { title: 'Diagnose', steps: ['Resume upload', 'Competency extraction', 'Readiness score'], pct: 86 },
  { title: 'Resolve', steps: ['Gap diagnosis', 'AI learning journey', 'Quiz verification'], pct: 64 },
  { title: 'Dispatch', steps: ['Cohort analytics', 'Workshop broadcast', 'TPO review'], pct: 42 },
];


/** Pentagon geometry — crisp vector instrumentation, computed not drawn. */
function polygon(values: number[], radius: number, cx = 130, cy = 124) {
  return values
    .map((v, i) => {
      const angle = (Math.PI * 2 * i) / values.length - Math.PI / 2;
      const r = radius * v;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export function InstrumentPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.1 }}
      className="overflow-hidden rounded-xl border border-ink-line bg-sheet-raise shadow-lift"
    >
      {/* Title block */}
      <div className="flex items-center justify-between gap-3 border-b border-ink-line bg-sheet-inset px-4 py-2.5">
        <h2 className="text-sm font-bold text-ink">Readiness panel</h2>
        <div className="flex items-center gap-2 font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pass opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-pass" />
          </span>
          Sheet 01 · Live
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_210px]">
        <div className="p-4 sm:p-6">
          {/* Primary reading + radar */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span aria-hidden className="h-1.5 w-1.5 bg-instrument" />
                <span className="font-mono text-xxs font-medium uppercase tracking-[0.12em] text-ink-faint">
                  Readiness
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <motion.span
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.25 }}
                  className="tabular font-mono text-[3.4rem] font-semibold leading-none tracking-[-0.02em] text-ink"
                >
                  84
                </motion.span>
                <span className="font-mono text-sm text-ink-faint">/100</span>
                <span className="ml-2 font-mono text-xs font-medium text-pass">▲ +6</span>
              </div>
              <div className="mt-4 w-48 max-w-full">
                <Progress value={84} label="Readiness score" />
              </div>
              <p className="mt-2 font-mono text-xxs uppercase tracking-[0.08em] text-ink-faint">
                Measured from resume evidence
              </p>
            </div>

            {/* Radar instrument on the fine grid */}
            <div className="graph-inset flex flex-1 items-center justify-center rounded-lg border border-ink-line p-3">
              <svg
                viewBox="0 0 260 248"
                className="h-auto w-full max-w-[290px]"
                role="img"
                aria-label="Sample competency radar across five skill axes"
              >
                {[0.33, 0.66, 1].map((f) => (
                  <polygon
                    key={f}
                    points={polygon(readings.map(() => f), 92)}
                    fill="none"
                    stroke="#D7E0EC"
                    strokeWidth={1}
                  />
                ))}
                {readings.map((_, i) => {
                  const angle = (Math.PI * 2 * i) / readings.length - Math.PI / 2;
                  return (
                    <line
                      key={i}
                      x1={130}
                      y1={124}
                      x2={130 + 92 * Math.cos(angle)}
                      y2={124 + 92 * Math.sin(angle)}
                      stroke="#D7E0EC"
                      strokeWidth={1}
                    />
                  );
                })}
                <motion.polygon
                  points={polygon(readings.map((r) => r.value), 92)}
                  fill="rgba(232, 80, 26, 0.10)"
                  stroke="#E8501A"
                  strokeWidth={1.75}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.35 }}
                  style={{ transformOrigin: '130px 124px' }}
                />
                {readings.map((r, i) => {
                  const angle = (Math.PI * 2 * i) / readings.length - Math.PI / 2;
                  return (
                    <rect
                      key={r.label}
                      x={130 + 92 * r.value * Math.cos(angle) - 2.5}
                      y={124 + 92 * r.value * Math.sin(angle) - 2.5}
                      width={5}
                      height={5}
                      fill="#E8501A"
                    />
                  );
                })}
                {readings.map((r, i) => {
                  const angle = (Math.PI * 2 * i) / readings.length - Math.PI / 2;
                  const x = 130 + 112 * Math.cos(angle);
                  const y = 124 + 112 * Math.sin(angle);
                  return (
                    <text
                      key={r.label}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={10}
                      fontFamily="var(--font-mono), monospace"
                      fill="#5B6B84"
                      letterSpacing="0.08em"
                    >
                      {r.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Gauge row */}
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {gauges.map((g, i) => (
              <motion.div
                key={g.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.45 + i * 0.08 }}
                className="rounded-lg border border-ink-line bg-white px-3 py-2.5"
              >
                <div className="font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
                  {g.label}
                </div>
                <div className={cn('tabular mt-1.5 font-mono text-2xl font-semibold', g.tone)}>
                  {g.value}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Calibration sequence */}
          <div className="mt-5 space-y-2.5">
            {sequence.map((lane, i) => (
              <div key={lane.title} className="rounded-lg border border-ink-line bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xxs font-medium uppercase tracking-[0.12em] text-ink-faint">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-ink">{lane.title}</span>
                  </div>
                  <span className="tabular font-mono text-xxs text-ink-faint">{lane.pct}%</span>
                </div>
                <Progress value={lane.pct} tone={i === 0 ? 'instrument' : 'ink'} label={`${lane.title} progress`} />
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {lane.steps.map((s) => (
                    <span key={s} className="text-[11px] font-medium text-ink-soft">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Measurement queue rail */}
        <aside className="border-t border-ink-line bg-sheet-inset p-4 lg:border-l lg:border-t-0">
          <div className="font-mono text-xxs font-medium uppercase tracking-[0.12em] text-ink-faint">
            In measurement
          </div>
          <div className="mt-3 rounded-lg border border-ink-line bg-white p-3.5">
            <div className="text-sm font-bold text-ink">Campus Drive 2026</div>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              Multi-branch hiring across CS, Mech, Civil, ECE, and Chemical — matched against opted-in profiles.
            </p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
                  Match pool
                </div>
                <div className="tabular mt-1 font-mono text-[2.2rem] font-semibold leading-none text-ink">
                  38
                </div>
              </div>
              <div className="rounded-md bg-ink px-3 py-1.5 text-xs font-bold text-white">Review</div>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {['CSE · 2026', 'MECH · 2026', 'CIVIL · 2027', 'EEE · 2026'].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between rounded-md border border-ink-line bg-white px-2.5 py-2"
              >
                <span className="font-mono text-xxs text-ink-soft">{row}</span>
                <span className="font-mono text-xxs text-pass">READY</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
