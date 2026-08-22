'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-ink-line bg-sheet-raise text-center shadow-lift">
        <div className="border-b border-ink-line bg-sheet-inset px-6 py-3">
          <h1 className="text-sm font-bold text-ink">Measurement interrupted</h1>
        </div>
        <div className="px-6 py-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-instrument/40 bg-instrument-wash text-instrument-deep">
            <AlertTriangle className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">
            Something went wrong while reading this sheet. The reading itself is
            safe — try again.
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xxs text-ink-faint">
              Reference {error.digest}
            </p>
          )}
          <Button onClick={reset} className="mt-5">
            <RotateCcw className="h-3.5 w-3.5" />
            Try again
          </Button>
        </div>
      </div>
    </main>
  );
}
