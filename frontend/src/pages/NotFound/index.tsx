import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050816] text-white">
      <div className="text-center">
        <div className="text-5xl font-black">404</div>
        <div className="mt-3 text-white/60">This page does not exist.</div>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white">
          Go home
        </Link>
      </div>
    </div>
  );
}

