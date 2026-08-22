'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  MultiFactorError,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { registerForNotifications } from '@/lib/firebase/messaging';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 2FA challenge state
  const [mfaResolver, setMfaResolver] = useState<ReturnType<typeof getMultiFactorResolver> | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await completeSignIn(cred.user);
    } catch (err: any) {
      // Firebase throws this specific code when MFA is required
      if (err?.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, err as MultiFactorError);
        setMfaResolver(resolver);
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaResolver) return;
    setError('');
    setMfaLoading(true);
    try {
      // Find the TOTP enrollment hint (first enrolled factor)
      const hint = mfaResolver.hints.find(
        (h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID
      );
      if (!hint) throw new Error('No TOTP factor enrolled');

      const assertion = TotpMultiFactorGenerator.assertionForSignIn(hint.uid, totpCode);
      const cred = await mfaResolver.resolveSignIn(assertion);
      await completeSignIn(cred.user);
    } catch {
      setError('Invalid code — check your authenticator app and try again.');
    } finally {
      setMfaLoading(false);
    }
  }

  async function completeSignIn(user: import('firebase/auth').User) {
    const idToken = await user.getIdToken();
    const tokenResult = await user.getIdTokenResult();
    const role = tokenResult.claims.role as string | undefined;
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    registerForNotifications();
    router.push(role ? `/${role}/dashboard` : '/about');
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_.95fr]">
      <section className="flex flex-col justify-between bg-ink-deep p-8 text-white lg:p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-ink-edge bg-white font-mono text-sm font-semibold text-ink">
            CC
            <span
              aria-hidden
              className="absolute -right-[3px] -top-[3px] h-2 w-2 border-2 border-ink-deep bg-instrument"
            />
          </div>
          <div className="text-sm font-bold">Campus Career Copilot</div>
        </Link>
        <div className="max-w-xl py-20">
          <h1 className="text-[clamp(2.8rem,6.5vw,5.4rem)] font-extrabold leading-[0.92] tracking-[-0.03em]">
            Read the panel.
          </h1>
          <p className="mt-7 text-lg leading-8 text-[#AEBDD3]">
            Resume intelligence and cohort interventions
            open from the same role-aware instrument desk.
          </p>
        </div>
        <div className="grid gap-3 font-mono text-xxs font-medium uppercase tracking-[0.12em] text-[#AEBDD3] sm:grid-cols-3">
          <span className="rounded-lg border border-ink-edge p-3">Student readiness</span>
          <span className="rounded-lg border border-ink-edge p-3">TPO analytics</span>
          <span className="rounded-lg border border-ink-edge p-3">Cohort Analytics</span>
        </div>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-ink-line bg-sheet-raise shadow-lift">
          <div className="flex items-center justify-between gap-3 border-b border-ink-line bg-sheet-inset px-6 py-3">
            <h2 className="text-sm font-bold text-ink">
              {mfaResolver ? '2FA verification' : 'Operator sign-in'}
            </h2>
            <span className="font-mono text-xxs font-medium uppercase tracking-[0.1em] text-ink-faint">
              Secure portal
            </span>
          </div>
          <div className="px-6 py-6">

            {/* ── Normal sign-in form ── */}
            {!mfaResolver && (
              <>
                <p className="text-sm leading-relaxed text-ink-soft">
                  Use your campus account to continue.
                </p>
                <form onSubmit={handleLogin} className="mt-5 space-y-4">
                  <Field label="Campus email" htmlFor="login-email">
                    <Input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@campus.edu"
                    />
                  </Field>
                  <Field label="Password" htmlFor="login-password">
                    <Input
                      id="login-password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                    />
                  </Field>
                  {error && (
                    <div
                      role="alert"
                      className="rounded-lg border border-instrument/40 bg-instrument-wash px-3.5 py-2.5 text-sm font-medium text-instrument-deep"
                    >
                      {error}
                    </div>
                  )}
                  <Button type="submit" loading={loading} className="w-full">
                    {loading ? 'Signing in…' : 'Sign in to portal'}
                  </Button>
                  <p className="pt-1 text-center text-sm text-ink-soft">
                    Need an institutional account?{' '}
                    <Link
                      href="/signup"
                      className="font-semibold text-instrument-deep underline-offset-2 hover:underline"
                    >
                      Sign up with invite code
                    </Link>
                  </p>
                </form>
              </>
            )}

            {/* ── 2FA challenge step ── */}
            {mfaResolver && (
              <>
                <div className="flex items-center gap-2.5 rounded-lg border border-ink-line bg-sheet-inset px-4 py-3">
                  <Shield className="h-4 w-4 shrink-0 text-ink-soft" strokeWidth={1.8} />
                  <p className="text-xs text-ink-soft">
                    Your account has 2FA enabled. Enter the 6-digit code from your authenticator app.
                  </p>
                </div>
                <form onSubmit={handleMfaVerify} className="mt-5 space-y-4">
                  <Field label="Authenticator code" htmlFor="mfa-code">
                    <Input
                      id="mfa-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      autoComplete="one-time-code"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      autoFocus
                    />
                  </Field>
                  {error && (
                    <div
                      role="alert"
                      className="rounded-lg border border-instrument/40 bg-instrument-wash px-3.5 py-2.5 text-sm font-medium text-instrument-deep"
                    >
                      {error}
                    </div>
                  )}
                  <Button type="submit" loading={mfaLoading} className="w-full">
                    {mfaLoading ? 'Verifying…' : 'Verify & sign in'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setMfaResolver(null); setError(''); setTotpCode(''); }}
                    className="w-full text-center text-xs text-ink-faint hover:text-ink"
                  >
                    ← Back to sign-in
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
