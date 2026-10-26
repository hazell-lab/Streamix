import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/40">
      <div className="page-x flex flex-col gap-8 py-10 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-3">
          <p className="font-display text-3xl tracking-[0.08em] text-brand">STREAMIX</p>
          <p className="text-sm text-white/50">
            A portfolio project built with React, Vite and Tailwind CSS. Not affiliated with Netflix. No
            videos are hosted here.
          </p>
        </div>

        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-white/60">
          <Link to="/" className="transition hover:text-white">Home</Link>
          <Link to="/movies" className="transition hover:text-white">Movies</Link>
          <Link to="/tv" className="transition hover:text-white">TV Shows</Link>
          <Link to="/my-list" className="transition hover:text-white">My List</Link>
          <Link to="/search" className="transition hover:text-white">Search</Link>
        </nav>
      </div>

      <div className="border-t border-white/5 py-5 text-center text-xs text-white/60">
        <p className="page-x">
          This product uses the TMDB API but is not endorsed or certified by TMDB. Movie data and images ©{' '}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition hover:text-white"
          >
            The Movie Database
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
