'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useState } from 'react';

interface SidebarProps {
  userProfile: {
    name: string;
    role: string;
    department?: string;
    targetRole?: string;
  };
}

/* ─── SVG icon components ─── */
function IconDashboard() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function IconJourneys() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  );
}

function IconPeers() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function IconResume() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconCandidates() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function IconPostJd() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconSupport() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/* ─── Navigation config ─── */
interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function getNavItems(role: string): NavItem[] {
  const r = role.toLowerCase();

  if (r === 'student') {
    return [
      { href: '/student/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
      { href: '/student/journeys', label: 'Skill Journeys', icon: <IconJourneys /> },
      { href: '/campus/peers', label: 'Peer Hub', icon: <IconPeers /> },
      { href: '/student/upload', label: 'Resume Analyzer', icon: <IconResume /> },
      { href: '/settings', label: 'Settings', icon: <IconSettings /> },
    ];
  }

  if (r === 'tpo') {
    return [
      { href: '/tpo/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
      { href: '/campus/peers', label: 'Student Directory', icon: <IconPeers /> },
      { href: '/settings', label: 'Settings', icon: <IconSettings /> },
    ];
  }

  // recruiter
  return [
    { href: '/recruiter/candidates', label: 'Matched Candidates', icon: <IconCandidates /> },
    { href: '/recruiter/post-jd', label: 'Post JD', icon: <IconPostJd /> },
    { href: '/campus/peers', label: 'Campus Talent Pool', icon: <IconPeers /> },
    { href: '/settings', label: 'Settings', icon: <IconSettings /> },
  ];
}

/* ─── Sidebar component ─── */
export default function Sidebar({ userProfile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = getNavItems(userProfile.role);

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

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar-bg text-sidebar-text">
      {/* ─── Logo ─── */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border relative overflow-hidden">
        <div className="absolute inset-0 bg-[#00D68F]/5 blur-xl"></div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D68F] text-[#041a12] text-sm font-bold shadow-[0_0_10px_rgba(0,214,143,0.2)] relative z-10">
          🎓
        </div>
        <div className="flex flex-col relative z-10">
          <span className="text-[13px] font-bold text-white leading-tight tracking-tight">
            Campus Career Copilot
          </span>
          <span className="text-[10px] text-[#00D68F] font-semibold tracking-wide uppercase">
            Campus Portal
          </span>
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/settings' && pathname.startsWith(item.href + '/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-sidebar-active text-sidebar-text-active shadow-[0_0_10px_rgba(0,214,143,0.15)]'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-sidebar-text-active' : 'text-slate-500'}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ─── Bottom: User profile + actions ─── */}
      <div className="mt-auto border-t border-sidebar-border px-3 py-4 space-y-1">
        {/* User info */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-sidebar-hover transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e2923] border border-[#233028] text-[13px] font-bold text-white flex-shrink-0">
            {userProfile.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-white truncate">
              {userProfile.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {userProfile.targetRole || userProfile.department || userProfile.role}
            </div>
          </div>
        </div>

        {/* Support */}
        <Link
          href="/about"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-400 hover:bg-sidebar-hover hover:text-slate-200 transition-colors"
        >
          <IconSupport />
          Support
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors disabled:opacity-50"
        >
          <IconLogout />
          {loggingOut ? 'Signing out...' : 'Log out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Desktop sidebar ─── */}
      <aside className="hidden md:flex md:w-[260px] md:flex-col md:fixed md:inset-y-0 z-30 border-r border-slate-800/50">
        {sidebarContent}
      </aside>

      {/* ─── Mobile hamburger button ─── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 flex md:hidden h-10 w-10 items-center justify-center rounded-xl bg-white shadow-elevated border border-slate-200 text-slate-700"
        aria-label="Open menu"
      >
        <IconMenu />
      </button>

      {/* ─── Mobile overlay sidebar ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="relative w-[280px] h-full shadow-2xl animate-slide-in">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close menu"
            >
              <IconClose />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
