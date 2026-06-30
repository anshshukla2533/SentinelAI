import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { AlertCircle, ArrowRight, Bell, ChevronRight, Grid2x2, Server, Shield, Sparkles, Terminal } from 'lucide-react';
import AgentInstall from './AgentInstall';
import { API_BASE_URL, apiRequest } from './api';
import { useAuth } from './auth';

type MetricSummary = {
  id: number;
  service_name: string;
  cpu: number;
  memory: number;
  disk?: number | null;
  network_sent?: number | null;
  network_recv?: number | null;
  load_average?: number | null;
  uptime?: number | null;
  hostname?: string | null;
  operating_system?: string | null;
  created_at?: string;
};

type ServiceSummary = {
  id: number;
  name: string;
  hostname?: string | null;
  process_name?: string | null;
  status: string;
  created_at?: string;
  last_seen_at?: string;
  latest_metric?: MetricSummary | null;
  open_incidents_count: number;
};

export default function DashboardApp() {
  return (
    <div className="min-h-screen bg-[#070914] text-white">
      <DashboardHeader />
      <DashboardNav />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="add-machine" element={<AddMachinePage />} />
          <Route path="incidents" element={<FuturePage title="Incidents" text="Incident triage and status controls arrive in Step 3." icon={<Bell className="h-5 w-5" />} />} />
          <Route path="reports" element={<FuturePage title="Reports" text="Risk report history and failure predictions arrive in Step 3." icon={<AlertCircle className="h-5 w-5" />} />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-white/10 bg-[#070914]/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/dashboard/overview" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-[#07111f] shadow-lg shadow-cyan-500/25">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-semibold leading-none">SentinelAI</div>
            <div className="text-xs text-slate-400">{user?.email ?? 'Private dashboard'}</div>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-[#07111f] transition hover:bg-cyan-100"
        >
          Sign out
        </button>
      </nav>
    </header>
  );
}

function DashboardNav() {
  const navItems = [
    { to: '/dashboard/overview', label: 'Overview', icon: <Grid2x2 className="h-4 w-4" /> },
    { to: '/dashboard/incidents', label: 'Incidents', icon: <Bell className="h-4 w-4" /> },
    { to: '/dashboard/reports', label: 'Reports', icon: <AlertCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="border-b border-white/10 bg-white/[0.03]">
      <div className="mx-auto flex max-w-6xl gap-2 px-6 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                isActive
                  ? 'bg-cyan-400 text-[#06111f] shadow-lg shadow-cyan-500/20'
                  : 'border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]',
              ].join(' ')
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function OverviewPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadServices = async () => {
      try {
        const result = await apiRequest<ServiceSummary[]>('/services');
        if (!active) {
          return;
        }
        setServices(result);
        setError('');
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Failed to load services');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadServices();
    const intervalId = window.setInterval(loadServices, 12000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const machineCount = services.length;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Overview
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight">Your monitored machines</h1>
            <p className="mt-4 text-slate-300">
              {machineCount > 0
                ? 'This view updates every 12 seconds with the latest health and metric snapshots.'
                : 'No machines yet. Install the agent to get started, and your first machine will appear automatically.'}
            </p>
          </div>

          <Link
            to="/dashboard/add-machine"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-[#06111f] shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300"
          >
            Add a machine
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {error ? <InlineError message={error} /> : null}

      {loading ? (
        <LoadingState />
      ) : machineCount === 0 ? (
        <EmptyState
          title="No machines yet"
          text="Install the agent on a server, VM, or laptop. Once it posts its first telemetry packet, the machine will appear here."
          cta={<Link to="/dashboard/add-machine" className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-[#06111f] transition hover:bg-cyan-300">Add a machine <ArrowRight className="h-4 w-4" /></Link>}
        >
          <div className="mt-6">
            {user ? <AgentInstall apiBaseUrl={API_BASE_URL} registrationToken={user.registration_token} /> : null}
          </div>
        </EmptyState>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {services.map((service) => (
            <MachineCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}

function AddMachinePage() {
  const { user } = useAuth();

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/20">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          <Terminal className="h-3.5 w-3.5" />
          Add a machine
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight">Install the agent with your token</h1>
        <p className="mt-4 text-slate-300">
          The command below already includes your personal registration token, so the first telemetry write creates
          your machine automatically.
        </p>

        <div className="mt-8 space-y-4">
          <Step text="Copy the install command" />
          <Step text="Run it on the machine you want to monitor" />
          <Step text="Wait for the first telemetry packet to register the machine" />
        </div>
      </section>

      <section className="rounded-3xl border border-cyan-300/20 bg-[#07111f] p-6 shadow-2xl shadow-cyan-950/20 md:p-8">
        {user ? (
          <AgentInstall apiBaseUrl={API_BASE_URL} registrationToken={user.registration_token} />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-slate-300">Loading your registration token...</div>
        )}
      </section>
    </div>
  );
}

function FuturePage({ title, text, icon }: { title: string; text: string; icon: ReactNode }) {
  return (
    <EmptyState title={title} text={text} icon={icon}>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <MiniStat label="Status" value="Coming next" />
        <MiniStat label="Scope" value="User-specific" />
      </div>
    </EmptyState>
  );
}

function MachineCard({ service }: { service: ServiceSummary }) {
  const metric = service.latest_metric;

  return (
    <div className="group rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{service.name}</h2>
            <StatusBadge status={service.status} />
          </div>
          <p className="mt-2 text-sm text-slate-400">{service.hostname ?? 'No hostname yet'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-cyan-200">
          <Server className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <StatCard label="CPU" value={formatPercent(metric?.cpu)} />
        <StatCard label="Memory" value={formatPercent(metric?.memory)} />
        <StatCard label="Disk" value={formatPercent(metric?.disk)} />
        <StatCard label="Open incidents" value={String(service.open_incidents_count)} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-slate-400">
        <span>Latest update {formatRelativeTime(service.last_seen_at ?? service.created_at)}</span>
        <span className="inline-flex items-center gap-2 text-cyan-200">
          View details
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let tone = '';

  switch (status) {
    case 'healthy':
      tone = 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100';
      break;
    case 'warning':
      tone = 'border-amber-300/30 bg-amber-300/10 text-amber-100';
      break;
    case 'critical':
      tone = 'border-red-300/30 bg-red-300/10 text-red-100';
      break;
    default:
      tone = 'border-white/15 bg-white/10 text-slate-100';
      break;
  }

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tone}`}>{status}</span>;
}

function EmptyState({
  title,
  text,
  cta,
  icon,
  children,
}: {
  title: string;
  text: string;
  cta?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/20">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-200">{icon ?? <Sparkles className="h-5 w-5" />}</div>
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight">{title}</h2>
          <p className="mt-3 text-slate-300">{text}</p>
          {cta ? <div className="mt-5">{cta}</div> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <PlaceholderCard />
      <PlaceholderCard />
    </div>
  );
}

function PlaceholderCard() {
  return <div className="h-52 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />;
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
      {message}
    </div>
  );
}

function Step({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="rounded-full bg-cyan-400/15 p-2 text-cyan-200">
        <ArrowRight className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium text-slate-200">{text}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#07111f] p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

function formatPercent(value?: number | null) {
  if (value === undefined || value === null) {
    return 'N/A';
  }
  return `${Math.round(value)}%`;
}

function formatRelativeTime(value?: string | null) {
  if (!value) {
    return 'just now';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
