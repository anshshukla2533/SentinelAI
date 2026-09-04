import type { ReactNode } from 'react';
import { useState } from 'react';
import { ArrowRight, Check, Copy, Download, Gauge, Monitor, Plus, Shield, Sparkles, Terminal, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../../api';
import { useAuth } from '../../auth';
import type { IncidentRecord, LogRecord, MetricRecord, ServiceSummary } from '../../types';

export function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/70">{label}</div>
    </div>
  );
}

export function BrandMark({ compact, dark }: { compact?: boolean; dark?: boolean } = {}) {
  return (
    <div
      className={[
        'flex items-center justify-center rounded-2xl shadow-lg',
        compact ? 'h-12 w-12' : 'h-14 w-14',
        dark ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white' : 'bg-gradient-to-br from-violet-400 to-fuchsia-500 text-white',
      ].join(' ')}
    >
      <Shield className={compact ? 'h-6 w-6' : 'h-7 w-7'} />
    </div>
  );
}

export function HeroChip({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/75">
      <Check className="mr-2 inline h-4 w-4 text-violet-300" />
      {label}
    </div>
  );
}

export function InfoCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.2)] backdrop-blur-xl">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/15 text-violet-200">
        {icon}
      </div>
      <div className="text-base font-semibold">{title}</div>
      <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
    </div>
  );
}

export function ValueLine({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
        {icon}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="mt-1 text-sm text-white/65">{text}</div>
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  rightTitle,
  rightSubtitle,
  children,
}: {
  title: string;
  subtitle: string;
  rightTitle: string;
  rightSubtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.22),_transparent_65%)]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12),_transparent_55%)]" />
      </div>
      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between px-6 py-8 lg:px-10 lg:py-10">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div>
              <div className="text-3xl font-black">Sentinel AI</div>
              <div className="text-sm text-white/55">Smarter Monitoring. Safer Tomorrow.</div>
            </div>
          </div>

          <div className="max-w-2xl py-14 lg:py-0">
            <div className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
              AI-Powered <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Threat Detection</span>
              {' '}for a Safer Digital World
            </div>
            <p className="mt-8 max-w-xl text-lg leading-8 text-white/72">{title}</p>
            <div className="mt-8 space-y-4">
              <ValueLine icon={<Monitor className="h-4 w-4" />} title="Real-time Monitoring" text="Track devices, logs and system metrics." />
              <ValueLine icon={<Shield className="h-4 w-4" />} title="AI-Powered Detection" text="Identify anomalies and potential threats." />
              <ValueLine icon={<Gauge className="h-4 w-4" />} title="Actionable Insights" text="Get intelligent alerts and recommendations." />
            </div>
          </div>

          <div className="text-sm text-white/60">Your Infrastructure. Our Intelligence.</div>
        </section>

        <section className="flex items-center justify-center bg-[linear-gradient(180deg,#f8f9ff_0%,#ffffff_100%)] px-6 py-10 text-slate-900">
          <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-[0_30px_90px_rgba(99,102,241,0.15)]">
            <div className="flex items-center gap-3">
              <BrandMark compact dark />
              <div className="text-3xl font-black text-slate-900">Sentinel AI</div>
            </div>
            <div className="mt-10">
              <h1 className="text-3xl font-black tracking-tight">{rightTitle}</h1>
              <p className="mt-3 text-slate-600">{rightSubtitle}</p>
            </div>
            <div className="mt-8">{children}</div>
            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
              <span>Sentinel AI</span>
              <span className="h-4 w-px bg-slate-300" />
              <span>v1.0.0</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AuthForm({
  buttonLabel,
  onSubmit,
}: {
  buttonLabel: string;
  onSubmit: (email: string, password: string) => Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
          await onSubmit(email, password);
        } catch (formError) {
          setError(formError instanceof Error ? formError.message : 'Something went wrong');
        } finally {
          setLoading(false);
        }
      }}
    >
      <InputField label="Email Address" value={email} onChange={setEmail} placeholder="Enter your email" type="email" />
      <InputField label="Password" value={password} onChange={setPassword} placeholder="Enter your password" type="password" />

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Please wait...' : buttonLabel}
        <ArrowRight className="h-4 w-4" />
      </button>

      <button
        type="button"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
      >
        Continue with Google
      </button>

      <div className="text-center text-sm text-slate-500">
        Need a workspace? <Link to="/signup" className="font-semibold text-violet-600 hover:text-violet-700">Sign up</Link>
      </div>
    </form>
  );
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: 'email' | 'password' | 'text';
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
        required
      />
    </label>
  );
}

