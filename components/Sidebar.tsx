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

function IconDashboard() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>; }
function IconJourneys() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>; }
function IconPeers() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function IconResume() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>; }
function IconSettings() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function IconCandidates() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></svg>; }
function IconPostJd() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function IconSupport() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>; }
function IconLogout() { return <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>; }
function IconMenu() { return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>; }
function IconClose() { return <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>; }

interface NavItem { href: string; label: string; icon: React.ReactNode; }

function getNavItems(role: string): NavItem[] {
  const r = role.toLowerCase();
  if (r === 'student') return [
    { href: '/student/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { href: '/student/journeys', label: 'Skill Journeys', icon: <IconJourneys /> },
    { href: '/campus/peers', label: 'Peer Hub', icon: <IconPeers /> },
    { href: '/student/upload', label: 'Resume Analyzer', icon: <IconResume /> },
    { href: '/settings', label: 'Settings', icon: <IconSettings /> },
  ];
  if (r === 'tpo') return [
    { href: '/tpo/dashboard', label: 'Dashboard', icon: <IconDashboard /> },
    { href: '/campus/peers', label: 'Student Directory', icon: <IconPeers /> },
    { href: '/settings', label: 'Settings', icon: <IconSettings /> },
  ];
  return [
    { href: '/recruiter/candidates', label: 'Matched Candidates', icon: <IconCandidates /> },
    { href: '/recruiter/post-jd', label: 'Post JD', icon: <IconPostJd /> },
    { href: '/campus/peers', label: 'Campus Talent Pool', icon: <IconPeers /> },
    { href: '/settings', label: 'Settings', icon: <IconSettings /> },
  ];
}

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
    <div className="flex h-full flex-col bg-sidebar-bg text-sidebar-text dispatch-grid">
      <div className="border-b border-sidebar-border px-5 py-5">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5c542] text-sm font-black text-[#111827] shadow-[0_12px_24px_rgba(245,197,66,.18)]">
            CC
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#2fbf91] ring-2 ring-[#10182b]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-black leading-tight text-[#fffdf8]">Campus Career</div>
            <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f5c542]">Copilot Desk</div>
          </div>
        </Link>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-xl border border-[#263452] bg-[#0c1426]/70 p-3">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8fa2c3]">Active Role</div>
          <div className="mt-1 text-sm font-black capitalize text-[#fffdf8]">{userProfile.role}</div>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/settings' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-sidebar-active text-sidebar-text-active shadow-[0_14px_30px_rgba(245,197,66,.22)]'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-[#fffdf8]'
              }`}
            >
              <span className={isActive ? 'text-[#111827]' : 'text-[#8fa2c3] group-hover:text-[#f5c542]'}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="mb-2 rounded-xl border border-[#263452] bg-[#0c1426]/70 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#eaf2ff] text-sm font-black text-[#14213d]">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-black text-[#fffdf8]">{userProfile.name}</div>
              <div className="truncate text-[11px] font-semibold text-[#8fa2c3]">{userProfile.targetRole || userProfile.department || userProfile.role}</div>
            </div>
          </div>
        </div>
        <Link href="/about" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-bold text-[#c9d4e6] hover:bg-sidebar-hover hover:text-[#fffdf8]">
          <IconSupport /> Support
        </Link>
        <button onClick={handleLogout} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-bold text-[#c9d4e6] transition-colors hover:bg-[#3a1b22] hover:text-[#ffb4aa] disabled:opacity-50">
          <IconLogout /> {loggingOut ? 'Signing out...' : 'Log out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 z-30 hidden w-[284px] flex-col border-r border-[#263452] md:flex">
        {sidebarContent}
      </aside>
      <button onClick={() => setMobileOpen(true)} className="fixed left-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-[#d6deea] bg-[#fffdf8] text-[#14213d] shadow-elevated md:hidden" aria-label="Open menu">
        <IconMenu />
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-[#10182b]/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[286px] shadow-2xl">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-[#c9d4e6] hover:bg-[#192643]" aria-label="Close menu">
              <IconClose />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}