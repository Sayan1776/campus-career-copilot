import Link from 'next/link';
import { Crosshair } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-ink-line bg-sheet-raise text-center shadow-lift">
        <div className="border-b border-ink-line bg-sheet-inset px-6 py-3">
          <h1 className="text-sm font-bold text-ink">Off the sheet</h1>
        </div>
        <div className="px-6 py-10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-ink-line bg-white text-ink-faint shadow-hairline">
            <Crosshair className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <p className="tabular font-mono text-4xl font-semibold text-ink">404</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            This station isn&apos;t plotted on the map. The coordinates may have
            moved or the sheet was retired.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Link href="/" className={buttonClasses({ variant: 'primary' })}>
              Back to landing
            </Link>
            <Link href="/login" className={buttonClasses({ variant: 'outline' })}>
              Portal sign-in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
