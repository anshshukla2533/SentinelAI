import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  ChevronRight,
  Grid2x2,
  Gauge,
  LineChart as LineChartIcon,
  Server,
  Shield,
  Sparkles,
  Terminal,
  AlertTriangle,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AgentInstall from './AgentInstall';
import { API_BASE_URL, apiRequest } from './api';
import { useAuth } from './auth';
import { Link, NavLink, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';

type MetricRecord = {
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
  created_at?: string | null;
};

type ServiceSummary = {
  id: number;
  name: string;
  hostname?: string | null;
  process_name?: string | null;
  status: string;
  created_at?: string | null;
  last_seen_at?: string | null;
  latest_metric?: MetricRecord | null;
  open_incidents_count: number;
};

type LogRecord = {
  id: number;
  service_name: string;
  hostname?: string | null;
  level: string;
  message: string;
  source?: string | null;
  created_at?: string | null;
};

type IncidentRecord = {
  id: number;
  service_id?: number | null;
  service_name: string;
  title: string;
  severity: string;
  status: string;
  created_at?: string | null;
  resolved_at?: string | null;
};

type ReportRecord = {
  id: number;
  service_name: string;
  hostname?: string | null;
  risk_level: string;
  risk_score: number;
  summary: string;
  recommendation: string;
  predicted_failure?: string | null;
  likely_failure_at?: string | null;
  time_to_failure?: string | null;
  prevention_steps?: string | null;
  notification_target?: string | null;
  notification_sent: number;
  notification_error?: string | null;
  created_at?: string | null;
};

type IncidentContext = {
  incident: IncidentRecord;
  window_start: string;
  window_end: string;
  metrics_count: number;
  logs_count: number;
  metrics: MetricRecord[];
  logs: LogRecord[];
};

type WindowKey = '1h' | '24h' | '7d';

const WINDOW_HOURS: Record<WindowKey, number> = {
  '1h': 1,
  '24h': 24,
  '7d': 24 * 7,
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
          <Route path="machines/:serviceId" element={<MachineDetailPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="incidents/:incidentId" element={<IncidentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
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
              {services.length > 0
                ? 'This view refreshes every 12 seconds with the latest status and metric snapshots.'
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
      ) : services.length === 0 ? (
        <EmptyState
          title="No machines yet"
          text="Install the agent on a server, VM, or laptop. Once it posts its first telemetry packet, the machine will appear here."
          cta={
            <Link
              to="/dashboard/add-machine"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-[#06111f] transition hover:bg-cyan-300"
            >
              Add a machine
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="mt-6">{user ? <AgentInstall apiBaseUrl={API_BASE_URL} registrationToken={user.registration_token} /> : null}</div>
        </EmptyState>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {services.map((service) => (
            <Link
              key={service.id}
              to={`/dashboard/machines/${service.id}`}
              className="block"
            >
              <MachineCard service={service} />
            </Link>
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
          The command below already includes your personal registration token, so the first telemetry write creates your machine automatically.
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

function MachineDetailPage() {
  const { serviceId } = useParams();
  const [service, setService] = useState<ServiceSummary | null>(null);
  const [metrics, setMetrics] = useState<MetricRecord[]>([]);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [windowKey, setWindowKey] = useState<WindowKey>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadMachine = async () => {
      try {
        const services = await apiRequest<ServiceSummary[]>('/services');
        const target = services.find((item) => String(item.id) === serviceId) ?? null;
        if (!active) {
          return;
        }
        setService(target);

        if (!target) {
          setMetrics([]);
          setLogs([]);
          setIncidents([]);
          setError('Machine not found');
          return;
        }

        const [metricsResult, logsResult, incidentsResult] = await Promise.all([
          apiRequest<MetricRecord[]>(
            `/metrics?service_name=${encodeURIComponent(target.name)}${target.hostname ? `&hostname=${encodeURIComponent(target.hostname)}` : ''}&limit=500`,
          ),
          apiRequest<LogRecord[]>(
            `/logs?service_name=${encodeURIComponent(target.name)}${target.hostname ? `&hostname=${encodeURIComponent(target.hostname)}` : ''}&limit=50`,
          ),
          apiRequest<IncidentRecord[]>('/incidents?limit=500'),
        ]);

        if (!active) {
          return;
        }

        setMetrics(metricsResult);
        setLogs(logsResult);
        setIncidents(
          incidentsResult.filter((incident) => incident.service_id === target.id || incident.service_name === target.name),
        );
        setError('');
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Failed to load machine detail');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadMachine();
    const intervalId = window.setInterval(loadMachine, 12000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [serviceId]);

  if (loading) {
    return <LoadingState />;
  }

  if (!service) {
    return <EmptyState title="Machine not found" text="The requested machine could not be found for your account." />;
  }

  const filteredMetrics = filterMetricsByWindow(metrics, windowKey);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              <Gauge className="h-3.5 w-3.5" />
              Machine detail
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight">{service.name}</h1>
            <p className="mt-3 text-slate-300">{service.hostname ?? 'No hostname recorded yet'}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['1h', '24h', '7d'] as WindowKey[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setWindowKey(value)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-semibold transition',
                  windowKey === value
                    ? 'bg-cyan-400 text-[#06111f]'
                    : 'border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]',
                ].join(' ')}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error ? <InlineError message={error} /> : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="space-y-6">
          <MetricChart
            title="CPU, memory, and disk"
            icon={<LineChartIcon className="h-4 w-4" />}
            data={filteredMetrics}
            series={[
              { key: 'cpu', label: 'CPU', color: '#22d3ee' },
              { key: 'memory', label: 'Memory', color: '#e879f9' },
              { key: 'disk', label: 'Disk', color: '#fbbf24' },
            ]}
          />

          <MetricChart
            title="Network traffic"
            icon={<Sparkles className="h-4 w-4" />}
            data={filteredMetrics}
            series={[
              { key: 'network_sent', label: 'Sent', color: '#34d399' },
              { key: 'network_recv', label: 'Received', color: '#60a5fa' },
            ]}
          />
        </section>

        <section className="space-y-6">
          <CardPanel title="Recent logs" icon={<AlertTriangle className="h-4 w-4" />}>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <EmptySlot text="No recent logs for this machine." />
              ) : (
                logs.slice(0, 6).map((log) => <LogRow key={log.id} log={log} />)
              )}
            </div>
          </CardPanel>

          <CardPanel title="Incident history" icon={<Bell className="h-4 w-4" />}>
            <div className="space-y-3">
              {incidents.length === 0 ? (
                <EmptySlot text="No incidents have been opened for this machine." />
              ) : (
                incidents.slice(0, 6).map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} />
                ))
              )}
            </div>
          </CardPanel>
        </section>
      </div>
    </div>
  );
}

function IncidentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedIncidentId = searchParams.get('incidentId');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');
  const [severityFilter, setSeverityFilter] = useState(searchParams.get('severity') ?? '');
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [context, setContext] = useState<IncidentContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadIncidents = async () => {
      try {
        const queryParts: string[] = [];
        if (statusFilter) {
          queryParts.push(`status=${encodeURIComponent(statusFilter)}`);
        }
        if (severityFilter) {
          queryParts.push(`severity=${encodeURIComponent(severityFilter)}`);
        }
        const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
        const result = await apiRequest<IncidentRecord[]>(`/incidents${query}`);
        if (!active) {
          return;
        }
        setIncidents(result);
        setError('');
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Failed to load incidents');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadIncidents();

    return () => {
      active = false;
    };
  }, [statusFilter, severityFilter]);

  useEffect(() => {
    if (!selectedIncidentId) {
      setContext(null);
      return;
    }

    let active = true;
    const loadContext = async () => {
      setContextLoading(true);
      try {
        const result = await apiRequest<IncidentContext>(`/incidents/${selectedIncidentId}/context`);
        if (!active) {
          return;
        }
        setContext(result);
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Failed to load incident detail');
      } finally {
        if (active) {
          setContextLoading(false);
        }
      }
    };

    void loadContext();

    return () => {
      active = false;
    };
  }, [selectedIncidentId]);

  const selectedIncident = selectedIncidentId ? incidents.find((incident) => String(incident.id) === selectedIncidentId) : null;

  const applyFilters = (nextStatus: string, nextSeverity: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextStatus) next.set('status', nextStatus);
    else next.delete('status');
    if (nextSeverity) next.set('severity', nextSeverity);
    else next.delete('severity');
    setSearchParams(next);
  };

  const updateStatus = async (incidentId: number, status: string) => {
    await apiRequest(`/incidents/${incidentId}/status`, {
      method: 'PATCH',
      json: { status },
    });
    const updated = await apiRequest<IncidentRecord[]>(`/incidents${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
    setIncidents(updated);
    if (selectedIncidentId) {
      const detail = await apiRequest<IncidentContext>(`/incidents/${selectedIncidentId}/context`);
      setContext(detail);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <SectionHeader
          title="Incidents"
          subtitle="Filter incidents by status and severity, then open one to inspect the surrounding metrics and logs."
          icon={<Bell className="h-4 w-4" />}
        />

        <div className="flex flex-wrap gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <FilterPill
            label="All statuses"
            active={!statusFilter}
            onClick={() => {
              setStatusFilter('');
              applyFilters('', severityFilter);
            }}
          />
          {['open', 'investigating', 'resolved'].map((value) => (
            <FilterPill
              key={value}
              label={value}
              active={statusFilter === value}
              onClick={() => {
                setStatusFilter(value);
                applyFilters(value, severityFilter);
              }}
            />
          ))}
          <div className="mx-2 h-8 w-px bg-white/10" />
          <FilterPill
            label="All severities"
            active={!severityFilter}
            onClick={() => {
              setSeverityFilter('');
              applyFilters(statusFilter, '');
            }}
          />
          {['healthy', 'warning', 'critical'].map((value) => (
            <FilterPill
              key={value}
              label={value}
              active={severityFilter === value}
              onClick={() => {
                setSeverityFilter(value);
                applyFilters(statusFilter, value);
              }}
            />
          ))}
        </div>

        {loading ? (
          <LoadingState />
        ) : incidents.length === 0 ? (
          <EmptyState title="No incidents" text="No incidents match the current filters." icon={<Bell className="h-5 w-5" />} />
        ) : (
          <div className="space-y-3">
            {incidents.map((incident) => (
              <Link key={incident.id} to={`/dashboard/incidents/${incident.id}?${searchParams.toString()}`} className="block">
                <IncidentCard incident={incident} selected={String(incident.id) === selectedIncidentId} />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <SectionHeader
          title="Incident detail"
          subtitle="Open one incident to see the telemetry window around the trigger and update its status."
          icon={<AlertCircle className="h-4 w-4" />}
        />

        {selectedIncidentId ? (
          <CardPanel title={context?.incident.title ?? selectedIncident?.title ?? 'Incident'} icon={<Bell className="h-4 w-4" />}>
            {contextLoading ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-slate-300">Loading incident context...</div>
            ) : context ? (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniStat label="Window start" value={formatTimestamp(context.window_start)} />
                  <MiniStat label="Metrics" value={String(context.metrics_count)} />
                  <MiniStat label="Logs" value={String(context.logs_count)} />
                </div>

                <MetricChart
                  title="Context metrics"
                  icon={<Gauge className="h-4 w-4" />}
                  data={context.metrics}
                  series={[
                    { key: 'cpu', label: 'CPU', color: '#22d3ee' },
                    { key: 'memory', label: 'Memory', color: '#e879f9' },
                    { key: 'disk', label: 'Disk', color: '#fbbf24' },
                  ]}
                />

                <div className="flex flex-wrap gap-2">
                  {['open', 'investigating', 'resolved'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => void updateStatus(context.incident.id, status)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold capitalize text-slate-100 transition hover:bg-white/[0.08]"
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Context logs</h4>
                  {context.logs.length === 0 ? (
                    <EmptySlot text="No logs in this window." />
                  ) : (
                    context.logs.slice(0, 6).map((log) => <LogRow key={log.id} log={log} />)
                  )}
                </div>
              </div>
            ) : (
              <EmptySlot text="Select an incident to see details." />
            )}
          </CardPanel>
        ) : (
          <EmptyState
            title="No incident selected"
            text="Choose an incident from the list to inspect its context."
            icon={<AlertCircle className="h-5 w-5" />}
          />
        )}
      </section>
    </div>
  );
}

function ReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadReports = async () => {
      try {
        const result = await apiRequest<ReportRecord[]>('/reports');
        if (!active) {
          return;
        }
        setReports(result);
        setError('');
      } catch (requestError) {
        if (!active) {
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Failed to load reports');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadReports();
    const intervalId = window.setInterval(loadReports, 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Reports"
        subtitle="AI risk reports produced by the existing analysis engine."
        icon={<AlertCircle className="h-4 w-4" />}
      />

      {error ? <InlineError message={error} /> : null}

      {loading ? (
        <LoadingState />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports" text="Risk reports will appear here after the agent runs analysis." icon={<AlertCircle className="h-5 w-5" />} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
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

function MetricChart({
  title,
  icon,
  data,
  series,
}: {
  title: string;
  icon: ReactNode;
  data: MetricRecord[];
  series: Array<{ key: keyof MetricRecord; label: string; color: string }>;
}) {
  const chartData = [...data]
    .filter((metric) => metric.created_at)
    .reverse()
    .map((metric) => ({
      ...metric,
      label: formatChartLabel(metric.created_at),
    }));

  return (
    <CardPanel title={title} icon={icon}>
      {chartData.length === 0 ? (
        <EmptySlot text="No metric data for the selected window." />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ background: '#07111f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              {series.map((item) => (
                <Line
                  key={String(item.key)}
                  type="monotone"
                  dataKey={item.key as string}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </CardPanel>
  );
}

function IncidentCard({ incident, selected = false }: { incident: IncidentRecord; selected?: boolean }) {
  return (
    <div
      className={[
        'rounded-2xl border p-4 transition',
        selected ? 'border-cyan-300/40 bg-cyan-300/10' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{incident.title}</h3>
            <StatusBadge status={incident.status} />
          </div>
          <p className="mt-1 text-sm text-slate-400">{incident.service_name}</p>
        </div>
        <SeverityPill severity={incident.severity} />
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: ReportRecord }) {
  return (
    <CardPanel
      title={report.service_name}
      icon={<AlertCircle className="h-4 w-4" />}
      right={<StatusBadge status={report.risk_level} />}
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniStat label="Risk score" value={`${report.risk_score}/100`} />
          <MiniStat label="Time to failure" value={report.time_to_failure ?? 'Unknown'} />
        </div>

        <p className="text-sm leading-6 text-slate-300">{report.summary}</p>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Recommendation</div>
          <p className="mt-2 text-sm leading-6 text-slate-100">{report.recommendation}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Predicted failure</div>
          <p className="mt-2 text-sm font-medium text-slate-100">{report.predicted_failure ?? 'None predicted'}</p>
        </div>
      </div>
    </CardPanel>
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
    case 'resolved':
      tone = 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100';
      break;
    case 'investigating':
      tone = 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100';
      break;
    case 'open':
      tone = 'border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-100';
      break;
    default:
      tone = 'border-white/15 bg-white/10 text-slate-100';
      break;
  }

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tone}`}>{status}</span>;
}

function SeverityPill({ severity }: { severity: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
      {severity}
    </span>
  );
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

function CardPanel({
  title,
  icon,
  right,
  children,
}: {
  title: string;
  icon: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-200">{icon}</div>
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function SectionHeader({ title, subtitle, icon }: { title: string; subtitle: string; icon: ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-200">{icon}</div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">{title}</h2>
          <p className="mt-2 text-slate-300">{subtitle}</p>
        </div>
      </div>
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
  return <div className="rounded-2xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">{message}</div>;
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-4 py-2 text-sm font-semibold capitalize transition',
        active ? 'bg-cyan-400 text-[#06111f]' : 'border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]',
      ].join(' ')}
    >
      {label}
    </button>
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

function LogRow({ log }: { log: LogRecord }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StatusBadge status={log.level} />
            <span className="text-xs text-slate-400">{formatRelativeTime(log.created_at)}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-200">{log.message}</p>
        </div>
      </div>
    </div>
  );
}

function EmptySlot({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">{text}</div>;
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

function formatTimestamp(value?: string | null) {
  if (!value) {
    return 'Unknown';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function formatChartLabel(value?: string | null) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function filterMetricsByWindow(metrics: MetricRecord[], windowKey: WindowKey) {
  const cutoff = Date.now() - WINDOW_HOURS[windowKey] * 60 * 60 * 1000;
  return metrics.filter((metric) => {
    if (!metric.created_at) {
      return false;
    }
    const createdAt = new Date(metric.created_at);
    return !Number.isNaN(createdAt.getTime()) && createdAt.getTime() >= cutoff;
  });
}
