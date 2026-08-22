'use client';

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseApp } from '@/lib/firebase/app';

/**
 * Requests notification permission, grabs an FCM device token, and saves
 * it to the user's row in Supabase (via /api/notifications/register-token).
 * Call this once after login/signup. Safe to call multiple times — it's
 * a no-op if permission is denied, and just re-registers the same token
 * if already granted.
 */
export async function registerForNotifications(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const messaging = getMessaging(firebaseApp);

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) return;

    await fetch('/api/notifications/register-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    // Don't let a notification permission failure break the app — this is
    // a nice-to-have, not a critical path.
    console.warn('FCM registration failed (non-fatal):', err);
  }
}

/**
 * The service worker's onBackgroundMessage only fires when the tab is NOT
 * focused. When the tab IS focused (the common case while actually using
 * the app), FCM delivers the message silently to JS instead — nothing
 * shows on screen unless we listen for it ourselves and display it. This
 * is why a "successfully sent" push can still be invisible to the user.
 * Call this once, e.g. in a small client component mounted in the layout.
 */
export function listenForForegroundMessages() {
  if (typeof window === 'undefined') return;

  try {
    const messaging = getMessaging(firebaseApp);
    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification || {};
      if (Notification.permission === 'granted') {
        new Notification(title || 'Campus Career Copilot', { body: body || '' });
      }
    });
  } catch (err) {
    console.warn('Foreground FCM listener failed (non-fatal):', err);
  }
}