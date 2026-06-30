import React, { useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Radar,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import AgentInstall from './AgentInstall';
import { API_BASE_URL } from './api';
import { AuthProvider, useAuth } from './auth';
import DashboardApp from './dashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === 'loading') {
    return <FullScreenLoader text="Checking your session..." />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function LandingPage() {
  const { user, status, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#070914] text-white">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#070914]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-[#07111f] shadow-lg shadow-cyan-500/25">
              <Shield className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold">SentinelAI</span>
          </Link>

          <div className="flex items-center gap-3">
            {status === 'authenticated' ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex h-10 items-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-[#07111f] transition hover:bg-cyan-100"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex h-10 items-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-10 items-center rounded-lg bg-white px-4 text-sm font-semibold text-[#07111f] transition hover:bg-cyan-100"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section className="relative min-h-[92vh] overflow-hidden pt-24">
          <div className="ai-grid absolute inset-0" />
          <div className="signal signal-one" />
          <div className="signal signal-two" />
          <div className="signal signal-three" />

          <div className="relative z-10 mx-auto flex min-h-[calc(92vh-6rem)] max-w-6xl flex-col justify-center px-6 py-16">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-4 py-2 text-sm font-medium text-cyan-100">
                <Sparkles className="h-4 w-4 text-cyan-200" />
                Monitoring that stays quiet until you need it
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
                See your machines, incidents, and reports in one calm workspace.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Install the agent once, then keep an eye on the machines that matter most. SentinelAI collects the
                signals for you and surfaces the ones worth your attention.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                {status === 'authenticated' ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 font-semibold text-[#06111f] transition hover:bg-cyan-300"
                  >
                    <Server className="h-5 w-5" />
                    Go to dashboard
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 font-semibold text-[#06111f] transition hover:bg-cyan-300"
                  >
                    <Sparkles className="h-5 w-5" />
                    Create account
                  </Link>
                )}
                <a
                  href="mailto:hello@sentinel-ai.com"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  <Mail className="h-5 w-5" />
                  Contact us
                </a>
              </div>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              <HeroMetric label="What it tracks" value="CPU, memory, logs" tone="cyan" />
              <HeroMetric label="How it feels" value="Lightweight" tone="emerald" />
              <HeroMetric label="How you hear" value="Alerts" tone="fuchsia" />
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.02]">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 py-10 md:grid-cols-3">
            <Feature
              icon={<Radar />}
              title="What it watches"
              text="CPU, memory, disk, logs, and service health in one place."
              color="cyan"
            />
            <Feature
              icon={<Server />}
              title="How it stays private"
              text="Every machine belongs to one account and one token."
              color="fuchsia"
            />
            <Feature
              icon={<Zap />}
              title="What you get"
              text="A clear view of what is healthy, what needs attention, and what to do next."
              color="amber"
            />
          </div>
        </section>

        <section id="download" className="relative overflow-hidden bg-[#f4f7fb] text-[#07111f]">
          <div className="download-grid absolute inset-0 opacity-70" />
          <div className="relative mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#07111f] px-3 py-1 text-sm font-medium text-cyan-200">
                <Terminal className="h-4 w-4" />
                Agent install
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">Install the agent on one machine first</h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Copy the command and run it wherever you want visibility. The machine appears in your dashboard as
                soon as it posts its first telemetry packet.
              </p>

              <div className="mt-7 space-y-4">
                <Step text="Copy the install command" />
                <Step text="Run it on a server, VM, or laptop" />
                <Step text="See the machine appear in your dashboard" />
              </div>
            </div>

            <AgentInstall apiBaseUrl={API_BASE_URL} />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#070914]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-7 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <span className="font-semibold text-white">SentinelAI</span>
          <span>Simple monitoring for machines that need a steady eye on them.</span>
        </div>
      </footer>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { login, status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Log in to SentinelAI"
      subtitle="Use your account to view your machines, incidents, and reports."
      footerText={
        <>
          New here?{' '}
          <Link to="/signup" className="text-cyan-300 transition hover:text-cyan-200">
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm
        submitLabel="Log in"
        onSubmit={async (email, password) => {
          await login(email, password);
          navigate('/dashboard');
        }}
      />
    </AuthPageShell>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const { signup, status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthPageShell
      eyebrow="Get started"
      title="Create your SentinelAI account"
      subtitle="Your account gets a personal registration token for the agent and a private dashboard."
      footerText={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-cyan-300 transition hover:text-cyan-200">
            Log in
          </Link>
        </>
      }
    >
      <AuthForm
        submitLabel="Create account"
        onSubmit={async (email, password) => {
          await signup(email, password);
          navigate('/dashboard');
        }}
      />
    </AuthPageShell>
  );
}

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#070914] text-white">
      <header className="border-b border-white/10 bg-[#070914]/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-[#07111f] shadow-lg shadow-cyan-500/25">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold leading-none">SentinelAI</div>
              <div className="text-xs text-slate-400">Private dashboard</div>
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

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 shadow-2xl shadow-black/20">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Your account
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight">Welcome back, {user?.email}</h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              This is the private area for your machines. Your registration token is ready for the agent install
              command, and it stays tied to this account.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <MetricPill label="Machines" value="0+" />
              <MetricPill label="Incidents" value="Private" />
              <MetricPill label="Reports" value="Live" />
            </div>
          </section>

          <section className="rounded-3xl border border-cyan-300/20 bg-[#07111f] p-8 shadow-2xl shadow-cyan-950/20">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-200">
                <Terminal className="h-6 w-6" />
              </div>
              <div>
                <div className="text-lg font-semibold">Agent install command</div>
                <div className="text-sm text-slate-400">Uses your personal registration token.</div>
              </div>
            </div>

            {user ? (
              <div className="mt-6">
                <AgentInstall apiBaseUrl={API_BASE_URL} registrationToken={user.registration_token} />
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">
                Loading your registration token...
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function AuthPageShell({
  eyebrow,
  title,
  subtitle,
  footerText,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  footerText: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070914] text-white">
      <div className="ai-grid absolute inset-0 opacity-70" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 shadow-lg shadow-cyan-950/30">
              <Sparkles className="h-4 w-4 text-fuchsia-300" />
              {eyebrow}
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-normal md:text-6xl">{title}</h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">{subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back home
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 text-sm font-semibold text-[#07111f] transition hover:bg-cyan-300"
              >
                <Server className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
            <div className="install-scan absolute inset-x-0 top-0 h-px bg-cyan-300" />
            {children}
            <p className="mt-6 text-sm text-slate-400">{footerText}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function AuthForm({
  submitLabel,
  onSubmit,
}: {
  submitLabel: string;
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
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-300/40"
          placeholder="you@example.com"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-300/40"
          placeholder="At least 8 characters"
          required
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-[#06111f] shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Please wait...' : submitLabel}
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

function FullScreenLoader({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070914] text-white">
      <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-6 py-5 text-sm text-slate-300 shadow-2xl shadow-black/20">
        {text}
      </div>
    </div>
  );
}

function HeroMetric({ label, value, tone }: { label: string; value: string; tone: 'cyan' | 'emerald' | 'fuchsia' }) {
  const tones = {
    cyan: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
    emerald: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
    fuchsia: 'border-fuchsia-300/25 bg-fuchsia-300/10 text-fuchsia-100',
  };

  return (
    <div className={`rounded-lg border p-5 backdrop-blur-xl ${tones[tone]}`}>
      <div className="text-sm opacity-75">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  color: 'cyan' | 'fuchsia' | 'amber';
}) {
  const colors = {
    cyan: 'bg-cyan-400 text-[#07111f] shadow-cyan-500/25',
    fuchsia: 'bg-fuchsia-400 text-[#18051b] shadow-fuchsia-500/25',
    amber: 'bg-amber-300 text-[#1b1202] shadow-amber-500/25',
  };

  return (
    <div className="group rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.09]">
      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-lg shadow-lg ${colors[color]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
    </div>
  );
}

function Step({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <CheckCircle2 className="h-5 w-5 flex-none text-teal-600" />
      <span className="font-medium">{text}</span>
      <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-black text-white">{value}</div>
    </div>
  );
}

export default App;
