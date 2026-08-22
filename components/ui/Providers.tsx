'use client';

import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { NavProgressProvider } from './NavProgress';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <NavProgressProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #D7E0EC',
              color: '#16233B',
              fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
              borderRadius: '10px',
              boxShadow:
                '0 4px 8px rgba(22, 35, 59, 0.08), 0 24px 64px rgba(22, 35, 59, 0.18)',
            },
          }}
        />
      </NavProgressProvider>
    </MotionConfig>
  );
}
