import type { Genre } from '../types/tmdb';

interface GenreFilterProps {
  genres?: Genre[];
  selected: number | null;
  onSelect: (genreId: number | null) => void;
  loading?: boolean;
}

// Horizontally scrollable genre chips. `selected` is a genre id or null ("All").
export default function GenreFilter({ genres = [], selected, onSelect, loading = false }: GenreFilterProps) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-hidden" aria-busy="true" aria-label="Loading genres">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="skeleton h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>
    );
  }

  const chipClass = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
      active
        ? 'border-brand bg-brand text-white shadow-lg shadow-brand/30'
        : 'border-white/15 bg-white/5 text-white/70 hover:border-white/40 hover:text-white'
    }`;

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-8 sm:px-8 lg:-mx-14 lg:px-14" role="group" aria-label="Filter by genre">
      <button type="button" onClick={() => onSelect(null)} aria-pressed={selected == null} className={chipClass(selected == null)}>
        All
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          type="button"
          onClick={() => onSelect(genre.id)}
          aria-pressed={selected === genre.id}
          className={chipClass(selected === genre.id)}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
