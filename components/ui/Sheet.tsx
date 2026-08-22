import { cn } from '@/lib/cn';

/**
 * Sheet — a white instrument placed on the graph-paper ground.
 * Elevation is declared once: hairline border carries the edge,
 * the shadow stays nearly invisible until the sheet lifts.
 */
export function Sheet({
  className,
  hoverable = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-ink-line bg-sheet-raise shadow-raise',
        hoverable &&
          'transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-line-strong hover:shadow-lift',
        className
      )}
      {...props}
    />
  );
}

/**
 * TitleBlock — the drawing-sheet header strip: name of the instrument,
 * optional sub, and a mono serial or status on the right rail.
 */
export function TitleBlock({
  title,
  sub,
  meta,
  className,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-ink-line bg-sheet-inset px-4 py-2.5',
        className
      )}
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-bold tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {sub && (
          <p className="mt-0.5 truncate text-xs text-ink-faint">{sub}</p>
        )}
      </div>
      {meta && (
        <div className="shrink-0 font-mono text-xxs font-medium uppercase tracking-[0.08em] text-ink-faint">
          {meta}
        </div>
      )}
    </div>
  );
}