export function InputPreview({ label, placeholder, icon }: { label: string; placeholder: string; icon: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-900">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-400 shadow-sm">
        <span className="text-slate-500">{icon}</span>
        <span>{placeholder}</span>
      </div>
    </label>
  );
}

export function SectionCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,18,39,0.96),rgba(8,13,28,0.96))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-6">
      <div className="mb-5 flex flex-col gap-2">
        <div className="text-3xl font-black tracking-tight">{title}</div>
        <div className="text-sm text-white/55">{subtitle}</div>
      </div>
      {children}
    </section>
  );
}

export function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
      <div className="mb-4">
        <div className="text-lg font-bold">{title}</div>
        {subtitle ? <div className="mt-1 text-sm text-white/55">{subtitle}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-white/75">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-violet-300/40 focus:ring-4 focus:ring-violet-500/10"
      />
    </label>
  );
}

export function SuccessBanner({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-4 text-emerald-50">
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-emerald-100/80">{text}</div>
    </div>
  );
}

export function EmptyStateMini({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-5 text-sm text-white/55">{text}</div>;
}

export function CheckMarkIcon({ ready }: { ready: boolean }) {
  return ready ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />;
}

export function FlowStep({ index, text }: { index: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-xs font-black text-violet-200">{index}</span>
      <span>{text}</span>
    </div>
  );
}

export function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
      <span className="text-white/45">{label}</span>
      <span className="max-w-[18rem] break-all text-right font-mono text-xs text-white">{value}</span>
    </div>
  );
}

