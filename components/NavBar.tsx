'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useState } from 'react';

interface NavBarProps {
  label: 'Student' | 'TPO' | 'Recruiter' | string;
}

export default function NavBar({ label }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await signOut(auth);
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/login');
    } catch {
      setLoggingOut(false);
    }
  }

  const role = label.toLowerCase();

  const navLinks = [
    ...(role === 'student'
      ? [
          { href: '/student/dashboard', label: 'My Dashboard' },
          { href: '/student/journeys', label: 'Skill Journeys' },
          { href: '/campus/peers', label: 'Peer Progress Hub' },
          { href: '/student/upload', label: 'Resume Analyzer' },
        ]
      : []),
    ...(role === 'tpo'
      ? [
          { href: '/tpo/dashboard', label: 'Cohort Overview' },
          { href: '/campus/peers', label: 'Student Directory' },
          { href: '/about', label: 'Visiting Companies' },
        ]
      : []),
    ...(role === 'recruiter'
      ? [
          { href: '/recruiter/candidates', label: 'Matched Candidates' },
          { href: '/recruiter/post-jd', label: 'Post JD' },
          { href: '/campus/peers', label: 'Campus Talent Pool' },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-30 mb-8 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-subtle">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Campus Logo & Institution Brand */}
        <div className="flex items-center gap-3">
          <Link href={navLinks[0]?.href || '/'} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-800 to-indigo-600 font-bold text-white shadow-sm transition-transform group-hover:scale-105">
              🎓
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 leading-tight flex items-center gap-1.5">
                Campus Career Copilot
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  Campus Portal
                </span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Placement & Skill Readiness Cell</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Role badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="capitalize font-semibold text-slate-800">{label}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-50"
          >
            {loggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-100 px-4 py-2 gap-2 bg-slate-50/50">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
