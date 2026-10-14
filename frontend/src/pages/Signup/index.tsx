import { FormEvent, useState } from 'react';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { ThemeToggle } from '../../theme';

const inputClass = 'signup-input mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10';

export function SignupPage() {
  const { status, signUp } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="signup-page relative min-h-screen overflow-hidden bg-[#050816] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_85%_90%,rgba(14,165,233,0.12),transparent_32%)]" />
      <div className="absolute right-5 top-5"><ThemeToggle /></div>
      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-fuchsia-500"><ShieldCheck className="h-6 w-6" /></div><span className="text-2xl font-black">Sentinel AI</span></div>
          <h1 className="mt-12 max-w-lg text-5xl font-black leading-[1.05] tracking-tight">A clearer view of your infrastructure starts here.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-white/55">Create your workspace, connect your machines, and see live telemetry in one secure place.</p>
          <div className="mt-8 space-y-4 text-sm text-white/70">
            {['Live machine telemetry', 'Centralized logs and alerts', 'Private user-owned workspaces'].map((item) => <div key={item} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><Check className="h-3.5 w-3.5" /></span>{item}</div>)}
          </div>
        </div>

        <div className="signup-card mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#0c1020]/95 p-6 shadow-2xl shadow-black/30 sm:p-9">
          <div className="mb-8 lg:hidden"><div className="text-sm font-bold uppercase tracking-[0.25em] text-violet-300">Sentinel AI</div></div>
          <div className="mb-7">
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300">Create workspace</div>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">Set up your account to start monitoring your infrastructure.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="signup-label block text-sm font-medium text-white/80">First name<input className={inputClass} type="text" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="Jane" required autoComplete="given-name" /></label>
                <label className="signup-label block text-sm font-medium text-white/80">Last name<input className={inputClass} type="text" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Doe" required autoComplete="family-name" /></label>
            </div>
            <label className="signup-label block text-sm font-medium text-white/80">Work email<input className={inputClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required autoComplete="email" /></label>
            <label className="signup-label block text-sm font-medium text-white/80">Password<input className={inputClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} required autoComplete="new-password" /></label>
            <label className="signup-label block text-sm font-medium text-white/80">Confirm password<input className={inputClass} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat your password" minLength={8} required autoComplete="new-password" /></label>
            {error ? <p className="rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
            <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3.5 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-white/55">Already have an account? <Link className="font-semibold text-violet-300 hover:text-violet-200" to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
