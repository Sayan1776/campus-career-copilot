import { cn } from '@/lib/cn';

/**
 * Stat — a gauge on the sheet: calibration mark + mono label above,
 * a large mono reading below. Numbers are data, so they set in mono.
 */
export function Stat({
  label,
  value,
  unit,
  delta,
  deltaTone = 'pass',
  sub,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  delta?: React.ReactNode;
  deltaTone?: 'pass' | 'danger' | 'neutral';
  sub?: React.ReactNode;
  className?: string;
}) {
  const deltaClass =
    deltaTone === 'pass'
      ? 'text-pass'
      : deltaTone === 'danger'
        ? 'text-instrument-deep'
        : 'text-ink-faint';

  return (
    <div
      className={cn(
        'rounded-xl border border-ink-line bg-sheet-raise px-4 pb-3.5 pt-3 shadow-raise',
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-instrument" />
        <span className="truncate font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
          {label}
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="tabular font-mono text-[1.85rem] font-semibold leading-none text-ink">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-ink-faint">{unit}</span>
        )}
        {delta && (
          <span className={cn('ml-auto shrink-0 font-mono text-xs font-medium', deltaClass)}>
            {delta}
          </span>
        )}
      </div>
      {sub && <div className="mt-2 text-xs leading-relaxed text-ink-soft">{sub}</div>}
    </div>
  );
}