export function LegendPill({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

export function UsageBar({ label, value, tone }: { label: string; value: number; tone: 'violet' | 'cyan' }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-white/55">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10">
        <div className={`h-1.5 rounded-full ${tone === 'violet' ? 'bg-violet-500' : 'bg-cyan-500'}`} style={{ width: `${Math.max(8, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function averageMetric(services: ServiceSummary[], key: keyof MetricRecord) {
  const values = services
    .map((service) => service.latest_metric?.[key])
    .filter((value): value is number => typeof value === 'number');
  if (values.length === 0) return null;
  return average(values);
}

export function randomRange(min: number, max: number) {
  return Math.round(min + (max - min) * 0.5);
}

export function relativeTime(value?: string | null) {
  if (!value) return 'just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'recently';
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'healthy' || status === 'resolved'
      ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20'
      : status === 'warning' || status === 'investigating'
        ? 'bg-amber-500/15 text-amber-200 border-amber-400/20'
        : status === 'critical' || status === 'open'
          ? 'bg-red-500/15 text-red-200 border-red-400/20'
          : status === 'info'
            ? 'bg-sky-500/15 text-sky-200 border-sky-400/20'
            : 'bg-white/10 text-white/80 border-white/10';

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tone}`}>{status}</span>;
}

export function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="text-sm text-white/55">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

export function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <div className="text-xs uppercase tracking-[0.25em] text-white/45">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export function LandingFeature({ title, text, onLearnMore }: { title: string; text: string; onLearnMore?: () => void }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="text-base font-bold text-slate-900">{title}</div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
      <button type="button" onClick={onLearnMore} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 transition hover:text-violet-800">
        Learn more
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProjectKeyFlow() {
  const { user } = useAuth();
  const [hostname, setHostname] = useState('server-1');
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const apiKey = user?.registration_token ?? 'sk_live_a1b2c3d4';

  const copyKey = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Project / Hostname" value={hostname} onChange={setHostname} />
        <Field label="Scoped API Key" value={apiKey} readOnly />
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setCreated(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Create project / API key
        </button>
        <button
          type="button"
          onClick={copyKey}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy API key'}
        </button>
      </div>
      {created ? <SuccessBanner title="Project created" text={`Project ${hostname} is ready. The scoped API key is available for the agent install.`} /> : null}
      <FlowCard />
    </div>
  );
}

export function AgentDownloadPanel({ token, hostname }: { token?: string; hostname?: string }) {
  const [copied, setCopied] = useState(false);
  const apiKey = token || 'sk_live_a1b2c3d4';
  const downloadUrl = `${API_BASE_URL}/downloads/agent/sentinel-agent.exe`;
  const installCommand = `sentinel-agent.exe --server ${API_BASE_URL} --api-key ${apiKey}${hostname ? ` --hostname ${hostname}` : ''}`;

  const copyCommand = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-4">
      <a href={downloadUrl} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:translate-y-[-1px]">
        <Download className="h-4 w-4" />
        Download agent SDK
      </a>
      <a href={`${API_BASE_URL}/install-agent.sh`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
        <Terminal className="h-4 w-4" />
        Installer script
      </a>
      <div className="rounded-[1.3rem] border border-white/10 bg-[#091024] p-4">
        <div className="text-xs uppercase tracking-[0.25em] text-white/45">Configuration</div>
        <div className="mt-3 space-y-2 text-sm text-white/75">
          <ConfigRow label="server_url" value={API_BASE_URL} />
          <ConfigRow label="api_key" value={apiKey} />
          <ConfigRow label="hostname" value={hostname ?? 'server-1'} />
        </div>
      </div>
      <div className="rounded-[1.3rem] border border-white/10 bg-[#0b1224] p-4">
        <div className="text-xs uppercase tracking-[0.25em] text-white/45">Command</div>
        <code className="mt-3 block rounded-2xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-cyan-100">{installCommand}</code>
        <button type="button" onClick={copyCommand} className="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy command'}
        </button>
      </div>
    </div>
  );
}

export function FlowCard() {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.25em] text-white/45">Flow</div>
      <div className="mt-3 space-y-2 text-sm text-white/70">
        <FlowStep index="1" text="Create account -> login -> JWT" />
        <FlowStep index="2" text="Create project -> generate API key" />
        <FlowStep index="3" text="Install agent -> send telemetry" />
        <FlowStep index="4" text="Backend validates, stores, and analyzes data" />
      </div>
    </div>
  );
}

export function demoServices(): ServiceSummary[] {
  return [
    { id: 1, name: 'SERVER-01', hostname: 'server-1', status: 'healthy', open_incidents_count: 0, latest_metric: { id: 1, service_name: 'SERVER-01', cpu: 34, memory: 61, disk: 45, operating_system: 'Ubuntu 24.04 LTS' } as MetricRecord },
    { id: 2, name: 'DB-SERVER-03', hostname: 'db-server-03', status: 'warning', open_incidents_count: 2, latest_metric: { id: 2, service_name: 'DB-SERVER-03', cpu: 72, memory: 78, disk: 81, operating_system: 'Ubuntu 22.04 LTS' } as MetricRecord },
    { id: 3, name: 'WEB-SERVER-05', hostname: 'web-server-05', status: 'healthy', open_incidents_count: 0, latest_metric: { id: 3, service_name: 'WEB-SERVER-05', cpu: 28, memory: 53, disk: 40, operating_system: 'Ubuntu 24.04 LTS' } as MetricRecord },
    { id: 4, name: 'APP-SERVER-04', hostname: 'app-server-04', status: 'critical', open_incidents_count: 3, latest_metric: { id: 4, service_name: 'APP-SERVER-04', cpu: 64, memory: 82, disk: 67, operating_system: 'Windows Server 2019' } as MetricRecord },
  ];
}

export function demoLogs(): LogRecord[] {
  return [
    { id: 1, service_name: 'SERVER-01', level: 'info', message: 'System boot completed successfully', created_at: new Date().toISOString() },
    { id: 2, service_name: 'SERVER-04', level: 'warning', message: 'High memory usage detected (82%)', created_at: new Date().toISOString() },
    { id: 3, service_name: 'SERVER-02', level: 'critical', message: 'Failed SSH login attempt from 192.168.1.233', created_at: new Date().toISOString() },
  ];
}

export function demoIncidents(): IncidentRecord[] {
  return [
    { id: 1, service_name: 'SERVER-02', title: 'High CPU Usage', severity: 'critical', status: 'active' },
    { id: 2, service_name: 'DB-SERVER-03', title: 'Disk Space Low', severity: 'warning', status: 'investigating' },
    { id: 3, service_name: 'APP-SERVER-04', title: 'Memory Usage High', severity: 'warning', status: 'resolved' },
  ];
}
