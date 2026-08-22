import { cn } from '@/lib/cn';

/**
 * PageHeader — the sheet's title block: reading title, sub annotation,
 * actions and a mono serial on the right rail.
 */
export function PageHeader({
  title,
  sub,
  actions,
  meta,
  className,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-ink-line pb-4 md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-[1.55rem] font-extrabold leading-tight tracking-[-0.02em] text-ink md:text-[1.8rem]">
          {title}
        </h1>
        {sub && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {sub}
          </p>
        )}
      </div>
      {(actions || meta) && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {meta && (
            <span className="mr-1 font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
              {meta}
            </span>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}
