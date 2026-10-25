import { Link } from 'react-router-dom';
import { Bookmark, Trash2 } from 'lucide-react';
import MovieGrid from '../components/MovieGrid.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import { useMyList } from '../context/MyListContext.jsx';

export default function MyList() {
  usePageTitle('My List');
  const { items, clearList } = useMyList();

  const handleClear = () => {
    if (window.confirm('Remove everything from My List?')) clearList();
  };

  return (
    <main className="min-h-[70vh] pb-8 pt-24 sm:pt-28">
      <div className="page-x space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-5xl tracking-wide sm:text-6xl">My List</h1>
            <p className="mt-1 text-sm text-white/60">
              {items.length} saved title{items.length === 1 ? '' : 's'}
            </p>
          </div>

          {items.length > 0 && (
            <button type="button" onClick={handleClear} className="btn btn-secondary">
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Clear all
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <Bookmark className="h-14 w-14 text-white/25" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Your list is empty</h2>
            <p className="max-w-sm text-sm text-white/60">
              Tap the + button on any movie or show and it will be saved here, even after you refresh.
            </p>
            <div className="flex gap-3">
              <Link to="/movies" className="btn btn-brand">Browse movies</Link>
              <Link to="/tv" className="btn btn-secondary">Browse TV shows</Link>
            </div>
          </div>
        ) : (
          <MovieGrid items={items} />
        )}
      </div>
    </main>
  );
}
