import { ArrowRight, MoonStar, Sparkles, Activity, Shield, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandMark, HeroChip, LandingFeature, ValueLine } from '../../components/common';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute right-0 top-0 h-[36rem] w-[36rem] rounded-full bg-violet-500/18 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-[22rem] bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.16),_transparent_55%)]" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-8 py-6">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark />
            <div>
              <div className="text-2xl font-black tracking-tight">Sentinel AI</div>
              <div className="text-xs uppercase tracking-[0.35em] text-white/55">AI-Powered Threat Detection</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-white/75 lg:flex">
            <a href="#product" className="transition hover:text-white">Product</a>
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
            <a href="#resources" className="transition hover:text-white">Resources</a>
            <a href="#company" className="transition hover:text-white">Company</a>
          </nav>

          <div className="flex items-center gap-3">
            <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10" type="button">
              <MoonStar className="h-4 w-4" />
            </button>
            <Link
              to="/login"
              className="inline-flex h-11 items-center rounded-full border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:translate-y-[-1px]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100vh-104px)] max-w-[1600px] gap-16 px-8 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-24">
          <div className="space-y-10 xl:pr-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-2 text-sm font-medium text-violet-100 shadow-lg shadow-violet-950/20">
              <Sparkles className="h-4 w-4" />
              AI-Powered Infrastructure Monitoring Platform
            </div>

            <div className="max-w-3xl">
              <h1 className="text-6xl font-black leading-[0.95] tracking-tight text-white md:text-7xl xl:text-[5.8rem]">
                AI-Powered <span className="bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Threat Detection</span>
                {' '}& System Monitoring
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72">
                Sentinel AI protects your infrastructure in real time. Monitor devices, analyze logs, detect anomalies, and respond faster with AI-driven insights.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-7 text-sm font-semibold text-white shadow-xl shadow-violet-500/30 transition hover:translate-y-[-1px]"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-violet-400/50 bg-[#0d1022]/70 px-7 text-sm font-semibold text-white transition hover:bg-white/5"
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
              <div className="grid gap-0 lg:grid-cols-[0.88fr_1.12fr]">
                <div className="border-b border-white/10 bg-[#090d20] px-8 py-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
                  <div className="flex items-center gap-3">
                    <BrandMark compact />
                    <div>
                      <div className="text-2xl font-black">Sentinel AI</div>
                      <div className="text-sm text-white/55">Smarter Monitoring. Safer Tomorrow.</div>
                    </div>
                  </div>

                  <div className="mt-12 space-y-6">
                    <div className="max-w-sm text-5xl font-black leading-[0.98] text-white md:text-6xl">
                      AI-Powered <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">Threat Detection</span>
                      {' '}for a Safer Digital World
                    </div>
                    <p className="max-w-md text-base leading-8 text-white/68">
                      Monitor systems, detect anomalies, and respond to threats all in real time.
                    </p>

                    <div className="space-y-4 pt-2">
                      <ValueLine icon={<Activity className="h-4 w-4" />} title="Real-time Monitoring" text="Track devices, logs and metrics." />
                      <ValueLine icon={<Shield className="h-4 w-4" />} title="AI-Powered Detection" text="Identify anomalies and potential threats." />
                      <ValueLine icon={<Gauge className="h-4 w-4" />} title="Actionable Insights" text="Get intelligent alerts and recommendations." />
                    </div>
                  </div>
                </div>

                <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f5f7ff_100%)] px-8 py-8 text-slate-900 lg:px-10 lg:py-10">
                  <div className="mx-auto max-w-md rounded-[2.2rem] bg-white p-8 shadow-[0_30px_80px_rgba(99,102,241,0.15)] lg:p-10">
                    <div className="flex items-center gap-3">
                      <BrandMark compact dark />
                      <div className="text-3xl font-black text-slate-900">Sentinel AI</div>
                    </div>

                    <div className="mt-10">
                      <h2 className="text-3xl font-black tracking-tight text-slate-900">Welcome Back!</h2>
                      <p className="mt-3 text-slate-600">Sign in to access your dashboard and keep your devices secure.</p>

                      <div className="mt-8 space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">Enter your email</div>
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">Enter your password</div>
                      </div>

                      <div className="mt-7 flex items-center gap-3">
                        <Link
                          to="/login"
                          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:translate-y-[-1px]"
                        >
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>

                      <div className="my-7 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
                        <span className="h-px flex-1 bg-slate-200" />
                        OR
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>

                      <button
                        type="button"
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        Continue with Google
                      </button>

                      <p className="mt-8 text-center text-sm text-slate-500">
                        Don&apos;t have an account?{' '}
                        <Link to="/signup" className="font-semibold text-violet-600 hover:text-violet-700">
                          Contact your administrator
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white">
          <div className="mx-auto grid max-w-[1600px] gap-6 px-8 py-14 md:grid-cols-5">
            {[
              ['Real-time Monitoring', 'Monitor CPU, memory, disk, network, and more across your devices.'],
              ['Centralized Logs', 'Collect, search, and analyze logs from all systems in one place.'],
              ['Smart Alerts', 'Get AI-powered alerts for anomalies and threats with severity prioritization.'],
              ['AI Insights', 'Predict issues and generate actionable recommendations.'],
              ['Secure & Compliant', 'Role-based access, audit logs, and encryption-first design.'],
            ].map(([title, text]) => (
              <LandingFeature key={title} title={title} text={text} />
            ))}
          </div>
        </section>

        <section id="pricing" className="bg-white px-8 py-12">
          <div className="mx-auto max-w-[1600px] rounded-[2rem] bg-[#060816] px-10 py-12 shadow-[0_20px_60px_rgba(17,24,39,0.25)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-3xl font-black text-white">Ready to secure your infrastructure?</div>
                <p className="mt-2 max-w-2xl text-white/65">Join teams using Sentinel AI to stay ahead of issues before they become outages.</p>
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

