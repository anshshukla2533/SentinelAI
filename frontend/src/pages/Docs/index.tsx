import { ArrowLeft, BookOpen, CheckCircle2, Copy, Server, ShieldCheck, Terminal } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

const API_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-950 text-slate-100">
      <button type="button" onClick={() => void copy()} className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/10">
        <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto p-5 pr-24 text-sm leading-7"><code>{children}</code></pre>
    </div>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-slate-200 py-14 last:border-0">
      {eyebrow ? <div className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">{eyebrow}</div> : null}
      <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h2>
      <div className="mt-5 space-y-5 text-[1.02rem] leading-8 text-slate-600">{children}</div>
    </section>
  );
}

export function DocsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_28%)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3 font-black tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white"><ShieldCheck className="h-5 w-5" /></div>
            <span className="text-xl">Sentinel AI Docs</span>
          </Link>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Link to="/" className="hidden items-center gap-2 text-slate-600 transition hover:text-slate-950 sm:flex"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
            <Link to="/login" className="rounded-xl bg-slate-950 px-4 py-2.5 text-white transition hover:bg-blue-600">Open dashboard</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[230px_1fr] lg:px-8">
        <aside className="hidden pt-14 lg:block">
          <div className="sticky top-28 space-y-2 text-sm font-semibold text-slate-500">
            <div className="mb-4 flex items-center gap-2 text-slate-950"><BookOpen className="h-4 w-4 text-blue-600" /> Documentation</div>
            <a className="block rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-700" href="#getting-started">Getting started</a>
            <a className="block rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-700" href="#agent">Install the agent</a>
            <a className="block rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-700" href="#telemetry">Telemetry</a>
            <a className="block rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-700" href="#dashboard">Dashboard</a>
            <a className="block rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-700" href="#api">API reference</a>
            <a className="block rounded-lg px-3 py-2 hover:bg-blue-50 hover:text-blue-700" href="#troubleshooting">Troubleshooting</a>
          </div>
        </aside>

        <main className="max-w-4xl pb-20">
          <div className="pt-16">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600"><Terminal className="h-4 w-4" /> Sentinel AI platform documentation</div>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.04em] text-slate-950 sm:text-6xl">Monitor infrastructure before it becomes an incident.</h1>
            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-600">Sentinel AI connects a lightweight machine agent to your workspace, collects live system signals, and turns metrics, logs, and service health into one operational view.</p>
          </div>

          <Section id="getting-started" eyebrow="Getting started" title="Create a workspace and connect a machine">
            <p>Create an account, then open the dashboard. Your account owns the machines and telemetry it registers, so logging in from another browser shows the same private workspace.</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {['Create an account', 'Register a machine', 'Start the agent'].map((step, index) => <div key={step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-sm font-black text-blue-600">0{index + 1}</div><div className="mt-3 font-bold text-slate-900">{step}</div></div>)}
            </div>
          </Section>

          <Section id="agent" eyebrow="Machine agent" title="Install and authenticate the Sentinel agent">
            <p>The agent runs on the machine you want to monitor. It reads CPU, memory, disk, network, uptime, operating system, watched processes, and Docker container health when configured.</p>
            <p>Use the machine code generated for that machine. It is sent as a bearer credential and is never embedded in the source code.</p>
            <CodeBlock>{`$env:SENTINEL_API_BASE_URL="${API_URL}"
$env:SENTINEL_MACHINE_CODE="paste-machine-code-here"
python agent.py --check
python agent.py`}</CodeBlock>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-950"><strong>Important:</strong> each machine has its own code. Reissue the code from the Devices workflow if the original code is lost.</div>
          </Section>

          <Section id="telemetry" eyebrow="What Sentinel collects" title="Metrics, health, and logs in one stream">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5"><Server className="h-5 w-5 text-blue-600" /><h3 className="mt-3 font-bold text-slate-900">System metrics</h3><p className="mt-2 text-sm leading-6">CPU, memory, disk, network sent/received, load average, uptime, hostname, and operating system.</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><h3 className="mt-3 font-bold text-slate-900">Service health</h3><p className="mt-2 text-sm leading-6">Running state and resource pressure for the base service, watched processes, and optional Docker containers.</p></div>
            </div>
            <p>Telemetry is stored against the authenticated machine owner. A different user cannot see it in their dashboard.</p>
          </Section>

          <Section id="dashboard" eyebrow="Workspace" title="Read the dashboard signals">
            <p>The dashboard shows real backend data only. Online devices are machines seen by the backend within the active reporting window, connected devices are registered machines, and average CPU is calculated from received metric samples.</p>
            <p>Recent alerts come from incidents created when service health becomes warning or critical. Logs and machine records are available from their dedicated navigation pages.</p>
          </Section>

          <Section id="api" eyebrow="API reference" title="Core endpoints">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-sm shadow-sm">
              {[['POST', '/auth/signup', 'Create an account and start a session'], ['POST', '/auth/login', 'Authenticate an existing account'], ['GET', '/machines', 'List machines owned by the current user'], ['POST', '/metrics', 'Ingest a metric using a machine code'], ['GET', '/metrics', 'Read metrics for the current user'], ['GET', '/logs', 'Search collected logs'], ['GET', '/incidents', 'List current and historical alerts']].map(([method, path, description]) => <div key={path} className="grid gap-2 border-b border-slate-100 px-5 py-4 last:border-0 sm:grid-cols-[70px_190px_1fr] sm:items-center"><span className={`font-mono text-xs font-bold ${method === 'POST' ? 'text-emerald-600' : 'text-blue-600'}`}>{method}</span><code className="font-mono text-slate-900">{path}</code><span className="text-slate-500">{description}</span></div>)}
            </div>
          </Section>

          <Section id="troubleshooting" eyebrow="Troubleshooting" title="When metrics do not appear">
            <ol className="list-decimal space-y-2 pl-6">
              <li>Confirm the agent uses the current machine code, not the account registration token.</li>
              <li>Run <code className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-900">python agent.py --check</code> to test backend connectivity.</li>
              <li>Run one cycle with <code className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-900">python agent.py --once --no-analysis</code>.</li>
              <li>Refresh the dashboard and check Devices, Monitoring, and Logs.</li>
            </ol>
            <p>For local development, the API is normally available at <code className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-900">{API_URL}</code>.</p>
          </Section>
        </main>
      </div>
    </div>
  );
}
