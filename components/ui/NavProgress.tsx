'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  Suspense,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/* ─── Context ──────────────────────────────────────────────── */

interface NavProgressCtx {
  start: () => void;
}

const Ctx = createContext<NavProgressCtx>({ start: () => {} });

export function useNavProgress() {
  return useContext(Ctx);
}

/* ─── Inner bar — needs useSearchParams so must be in Suspense ─ */

function Bar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPath = useRef(pathname + searchParams.toString());
  const running = useRef(false);

  const clear = () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (timerRef.current != null) clearTimeout(timerRef.current);
  };

  const complete = useCallback(() => {
    clear();
    running.current = false;
    setProgress(100);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 450);
  }, []);

  // Exposed via context so Sidebar can call it on click
  const start = useCallback(() => {
    if (running.current) return;
    running.current = true;
    clear();
    setProgress(0);
    setVisible(true);

    let cur = 0;
    const tick = () => {
      const remaining = 85 - cur;
      const step = Math.max(0.5, remaining * 0.055);
      cur = Math.min(85, cur + step);
      setProgress(cur);
      if (cur < 85) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // When the path actually changes → complete the bar
  useEffect(() => {
    const next = pathname + searchParams.toString();
    if (next !== prevPath.current) {
      prevPath.current = next;
      complete();
    }
  }, [pathname, searchParams, complete]);

  // Share start() with context consumers
  useEffect(() => {
    (window as unknown as { __navProgressStart?: () => void }).__navProgressStart =
      start;
  }, [start]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: '0 0 auto 0',
        zIndex: 9999,
        height: 2,
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
              ? 'width 0.18s ease-out'
              : 'width 0.1s linear',
          opacity: progress >= 100 ? 0 : 1,
          transitionProperty: 'width, opacity',
          transitionDuration: progress >= 100 ? '0.18s, 0.4s' : '0.1s, 0s',
          transitionDelay: progress >= 100 ? '0s, 0.15s' : '0s, 0s',
          boxShadow: '0 0 8px 1px rgba(232,80,26,0.5)',
        }}
      />
    </div>
  );
}

/* ─── Provider ─────────────────────────────────────────────── */

export function NavProgressProvider({ children }: { children: React.ReactNode }) {
  const start = useCallback(() => {
    const fn = (window as unknown as { __navProgressStart?: () => void })
      .__navProgressStart;
    fn?.();
  }, []);

  return (
    <Ctx.Provider value={{ start }}>
      <Suspense>
        <Bar />
      </Suspense>
      {children}
    </Ctx.Provider>
  );
}
