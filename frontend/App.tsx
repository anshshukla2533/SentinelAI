import type React from 'react';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Download,
  Mail,
  Radar,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import AgentInstall from './AgentInstall';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api.sentinel-ai.com';

function App() {
  return (
    <div className="min-h-screen bg-[#070914] text-white">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-[#070914]/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-[#07111f] shadow-lg shadow-cyan-500/25">
              <Shield className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold">SentinelAI</span>
          </div>

          <a
            href="#download"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-[#07111f] transition hover:bg-cyan-100"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
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
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 shadow-lg shadow-cyan-950/30">
                <Sparkles className="h-4 w-4 text-fuchsia-300" />
                AI-based predictive infrastructure protection
              </div>

              <h1 className="text-5xl font-black leading-tight tracking-normal md:text-7xl">
                Download SentinelAI and predict server failures before they happen.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
                Install a lightweight Python agent, stream telemetry, and let SentinelAI detect dangerous patterns
                before downtime reaches your users.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#download"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-cyan-400 px-6 py-4 font-bold text-[#06111f] shadow-xl shadow-cyan-500/25 transition hover:bg-cyan-300"
                >
                  <Download className="h-5 w-5" />
                  Download Agent
                </a>
                <a
                  href="mailto:hello@sentinel-ai.com"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-6 py-4 font-bold text-white backdrop-blur transition hover:bg-white/15"
                >
                  <Mail className="h-5 w-5" />
                  Talk to us
                </a>
              </div>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              <HeroMetric label="Prediction window" value="24/7" tone="cyan" />
              <HeroMetric label="Agent footprint" value="Light" tone="emerald" />
              <HeroMetric label="Alert mode" value="Email" tone="fuchsia" />
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#0d1224]">
          <div className="mx-auto grid max-w-6xl gap-4 px-6 py-10 md:grid-cols-3">
            <Feature
              icon={<BrainCircuit />}
              title="AI Trend Analysis"
              text="Reads telemetry patterns to identify risky changes before they become outages."
              color="cyan"
            />
            <Feature
              icon={<Radar />}
              title="Failure Signals"
              text="Tracks CPU, memory, disk, network, logs, and service health from your machines."
              color="fuchsia"
            />
            <Feature
              icon={<Zap />}
              title="Early Alerts"
              text="Sends predictive warnings so teams can fix the issue before users feel it."
              color="amber"
            />
          </div>
        </section>

        <section id="download" className="relative overflow-hidden bg-[#f7fbff] text-[#07111f]">
          <div className="download-grid absolute inset-0 opacity-70" />
          <div className="relative mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#07111f] px-3 py-1 text-sm font-semibold text-cyan-200">
                <Terminal className="h-4 w-4" />
                One-command install
              </div>
              <h2 className="text-4xl font-black tracking-normal">Download the SentinelAI agent</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Copy the command and run it on the machine you want to protect. The agent starts sending telemetry to
                your backend so SentinelAI can begin prediction.
              </p>

              <div className="mt-7 space-y-4">
                <Step text="Install on a server, laptop, or VM" />
                <Step text="Collect telemetry continuously" />
                <Step text="Generate predictive risk warnings" />
              </div>
            </div>

            <AgentInstall apiBaseUrl={API_BASE_URL} />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#070914]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-7 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <span className="font-semibold text-white">SentinelAI</span>
          <span>Predictive infrastructure intelligence for computers and servers.</span>
        </div>
      </footer>
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

export default App;
