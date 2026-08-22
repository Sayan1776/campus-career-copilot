'use client';

import { useEffect } from 'react';

export default function NotificationListener() {
  useEffect(() => {
    let active = true;
    // Loaded lazily so the FCM SDK stays out of the dashboard's initial
    // bundle — it attaches shortly after hydration instead.
    import('@/lib/firebase/messaging').then((mod) => {
      if (active) mod.listenForForegroundMessages();
    });
    return () => {
      active = false;
    };
  }, []);

  return null;
}
