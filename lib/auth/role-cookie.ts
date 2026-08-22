/**
 * HMAC role cookie utilities — Edge-runtime compatible (Web Crypto API only).
 *
 * WHY THIS EXISTS:
 * Middleware runs on the Edge runtime and cannot call firebase-admin (Node APIs).
 * The previous approach fetched /api/auth/verify-session on every protected
 * request — a full network round-trip before the page even starts rendering.
 *
 * Instead, when a session cookie is issued we also write a short-lived
 * `session_role` cookie whose value is:
 *   base64url(role + "|" + expiresAt) + "." + base64url(HMAC-SHA256 signature)
 *
 * Middleware verifies the HMAC and reads the role directly — zero network hops.
 * The Firebase session cookie is still verified by firebase-admin in every
 * actual API route via verifySession(), so the security model is unchanged:
 * the role cookie only speeds up route-matching in middleware.
 *
 * The role cookie intentionally has the same MaxAge as the Firebase session
 * cookie (14 days).  If either expires or is cleared, the user is redirected
 * to login.
 */

const ALGO = { name: 'HMAC', hash: 'SHA-256' };

function getSecret(): string {
  const s = process.env.SESSION_ROLE_SECRET;
  if (!s) throw new Error('SESSION_ROLE_SECRET env var is not set');
  return s;
}

async function importKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey('raw', enc.encode(secret), ALGO, false, ['sign', 'verify']);
}

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function b64urlDecode(s: string): Uint8Array<ArrayBuffer> {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const chars = atob(padded);
  const buf = new ArrayBuffer(chars.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < chars.length; i++) view[i] = chars.charCodeAt(i);
  return view;
}

export const ROLE_COOKIE = 'session_role';
export const ROLE_COOKIE_MAX_AGE = 60 * 60 * 24 * 14; // 14 days — matches Firebase session

/**
 * Produce the signed cookie value for a given role.
 * Format: base64url(payload) "." base64url(sig)
 */
export async function signRoleCookie(role: string): Promise<string> {
  const expiresAt = Date.now() + ROLE_COOKIE_MAX_AGE * 1000;
  const payload = `${role}|${expiresAt}`;
  const key = await importKey(getSecret());
  const sig = await crypto.subtle.sign(ALGO, key, new TextEncoder().encode(payload));
  const payloadBytes = new TextEncoder().encode(payload);
  return `${b64url(payloadBytes.buffer as ArrayBuffer)}.${b64url(sig)}`;
}

/**
 * Verify a signed cookie value. Returns the role string on success,
 * null if the signature is invalid or the cookie has expired.
 */
export async function verifyRoleCookie(cookie: string): Promise<string | null> {
  try {
    const dot = cookie.lastIndexOf('.');
    if (dot === -1) return null;

    const payloadB64 = cookie.slice(0, dot);
    const sigB64 = cookie.slice(dot + 1);

    const payloadBytes = b64urlDecode(payloadB64);
    const sigBytes = b64urlDecode(sigB64);

    const key = await importKey(getSecret());
    const valid = await crypto.subtle.verify(ALGO, key, sigBytes, payloadBytes);
    if (!valid) return null;

    const payload = new TextDecoder().decode(payloadBytes);
    const [role, expiresAtStr] = payload.split('|');
    if (!role || !expiresAtStr) return null;
    if (Date.now() > parseInt(expiresAtStr, 10)) return null;

    return role;
  } catch {
    return null;
  }
}
