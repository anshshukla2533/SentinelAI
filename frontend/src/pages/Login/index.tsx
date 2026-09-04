import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth';
import { ThemeToggle } from '../../theme';

export function LoginPage() {
  const { status, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050816] px-4 py-12 text-white">
      <div className="absolute right-5 top-5"><ThemeToggle /></div>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-300">Sentinel AI</p>
          <h1 className="mt-3 text-3xl font-black">Welcome back</h1>
          <p className="mt-2 text-sm text-white/60">Sign in to open your monitoring dashboard.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-white/80">
            Email
            <input className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-violet-400" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          </label>
          <label className="block text-sm font-medium text-white/80">
            Password
            <input className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-violet-400" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          </label>
          {error ? <p className="rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p> : null}
          <button className="w-full rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/60">
          New to Sentinel? <Link className="font-semibold text-violet-300 hover:text-violet-200" to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
