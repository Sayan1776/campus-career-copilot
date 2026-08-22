'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * ProcessingNotice — the sheet is still being measured. While visible, it
 * polls the server so the reading appears without a manual reload.
 */
export function ProcessingNotice() {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-ink-line bg-sheet-raise px-6 py-10 text-center shadow-raise"
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="mb-3 h-6 w-6 animate-spin text-instrument" />
      <h3 className="text-sm font-bold text-ink">Resume under measurement…</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">
        Extracting technical competencies and mapping institutional placement
        gaps. The reading posts to this sheet automatically.
      </p>
    </div>
  );
}
