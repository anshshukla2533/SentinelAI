import { ArrowRight, MoonStar, Sparkles, Activity, Shield, Gauge } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandMark, HeroChip, LandingFeature, ValueLine } from '../../components/common';
import { ThemeToggle } from '../../theme';

export function LandingPage() {
  const navigate = useNavigate();
  const featureDocsAnchor: Record<string, string> = {
    'Real-time Monitoring': 'telemetry',
    'Centralized Logs': 'api',
    'Smart Alerts': 'dashboard',
    'AI Insights': 'dashboard',
    'Secure & Compliant': 'getting-started',
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-[36rem] w-[36rem] rounded-full bg-violet-500/18 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-[22rem] bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.16),_transparent_55%)]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark />
            <div>
              <div className="text-[1.65rem] font-black leading-none tracking-tight">Sentinel AI</div>
              <div className="mt-1 text-[0.6rem] uppercase tracking-[0.28em] text-white/55">AI-Powered Threat Detection</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-[0.88rem] font-medium text-white/70 lg:flex">
            <a href="#product" className="transition hover:text-white">Product</a>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <a href="#resources" className="transition hover:text-white">Resources</a>
            <a href="#company" className="transition hover:text-white">Company</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:translate-y-[-1px]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-104px)] max-w-[1600px] gap-16 px-8 pt-6 pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:pt-10 lg:pb-24">
          <div className="space-y-10 xl:pr-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 shadow-lg shadow-violet-950/20">
              <Sparkles className="h-4 w-4" />
              AI-Powered Infrastructure Monitoring Platform
            </div>

            <div className="max-w-3xl">
              <h1 className="text-[2.5rem] font-black leading-[0.96] tracking-[-0.06em] text-white sm:text-[3.1rem] xl:text-[3.8rem]">
                AI-Powered Threat Detection &amp; System Monitoring
              </h1>
              <p className="mt-6 max-w-2xl text-[1.05rem] leading-7 text-white/72">
                Sentinel AI protects your infrastructure in real time. Monitor all your devices, analyze logs, detect anomalies, and respond faster with AI-driven insights.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-sm font-semibold text-white shadow-xl shadow-violet-500/30 transition hover:translate-y-[-1px]"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-violet-400/50 bg-[#0d1022]/70 px-6 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Request Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
              <HeroChip label="No credit card required" />
              <HeroChip label="14-day free trial" />
              <HeroChip label="Cancel anytime" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.28),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.16),_transparent_38%)] blur-2xl" />
            <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0a1024]/92 shadow-[0_0_0_1px_rgba(168,85,247,0.18),0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="flex items-center justify-between border-b border-white/10 bg-[#0b1120]/80 px-6 py-4">
                <div className="flex items-center gap-3">
                  <BrandMark compact />
                  <div className="text-[1.75rem] font-black tracking-tight">Sentinel AI</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Last 24 Hours</div>
                  <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
                    <MoonStar className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-[220px_1fr]">
                <aside className="border-r border-white/10 bg-[#070d1a] p-4 text-sm text-white/80">
                  <div className="space-y-2">
                    {['Dashboard', 'Devices', 'Monitoring', 'Logs', 'Alerts', 'Analytics', 'Reports', 'Users', 'Settings'].map((item, index) => (
                      <div
                        key={item}
                        className={`flex cursor-default items-center gap-3 rounded-xl px-3 py-2 ${index === 0 ? 'bg-violet-500/15 text-white ring-1 ring-violet-400/30' : 'text-white/65 hover:bg-white/5'}`}
                      >
                        <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" />
                        {item}
                      </div>
                    ))}
                  </div>
                </aside>

                <div className="bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_50%)] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">Dashboard</div>
                      <div className="text-sm text-white/60">Good Evening, Admin!</div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      ['128', 'Online Devices'],
                      ['6', 'Offline Devices'],
                      ['3', 'Critical Alerts'],
                      ['42%', 'Anomaly CPU'],
                    ].map(([value, label], index) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="text-2xl font-black text-white">{value}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">{label}</div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                          <div
                            className={`h-full rounded-full ${index % 2 === 0 ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-gradient-to-r from-sky-500 to-violet-500'}`}
                            style={{ width: index === 3 ? '42%' : '78%' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
                        <span>CPU Usage (24 Hours)</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px]">CPU</span>
                      </div>
                      <div className="relative h-36 overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(139,92,246,0.08),rgba(15,23,42,0))] p-2">
                        <svg viewBox="0 0 320 120" className="h-full w-full" preserveAspectRatio="none" aria-label="CPU usage chart">
                          <defs>
                            <linearGradient id="lineGlow" x1="0%" x2="100%" y1="0%" y2="0%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#c084fc" />
                            </linearGradient>
                          </defs>
                          <path d="M0,80 C40,50, 60,30, 100,70 S170,95, 210,50 S280,20, 320,40" fill="none" stroke="url(#lineGlow)" strokeWidth="3" strokeLinecap="round" />
                          <path d="M0,80 C40,50, 60,30, 100,70 S170,95, 210,50 S280,20, 320,40 L320,120 L0,120 Z" fill="rgba(139,92,246,0.15)" />
                        </svg>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="mb-3 text-xs uppercase tracking-[0.2em] text-white/60">System Information</div>
                      <div className="space-y-3 text-sm text-white/72">
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1120] px-3 py-2">
                          <span>Hostname</span>
                          <span className="font-medium text-white">SERVER-01</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1120] px-3 py-2">
                          <span>Operating System</span>
                          <span className="font-medium text-white">Ubuntu 24.04 LTS</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1120] px-3 py-2">
                          <span>Uptime</span>
                          <span className="font-medium text-white">12h 16m</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1120] px-3 py-2">
                          <span>Load Average</span>
                          <span className="font-medium text-white">0.84</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-8 py-16">
          <div className="mx-auto max-w-[1600px] text-center">
            <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Everything You Need to Secure &amp; Monitor
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Powerful features to help you detect threats, monitor systems, and respond instantly.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-[1600px] gap-6 md:grid-cols-2 xl:grid-cols-5">
            {[
              ['Real-time Monitoring', 'Monitor CPU, memory, disk, network, and more across your devices.'],
              ['Centralized Logs', 'Collect, search, and analyze logs from all systems in one place.'],
              ['Smart Alerts', 'Get AI-powered alerts for anomalies and threats with severity prioritization.'],
              ['AI Insights', 'Predict issues and generate actionable recommendations.'],
              ['Secure & Compliant', 'Role-based access, audit logs, and encryption-first design.'],
            ].map(([title, text]) => (
              <LandingFeature key={title} title={title} text={text} onLearnMore={() => navigate(`/docs#${featureDocsAnchor[title]}`)} />
            ))}
          </div>
        </section>

        <section id="pricing" className="bg-white px-8 pb-16 pt-4">
          <div className="mx-auto max-w-[1600px] rounded-[2rem] bg-[#060816] px-10 py-12 shadow-[0_20px_60px_rgba(17,24,39,0.25)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-3xl font-black text-white">Ready to secure your infrastructure?</div>
                <p className="mt-2 max-w-2xl text-white/65">Join thousands of security teams using Sentinel AI to stay ahead of threats.</p>
              </div>
              <div className="flex gap-3">
                <Link to="/signup" className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 text-sm font-semibold text-white">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="inline-flex h-12 items-center gap-2 rounded-full border border-violet-400/60 px-6 text-sm font-semibold text-white">
                  Talk to Sales
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

