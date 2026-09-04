import { Activity, AlertTriangle, ArrowRight, CheckCircle, Cpu, FileText, Monitor, Server, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AlertRow } from '../../components/alerts';
import { Card, EmptyStateMini } from '../../components/common';
import { DeviceTable } from '../../components/device';
import { useAuth } from '../../auth';
import { useWorkspaceData } from '../../hooks/useWorkspaceData';

function isOnline(lastSeen?: string | null) {
  return Boolean(lastSeen && Date.now() - new Date(lastSeen).getTime() <= 30000);
}

function formatDate() {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
}

function LiveMetric({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">{icon}</div>
        <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
      </div>
      <div className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{label}</div>
      <div className="mt-1 text-3xl font-black tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-white/55">{detail}</div>
    </div>
  );
}

function StatusLine({ label, value, tone = 'bg-emerald-400' }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`h-2 w-2 shrink-0 rounded-full ${tone}`} />
        <span className="truncate text-sm text-white/75">{label}</span>
      </div>
      <span className="shrink-0 text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

function QuickAction({ to, icon, label, detail }: { to: string; icon: React.ReactNode; label: string; detail: string }) {
  return (
    <Link to={to} className="group rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-0.5 hover:border-violet-300/30 hover:bg-white/[0.08]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80">{icon}</div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="font-semibold text-white">{label}</span>
        <ArrowRight className="h-4 w-4 text-white/35 transition group-hover:translate-x-1 group-hover:text-white" />
      </div>
      <div className="mt-1 text-xs text-white/45">{detail}</div>
    </Link>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const data = useWorkspaceData();
  const machines = data.machines;
  const metrics = data.metrics;
  const onlineCount = machines.filter((machine) => isOnline(machine.last_seen_at)).length;
  const criticalCount = data.incidents.filter((incident) => incident.severity === 'critical' && incident.status !== 'resolved').length;
  const averageCpu = metrics.length ? Math.round(metrics.reduce((total, metric) => total + metric.cpu, 0) / metrics.length) : null;
  const healthyPercent = machines.length ? Math.round((onlineCount / machines.length) * 100) : 0;
  const userName = user?.email?.split('@')[0] || 'Operator';

  return (
    <div className="space-y-5">
      {data.error ? <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">{data.error}</div> : null}

      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="text-sm text-white/60">Good evening,</div>
          <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-5xl">{userName}</h1>
          <p className="mt-2 text-sm text-white/55">Live infrastructure signals from your workspace.</p>
        </div>
        <div className="text-left xl:text-right">
          <div className="text-sm text-white/55">{formatDate()}</div>
          <div className="mt-1 text-2xl font-black">{new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date())}</div>
          <div className="mt-1 text-xs italic text-white/35">Your infrastructure. Our intelligence.</div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <LiveMetric icon={<Monitor className="h-6 w-6 text-sky-200" />} label="Online devices" value={String(onlineCount)} detail={`${onlineCount} active now`} tone="border-sky-400/50 bg-sky-500/15" />
        <LiveMetric icon={<Server className="h-6 w-6 text-white/75" />} label="Connected devices" value={String(machines.length)} detail={`${machines.length} registered`} tone="border-white/15 bg-white/[0.06]" />
        <LiveMetric icon={<ShieldAlert className="h-6 w-6 text-fuchsia-200" />} label="Critical alerts" value={String(criticalCount)} detail={criticalCount ? 'Requires attention' : 'No active critical alerts'} tone="border-fuchsia-400/50 bg-fuchsia-500/15" />
        <LiveMetric icon={<Cpu className="h-6 w-6 text-emerald-200" />} label="Average CPU" value={averageCpu === null ? '--' : `${averageCpu}%`} detail={metrics.length ? `${metrics.length} live samples` : 'Waiting for telemetry'} tone="border-emerald-400/50 bg-emerald-500/15" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card title="System status" subtitle="Live state from your connected machines">
          <div>
            <StatusLine label="Monitoring service" value={data.error ? 'Unavailable' : 'Running'} tone={data.error ? 'bg-amber-400' : 'bg-emerald-400'} />
            <StatusLine label="Device registration" value={`${machines.length} connected`} />
            <StatusLine label="Telemetry samples" value={`${metrics.length} received`} />
            <StatusLine label="Analysis reports" value={`${data.reports.length} ready`} />
            <StatusLine label="Connected device ratio" value={`${healthyPercent}%`} tone={healthyPercent >= 80 ? 'bg-emerald-400' : 'bg-amber-400'} />
          </div>
        </Card>

        <Card title="Device overview" subtitle="Current fleet distribution">
          <div className="flex items-center gap-5">
            <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(#34d399 0 ${healthyPercent}%, #64748b ${healthyPercent}% 100%)` }}>
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-[#0b1224]">
                <span className="text-3xl font-black">{machines.length}</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/45">Total</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-white/70"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Online</span><span>{onlineCount}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-2 text-white/70"><span className="h-2.5 w-2.5 rounded-full bg-sky-400" />Connected</span><span>{machines.length}</span></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card title="Quick actions" subtitle="Navigate to live workspace data">
          <div className="grid gap-3 sm:grid-cols-2">
            <QuickAction to="/dashboard/devices" icon={<Monitor className="h-5 w-5" />} label="View devices" detail="Inspect registered machines" />
            <QuickAction to="/dashboard/monitoring" icon={<Activity className="h-5 w-5" />} label="Open monitoring" detail="Review live resource signals" />
            <QuickAction to="/dashboard/logs" icon={<FileText className="h-5 w-5" />} label="View logs" detail="Check collected system logs" />
            <QuickAction to="/dashboard/alerts" icon={<AlertTriangle className="h-5 w-5" />} label="Review alerts" detail="Investigate active incidents" />
          </div>
        </Card>

        <Card title="Recent alerts" subtitle="Latest incidents from telemetry">
          <div className="space-y-3">
            {data.incidents.slice(0, 4).map((incident) => <AlertRow key={incident.id} title={incident.title} detail={`${incident.service_name} - ${incident.severity}`} tone={incident.severity} />)}
            {!data.incidents.length ? <EmptyStateMini text="No alerts received from your machines." /> : null}
          </div>
        </Card>
      </div>

      <Card title="Recent devices" subtitle="Live services reported by your machines">
        {data.services.length ? <DeviceTable services={data.services.slice(0, 6)} /> : <EmptyStateMini text="No telemetry yet. Start an agent to see real devices here." />}
      </Card>

      {!machines.length ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-4 text-sm text-white/55">
          <CheckCircle className="mr-2 inline h-4 w-4 text-white/35" /> Your dashboard is ready and waiting for its first machine signal.
        </div>
      ) : null}
    </div>
  );
}
