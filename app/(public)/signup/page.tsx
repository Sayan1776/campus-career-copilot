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
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken();
      const setRoleRes = await fetch('/api/auth/set-role', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken, inviteCode }) });
      if (!setRoleRes.ok) {
        const { error: msg } = await setRoleRes.json();
        throw new Error(msg || 'Invalid invite code');
      }
      const { role } = await setRoleRes.json();
      const freshToken = await cred.user.getIdToken(true);
      await fetch('/api/auth/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: freshToken }) });
      registerForNotifications();
      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 dispatch-grid lg:grid-cols-[.95fr_1.05fr]">
      <section className="flex items-center justify-center p-5 sm:p-8">
        <div className="ops-panel w-full max-w-md p-7 sm:p-8">
          <div className="mb-7">
            <div className="mb-3 inline-flex rounded-full border border-[#d6deea] bg-[#fff7d7] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#9a6b00]">Invite required</div>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-[#14213d]">Create campus account</h1>
            <p className="mt-2 text-sm text-[#65718b]">Register with your institutional role code.</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
            <div><label className="form-label">Campus Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="student@campus.edu" className="form-input" /></div>
            <div><label className="form-label">Password</label><input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" className="form-input" /></div>
            <div><label className="form-label">Institutional Invite Code</label><input type="text" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="STUDENT2026, TPOADMIN2026, RECRUIT2026" className="form-input" /></div>
            {error && <div className="zebra-alert rounded-xl border border-[#ffb3a8] bg-[#fff0ed] p-3 text-sm font-bold text-[#9f2e21]">{error}</div>}
            <button type="submit" disabled={loading} className="ops-button-signal w-full px-5 py-3 text-sm disabled:opacity-50">{loading ? 'Setting up profile...' : 'Complete registration'}</button>
            <p className="pt-2 text-center text-sm text-[#65718b]">Already registered? <Link href="/login" className="font-black text-[#9a6b00] hover:text-[#14213d]">Log in here</Link></p>
          </form>
        </div>
      </section>
      <section className="flex flex-col justify-between bg-[#10182b] p-8 text-[#fffdf8] lg:p-12">
        <Link href="/" className="flex items-center gap-3 self-start"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5c542] text-sm font-black text-[#111827]">CC</div><span className="text-sm font-black">Campus Career Copilot</span></Link>
        <div className="max-w-xl py-20"><h2 className="text-[clamp(3rem,7vw,5.8rem)] font-black leading-[0.88] tracking-[-0.04em]">Join the role queue.</h2><p className="mt-7 text-lg leading-8 text-[#c9d4e6]">Students, TPOs, and recruiters enter different workflows from one verified campus identity.</p></div>
        <div className="rounded-2xl border border-[#263452] bg-[#0c1426]/80 p-5"><div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#f5c542]">Code routes</div><div className="mt-3 grid gap-2 text-sm font-bold text-[#c9d4e6] sm:grid-cols-3"><span>Student</span><span>TPO</span><span>Recruiter</span></div></div>
      </section>
    </main>
  );
}