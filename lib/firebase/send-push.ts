import { adminMessaging } from '@/lib/firebase/admin';

/**
 * Sends a push notification to a list of FCM tokens. Tokens that are
 * null/empty are silently skipped (user never granted permission).
 * Returns how many sends actually succeeded.
 */
export async function sendPushToTokens(
  tokens: (string | null)[],
  title: string,
  body: string
): Promise<number> {
  const validTokens = tokens.filter((t): t is string => !!t);
  if (validTokens.length === 0) return 0;

  let sent = 0;
  // Sent individually rather than via sendMulticast so one invalid/expired
  // token can't fail the whole batch during a live demo.
  await Promise.all(
    validTokens.map(async (token) => {
      try {
        await adminMessaging.send({
          token,
          notification: { title, body },
        });
        sent++;
      } catch (err) {
        console.warn('FCM send failed for a token (skipped):', err);
      }
    })
  );

  return sent;
}
