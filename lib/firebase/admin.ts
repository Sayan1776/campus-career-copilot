// Server-only Firebase Admin init. Never import this from a client component.
// Used to: verify ID tokens in middleware/API routes, set custom claims (role),
// and send FCM push notifications.

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  // Service account JSON is stored as a single env var (stringified) so it
  // works cleanly on Vercel. Never commit the actual key file.
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  );

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminMessaging = getMessaging(adminApp);

/**
 * Assigns a role to a user via Firebase custom claims.
 * Called once, right after signup, from /api/auth/set-role.
 */
export async function setUserRole(
  uid: string,
  role: 'student' | 'tpo' | 'recruiter'
) {
  await adminAuth.setCustomUserClaims(uid, { role });
}
