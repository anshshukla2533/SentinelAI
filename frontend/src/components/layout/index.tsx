import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { Activity, Bell, FileText, LayoutDashboard, Monitor, Settings, Search } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth';
import { BrandMark } from '../common';

export function TopBar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const title = useMemo(() => {
    if (location.pathname.endsWith('/devices')) return 'Devices';
    if (location.pathname.endsWith('/monitoring')) return 'Monitoring';
    if (location.pathname.endsWith('/logs')) return 'Logs';
    if (location.pathname.endsWith('/alerts')) return 'Alerts';
    if (location.pathname.endsWith('/settings')) return 'Settings';
    return 'Dashboard';
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050816]/85 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-4 sm:px-6 xl:px-7">
        <div className="hidden xl:block">
          <div className="text-3xl font-black tracking-tight">{title}</div>
        </div>
        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          <div className="hidden w-full max-w-xl items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/55 lg:flex">
            <Search className="h-4 w-4" />
            Search devices, logs, alerts...
          </div>
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
            <Bell className="h-4 w-4" />
          </button>
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80">
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-black">
              {user?.email?.slice(0, 1).toUpperCase() ?? 'A'}
            </span>
            {user?.email ?? 'Admin'}
          </button>
        </div>
      </div>

      <div className="xl:hidden">
        <div className="flex gap-2 overflow-x-auto px-4 pb-4">
          <MobileTab to="/dashboard" label="Dashboard" />
          <MobileTab to="/dashboard/devices" label="Devices" />
          <MobileTab to="/dashboard/monitoring" label="Monitoring" />
          <MobileTab to="/dashboard/logs" label="Logs" />
          <MobileTab to="/dashboard/alerts" label="Alerts" />
          <MobileTab to="/dashboard/settings" label="Settings" />
        </div>
      </div>
    </header>
  );
}

export function MobileTab({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70">
      {label}
    </Link>
  );
}

export function SidebarLink({ to, icon, label, end }: { to: string; icon: ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'mb-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
          isActive ? 'bg-gradient-to-r from-violet-500/30 to-fuchsia-500/20 text-white shadow-lg shadow-violet-950/20' : 'text-white/68 hover:bg-white/5 hover:text-white',
        ].join(' ')
      }
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white/80">{icon}</span>
      {label}
    </NavLink>
  );
}

export function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="fixed inset-y-0 left-0 hidden w-[18rem] border-r border-white/10 bg-[#081020] xl:flex xl:flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <BrandMark />
          <div>
            <div className="text-xl font-black">Sentinel AI</div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/45">AI-Powered Threat Detection</div>
          </div>
        </div>

        <div className="flex-1 px-3 py-4">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" end />
          <SidebarLink to="/dashboard/devices" icon={<Monitor className="h-4 w-4" />} label="Devices" />
          <SidebarLink to="/dashboard/monitoring" icon={<Activity className="h-4 w-4" />} label="Monitoring" />
          <SidebarLink to="/dashboard/logs" icon={<FileText className="h-4 w-4" />} label="Logs" />
          <SidebarLink to="/dashboard/alerts" icon={<Bell className="h-4 w-4" />} label="Alerts" />
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">{user?.email ?? 'Admin'}</div>
            <div className="mt-1 text-xs text-white/50">{user?.registration_token ?? 'Token ready after login'}</div>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="xl:pl-[18rem]">
        <TopBar />
        <main className="px-4 py-5 sm:px-6 xl:px-7">
          <div className="mx-auto max-w-[1420px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

