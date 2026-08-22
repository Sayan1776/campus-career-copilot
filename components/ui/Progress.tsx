'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * Progress — the instrument world's tick-marked scale.
 * The track carries calibration ticks every tenth; the fill sweeps in
 * once on mount with an exponential ease-out, then holds.
 */
export function Progress({
  value,
  tone = 'ink',
  className,
  label,
}: {
  value: number;
  tone?: 'ink' | 'instrument' | 'pass';
  className?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const fill =
    tone === 'instrument'
      ? 'bg-instrument'
      : tone === 'pass'
        ? 'bg-pass'
        : 'bg-ink';

  return (
    <div
      className={cn('relative h-2 w-full overflow-hidden rounded-sm border border-ink-line bg-white', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        className={cn('h-full', fill)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Calibration ticks ride above the fill. */}
      <div aria-hidden className="tick-row pointer-events-none absolute inset-0" />
    </div>
  );
}
