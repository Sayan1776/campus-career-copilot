import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton', className)} />;
}

/**
 * SheetSkeleton — the "loading from server" state shown while Next.js
 * streams the page segment. Blocks stagger in to communicate progress,
 * and a pulsing instrument-red dot anchors the eye while the sheet loads.
 */
export function SheetSkeleton() {
  return (
    <div
      className="page-canvas"
      aria-busy="true"
      aria-live="polite"
      style={{ animationFillMode: 'both' }}
    >
      {/* Status row */}
      <div className="flex items-center gap-2.5 pb-1" aria-hidden>
        <span
          className="relative flex h-2 w-2 shrink-0"
          style={{ animation: 'none' }}
        >
          {/* Ping ring */}
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '9999px',
              backgroundColor: 'var(--instrument)',
              opacity: 0.35,
              animation: 'cc-ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
            }}
          />
          {/* Solid dot */}
          <span
            style={{
              position: 'relative',
              display: 'block',
              width: '100%',
              height: '100%',
              borderRadius: '9999px',
              backgroundColor: 'var(--instrument)',
            }}
          />
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
            fontSize: '0.6875rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#8A97AB',
            animation: 'cc-fade-in 0.4s ease both',
          }}
        >
          Fetching data…
        </span>
      </div>

      {/* Header block */}
      <div
        className="border-b border-ink-line pb-5"
        style={{ animation: 'cc-rise 0.4s 0.05s ease both' }}
      >
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="mt-2.5 h-4 w-96 max-w-full" />
      </div>

      {/* Stat cards row */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        style={{ animation: 'cc-rise 0.4s 0.12s ease both' }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[86px] rounded-xl" />
        ))}
      </div>

      {/* Chart panels row */}
      <div
        className="grid gap-4 lg:grid-cols-2"
        style={{ animation: 'cc-rise 0.4s 0.2s ease both' }}
      >
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>

      {/* Extra content row */}
      <div
        className="grid gap-4 lg:grid-cols-3"
        style={{ animation: 'cc-rise 0.4s 0.28s ease both' }}
      >
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>

      <span className="sr-only">Loading page content from server…</span>
    </div>
  );
}

