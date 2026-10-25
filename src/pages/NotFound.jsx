import { Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle.js';

export default function NotFound() {
  usePageTitle('Page not found');

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center gap-5 px-4 pt-20 text-center">
      <p className="font-display text-[9rem] leading-none text-brand drop-shadow-[0_0_30px_rgba(229,9,20,0.4)] sm:text-[12rem]">
        404
      </p>
      <h1 className="text-2xl font-bold sm:text-3xl">Lost in the multiverse</h1>
      <p className="max-w-md text-white/60">
        The page you're looking for doesn't exist or has been moved. Let's get you back to something worth watching.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn btn-brand">Back to Home</Link>
        <Link to="/search" className="btn btn-secondary">Search</Link>
      </div>
    </main>
  );
}
