'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { registerForNotifications } from '@/lib/firebase/messaging';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create the Firebase user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();

      // 2. Assign role via invite code (server sets custom claim)
      const setRoleRes = await fetch('/api/auth/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, inviteCode }),
      });

      if (!setRoleRes.ok) {
        const { error: msg } = await setRoleRes.json();
        throw new Error(msg || 'Invalid invite code');
      }

      const { role } = await setRoleRes.json();

      // 3. Force a refresh to pull the new claim before minting the session.
      const freshToken = await cred.user.getIdToken(true);

      // 4. Exchange fresh ID token for a session cookie
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
    <main className="flex min-h-screen items-center justify-center bg-[#1a231d] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1e2923] bg-[#121815] p-8 shadow-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00D68F] font-bold text-[#041a12] text-xl shadow-md">
            🎓
          </div>
          <h1 className="text-2xl font-bold text-white">Create Campus Account</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your institutional details and department invite code
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Campus Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@campus.edu"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-white focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-white focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Institutional Invite Code
            </label>
            <input
              type="text"
              required
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="e.g. STUDENT2026, TPOADMIN2026, RECRUIT2026"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-white focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#00D68F] py-3 text-xs font-bold text-[#041a12] hover:bg-[#00e89b] disabled:opacity-50 transition-colors shadow-card"
          >
            {loading ? 'Setting up Profile...' : 'Complete Registration'}
          </button>

          <p className="pt-2 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-[#00D68F] hover:text-[#00D68F]">
              Log in here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
