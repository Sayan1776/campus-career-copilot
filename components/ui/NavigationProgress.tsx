'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgress — a hairline instrument-red sweep bar that fires on
 * every client-side route change. It starts immediately (so the user feels
 * the click register), accelerates to ~85%, then completes on the next
 * render after the new pathname is confirmed.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const raf = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(pathname + searchParams.toString());

  const clear = useCallback(() => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    if (timer.current !== null) clearTimeout(timer.current);
  }, []);

  const complete = useCallback(() => {
    clear();
    setProgress(100);
    timer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
  }, [clear]);

  const start = useCallback(() => {
    clear();
    setProgress(0);
    setVisible(true);

    let current = 0;
    const tick = () => {
      // Trickle toward 85, slowing as it approaches.
      const remaining = 85 - current;
      const increment = Math.max(0.4, remaining * 0.06);
      current = Math.min(85, current + increment);
      setProgress(current);
      if (current < 85) {
        raf.current = requestAnimationFrame(tick);
      }
    };
    raf.current = requestAnimationFrame(tick);
  }, [clear]);

  useEffect(() => {
    const next = pathname + searchParams.toString();
    if (next !== prevPathRef.current) {
      prevPathRef.current = next;
      complete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // On mount / first render — nothing to do. We only react to changes.
  // The sidebar calls `start()` imperatively via the context below.
  // Here we export both the bar and a hook so the sidebar can call start().

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '2px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--instrument)',
          transition:
            progress === 100
              ? 'width 0.15s ease-out, opacity 0.35s ease 0.1s'
              : 'width 0.12s linear',
          opacity: progress === 100 ? 0 : 1,
          boxShadow: '0 0 6px 1px rgba(232,80,26,0.55)',
        }}
      />
    </div>
  );
}
