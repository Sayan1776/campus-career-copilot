'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { registerForNotifications } from '@/lib/firebase/messaging';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const tokenResult = await cred.user.getIdTokenResult();
      const role = tokenResult.claims.role as string | undefined;
      await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) });
      registerForNotifications();
      router.push(role ? `/${role}/dashboard` : '/about');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 dispatch-grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="flex flex-col justify-between bg-[#10182b] p-8 text-[#fffdf8] lg:p-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5c542] text-sm font-black text-[#111827]">CC</div>
          <div className="text-sm font-black">Campus Career Copilot</div>
        </Link>
        <div className="max-w-xl py-20">
          <h1 className="text-[clamp(3rem,7vw,5.8rem)] font-black leading-[0.88] tracking-[-0.04em]">Enter the placement desk.</h1>
          <p className="mt-7 text-lg leading-8 text-[#c9d4e6]">Resume intelligence, cohort interventions, and recruiter matching all open from the same role-aware command surface.</p>
        </div>
        <div className="grid gap-3 text-xs font-bold text-[#c9d4e6] sm:grid-cols-3">
          <span className="rounded-xl border border-[#263452] p-3">Student readiness</span>
          <span className="rounded-xl border border-[#263452] p-3">TPO analytics</span>
          <span className="rounded-xl border border-[#263452] p-3">Recruiter match</span>
        </div>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="ops-panel w-full max-w-md p-7 sm:p-8">
          <div className="mb-7">
            <div className="mb-3 inline-flex rounded-full border border-[#d6deea] bg-[#eef5ff] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#65718b]">Secure portal</div>
            <h2 className="text-3xl font-black tracking-[-0.03em] text-[#14213d]">Sign in</h2>
            <p className="mt-2 text-sm text-[#65718b]">Use your campus account to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="form-label">Campus Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@campus.edu" className="form-input" /></div>
            <div><label className="form-label">Password</label><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="form-input" /></div>
            {error && <div className="zebra-alert rounded-xl border border-[#ffb3a8] bg-[#fff0ed] p-3 text-sm font-bold text-[#9f2e21]">{error}</div>}
            <button type="submit" disabled={loading} className="ops-button-primary w-full px-5 py-3 text-sm disabled:opacity-50">{loading ? 'Signing in...' : 'Sign in to portal'}</button>
            <p className="pt-2 text-center text-sm text-[#65718b]">Need an institutional account? <Link href="/signup" className="font-black text-[#9a6b00] hover:text-[#14213d]">Sign up with invite code</Link></p>
          </form>
        </div>
      </section>
    </main>
  );
}