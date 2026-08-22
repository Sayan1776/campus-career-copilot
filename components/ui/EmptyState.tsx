import { cn } from '@/lib/cn';

/**
 * EmptyState — an unfilled measurement. The icon sits on the grid
 * in a hairline well; the action names the next step, not the void.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-line-strong bg-white/60 px-6 py-12 text-center',
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-ink-line bg-sheet-raise text-ink-faint shadow-hairline">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      {body && (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{body}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
