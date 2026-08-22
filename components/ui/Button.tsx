import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'signal' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex select-none items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-instrument disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white shadow-hairline hover:bg-[#20304C] active:translate-y-px',
  signal: 'bg-instrument text-white shadow-hairline hover:bg-instrument-deep active:translate-y-px',
  outline:
    'border border-ink-line-strong bg-white text-ink hover:border-ink-soft hover:shadow-hairline active:translate-y-px',
  ghost: 'text-ink-soft hover:bg-sheet-inset hover:text-ink',
  danger:
    'border border-instrument/40 bg-instrument-wash text-instrument-deep hover:border-instrument hover:bg-[#F7DDD2]',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
}: {
  variant?: Variant;
  size?: Size;
} = {}) {
  return cn(base, variants[variant], sizes[size]);
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonClasses({ variant, size }), className)}
        {...props}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
        {children}
      </button>
    );
  }
);
