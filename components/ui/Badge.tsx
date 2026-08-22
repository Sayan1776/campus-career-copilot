import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'pass' | 'warn' | 'danger' | 'info' | 'instrument';

const tones: Record<Tone, string> = {
  neutral: 'border-ink-line-strong bg-sheet-inset text-ink-soft',
  pass: 'border-pass/30 bg-pass-wash text-pass-deep',
  warn: 'border-warn/35 bg-warn-wash text-warn',
  danger: 'border-instrument/35 bg-instrument-wash text-instrument-deep',
  info: 'border-info/30 bg-info-wash text-info',
  instrument: 'border-instrument/55 bg-white text-instrument-deep',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-px font-mono text-xxs font-medium uppercase tracking-[0.05em]',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Measurement-grade severity mark for gap lists and rosters. */
export function SeverityBadge({
  severity,
  className,
}: {
  severity: string;
  className?: string;
}) {
  const normalized = (severity || '').toLowerCase();
  const tone: Tone =
    normalized === 'high' ? 'danger' : normalized === 'medium' ? 'warn' : 'neutral';
  return (
    <Badge tone={tone} className={className}>
      <span
        aria-hidden
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-[1px]',
          normalized === 'high'
            ? 'bg-instrument'
            : normalized === 'medium'
              ? 'bg-warn'
              : 'bg-ink-faint'
        )}
      />
      {normalized || 'low'}
    </Badge>
  );
}
