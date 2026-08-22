'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useNavProgress } from '@/components/ui/NavProgress';
import {
  Gauge,
  Route,
  Users,
  ScanText,
  Settings,
  LifeBuoy,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface SidebarProps {
  userProfile: {
    name: string;
    role: string;
    department?: string;
    targetRole?: string;
  };
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function getNavItems(role: string): NavItem[] {
  const r = role.toLowerCase();
  if (r === 'student')
    return [
      { href: '/student/dashboard', label: 'Dashboard', icon: <Gauge className="h-[18px] w-[18px]" strokeWidth={1.8} /> },
      { href: '/student/journeys', label: 'Skill Journeys', icon: <Route className="h-[18px] w-[18px]" strokeWidth={1.8} /> },
      { href: '/campus/peers', label: 'Peer Hub', icon: <Users className="h-[18px] w-[18px]" strokeWidth={1.8} /> },
      { href: '/student/upload', label: 'Resume Analyzer', icon: <ScanText className="h-[18px] w-[18px]" strokeWidth={1.8} /> },
      { href: '/settings', label: 'Settings', icon: <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} /> },
    ];
  if (r === 'tpo')
    return [
      { href: '/tpo/dashboard', label: 'Dashboard', icon: <Gauge className="h-[18px] w-[18px]" strokeWidth={1.8} /> },
      { href: '/campus/peers', label: 'Student Directory', icon: <Users className="h-[18px] w-[18px]" strokeWidth={1.8} /> },
      { href: '/settings', label: 'Settings', icon: <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} /> },
    ];
  return [];
}

export default function Sidebar({ userProfile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navItems = getNavItems(userProfile.role);
  const { start: startProgress } = useNavProgress();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      // Imported on demand so the auth SDK is only loaded when the user
      // actually signs out, keeping it out of the dashboard bundle.
      const [{ signOut }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase/client'),
      ]);
      await signOut(auth);
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/login');
    } catch {
      setLoggingOut(false);
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-ink-deep text-sidebar-text">
      {/* Brand */}
      <div className="border-b border-ink-edge px-5 py-5">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-ink-edge bg-white font-mono text-sm font-semibold text-ink shadow-hairline">
            CC
            <span
              aria-hidden
              className="absolute -right-[3px] -top-[3px] h-2 w-2 border-2 border-ink-deep bg-instrument"
            />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold leading-tight text-white">
              Campus Career Copilot
            </div>
            <div className="mt-0.5 font-mono text-xxs font-medium uppercase tracking-[0.14em] text-[#7E90AE]">
              Instrument desk
            </div>
          </div>
        </Link>
      </div>

      {/* Operator */}
      <div className="px-4 pt-4">
        <div className="rounded-lg border border-ink-edge bg-[#0C1526] px-3 py-2.5">
          <div className="font-mono text-xxs font-medium uppercase tracking-[0.14em] text-[#7E90AE]">
            Operator
          </div>
          <div className="mt-1 text-sm font-bold capitalize text-white">
            {userProfile.role}
          </div>
        </div>
      </div>

      {/* Instruments */}
      <nav className="scrollbar-thin mt-4 flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label="Primary">
        {navItems.map((item, i) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/settings' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (!isActive) startProgress();
                setMobileOpen(false);
              }}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors duration-150',
                isActive
                  ? 'bg-sidebar-hover text-white'
                  : 'text-sidebar-text hover:bg-sidebar-hover/60 hover:text-white'
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-sm bg-instrument"
                />
              )}
              <span className={cn(isActive ? 'text-white' : 'text-[#8CA0C0] group-hover:text-white')}>
                {item.icon}
              </span>
              {item.label}
              <span className="ml-auto font-mono text-xxs text-[#54688C]">
                {String(i + 1).padStart(2, '0')}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Session */}
      <div className="border-t border-ink-edge px-3 py-4">
        <div className="mb-2 rounded-lg border border-ink-edge bg-[#0C1526] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-edge bg-white font-mono text-sm font-semibold text-ink">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-white">
                {userProfile.name}
              </div>
              <div className="truncate text-[11px] text-[#8CA0C0]">
                {userProfile.targetRole || userProfile.department || userProfile.role}
              </div>
            </div>
          </div>
        </div>
        <Link
          href="/about"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-white"
        >
          <LifeBuoy className="h-[18px] w-[18px]" strokeWidth={1.8} /> Support
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-sidebar-text transition-colors hover:bg-[#3A1B15] hover:text-[#FFB4A6] disabled:opacity-50"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />
          {loggingOut ? 'Signing out…' : 'Log out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 z-30 hidden w-[284px] flex-col border-r border-ink-edge md:flex">
        {sidebarContent}
      </aside>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-lg border border-ink-line-strong bg-white text-ink shadow-lift transition-colors hover:border-ink-soft md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" strokeWidth={2} />
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-ink-deep/55 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative h-full w-[286px] shadow-pop">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-md text-sidebar-text transition-colors hover:bg-sidebar-hover hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
