'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { registerForNotifications } from '@/lib/firebase/messaging';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { DEPARTMENTS } from '@/lib/departments';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const setRoleRes = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          inviteCode,
          ...(department ? { department } : {}),
        }),
      });
      if (!setRoleRes.ok) {
        const { error: msg } = await setRoleRes.json();
        throw new Error(msg || 'Invalid invite code');
      }
      const { role } = await setRoleRes.json();
      const freshToken = await cred.user.getIdToken(true);
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: freshToken }),
      });
      registerForNotifications();
      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[.95fr_1.05fr]">
      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md overflow-hidden rounded-xl border border-ink-line bg-sheet-raise shadow-lift">
          <div className="flex items-center justify-between gap-3 border-b border-ink-line bg-sheet-inset px-6 py-3">
            <h1 className="text-sm font-bold text-ink">Create campus account</h1>
            <span className="font-mono text-xxs font-medium uppercase tracking-[0.1em] text-instrument-deep">
              Invite required
            </span>
          </div>
          <div className="px-6 py-6">
            <p className="text-sm leading-relaxed text-ink-soft">
              Register with the role code your placement cell issued.
            </p>
            <form onSubmit={handleSignup} className="mt-5 space-y-4">
              <Field label="Campus email" htmlFor="signup-email">
                <Input
                  id="signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                />
              </Field>
              <Field
                label="Password"
                htmlFor="signup-password"
                hint="Minimum 6 characters"
              >
                <Input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </Field>
              <Field
                label="Institutional invite code"
                htmlFor="signup-code"
                hint="Issued by your placement cell — one code per role"
              >
                <Input
                  id="signup-code"
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter invite code"
                  className="font-mono"
                />
              </Field>
              <Field
                label="Department (students)"
                htmlFor="signup-department"
                hint="Branch of study — steers role suggestions and resume analysis"
              >
                <Select
                  id="signup-department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">Select if registering as a student…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
              </Field>
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-instrument/40 bg-instrument-wash px-3.5 py-2.5 text-sm font-medium text-instrument-deep"
                >
                  {error}
                </div>
              )}
              <Button type="submit" variant="signal" loading={loading} className="w-full">
                {loading ? 'Setting up profile…' : 'Complete registration'}
              </Button>
              <p className="pt-1 text-center text-sm text-ink-soft">
                Already registered?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-instrument-deep underline-offset-2 hover:underline"
                >
                  Log in here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-between bg-ink-deep p-8 text-white lg:p-12">
        <Link href="/" className="flex items-center gap-3 self-start">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-ink-edge bg-white font-mono text-sm font-semibold text-ink">
            CC
            <span
              aria-hidden
              className="absolute -right-[3px] -top-[3px] h-2 w-2 border-2 border-ink-deep bg-instrument"
            />
          </div>
          <span className="text-sm font-bold">Campus Career Copilot</span>
        </Link>
        <div className="max-w-xl py-20">
          <h2 className="text-[clamp(2.8rem,6.5vw,5.4rem)] font-extrabold leading-[0.92] tracking-[-0.03em]">
            Take your station.
          </h2>
          <p className="mt-7 text-lg leading-8 text-[#AEBDD3]">
            Students and TPOs enter different workflows from one
            verified campus identity.
          </p>
        </div>
        <div className="rounded-xl border border-ink-edge bg-[#0C1526] p-5">
          <div className="font-mono text-xxs font-medium uppercase tracking-[0.14em] text-[#7E90AE]">
            Code routes
          </div>
          <div className="mt-3 grid gap-2 font-mono text-xxs uppercase tracking-[0.1em] text-[#AEBDD3] sm:grid-cols-3">
            <span className="rounded-md border border-ink-edge px-2.5 py-1.5">Student</span>
            <span className="rounded-md border border-ink-edge px-2.5 py-1.5">TPO</span>
            <span className="rounded-md border border-ink-edge px-2.5 py-1.5 hidden">Recruiter</span>
          </div>
        </div>
      </section>
    </main>
  );
}
