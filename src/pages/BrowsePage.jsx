import { useSearchParams } from 'react-router-dom';
import { Loader2, SearchX } from 'lucide-react';
import GenreFilter from '../components/GenreFilter.jsx';
import MovieRow from '../components/MovieRow.jsx';
import MovieGrid from '../components/MovieGrid.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import useFetch from '../hooks/useFetch.js';
import useDiscover from '../hooks/useDiscover.js';
import usePageTitle from '../hooks/usePageTitle.js';
import { getGenres } from '../services/tmdb.js';
import { hasImage } from '../utils/helpers.js';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
];

/**
 * Shared layout for the Movies and TV Shows pages.
 * - No genre selected: a stack of curated rows (`rows`).
 * - Genre selected: a paginated grid. The genre lives in the URL (?genre=28),
 *   so it survives a refresh and can be linked to from the details page.
 */
export default function BrowsePage({ mediaType, title, rows }) {
  usePageTitle(title);

  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = Number(searchParams.get('genre')) || null;
  // Sort also lives in the URL so a refreshed or shared link shows the same list.
  const sortParam = searchParams.get('sort');
  const sortBy = SORT_OPTIONS.some((option) => option.value === sortParam) ? sortParam : SORT_OPTIONS[0].value;

  const { data: genres, loading: genresLoading } = useFetch(() => getGenres(mediaType), [mediaType]);
  const discover = useDiscover(mediaType, genreId, sortBy);

  const handleSelectGenre = (id) => {
    if (!id) {
      setSearchParams({});
      return;
    }
    const next = { genre: String(id) };
    if (sortBy !== SORT_OPTIONS[0].value) next.sort = sortBy;
    setSearchParams(next);
  };

  const handleSort = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === SORT_OPTIONS[0].value) next.delete('sort');
    else next.set('sort', value);
    setSearchParams(next, { replace: true });
  };

  const activeGenre = (genres || []).find((genre) => genre.id === genreId);
  const label = mediaType === 'movie' ? 'Movies' : 'TV Shows';
  const visibleItems = discover.items.filter(hasImage);

  return (
    <main className="pb-8 pt-24 sm:pt-28">
      <header className="page-x space-y-5">
        <h1 className="font-display text-5xl tracking-wide sm:text-6xl">{title}</h1>
        <GenreFilter
          genres={genres || []}
          selected={genreId}
          onSelect={handleSelectGenre}
          loading={genresLoading}
        />
      </header>

      {!genreId ? (
        <div className="mt-6 space-y-2">
          {rows.map((row) => (
            <MovieRow key={row.title} title={row.title} fetcher={row.fetcher} mediaType={mediaType} />
          ))}
        </div>
      ) : (
        <section className="page-x mt-8" aria-label={`${activeGenre?.name || ''} ${label}`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold sm:text-2xl">
              {activeGenre ? `${activeGenre.name} ${label}` : label}
            </h2>

            <div className="flex gap-1 rounded-full bg-white/10 p-1" role="group" aria-label="Sort by">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSort(option.value)}
                  aria-pressed={sortBy === option.value}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    sortBy === option.value ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {discover.loading && <LoadingSkeleton variant="grid" />}

          {!discover.loading && discover.error && (
            <ErrorMessage message={discover.error} onRetry={discover.retry} />
          )}

          {!discover.loading && !discover.error && visibleItems.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <SearchX className="h-12 w-12 text-white/30" aria-hidden="true" />
              <p className="text-lg font-semibold">Nothing to show for this genre yet</p>
              <p className="text-sm text-white/60">Try another genre or sort option.</p>
            </div>
          )}

          {!discover.loading && !discover.error && visibleItems.length > 0 && (
            <>
              <MovieGrid items={visibleItems} mediaType={mediaType} />

              {discover.moreError && (
                <p role="alert" className="mt-6 text-center text-sm text-brand">
                  {discover.moreError}
                </p>
              )}

              {discover.hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={discover.loadMore}
                    disabled={discover.loadingMore}
                    className="btn btn-secondary min-w-40"
                  >
                    {discover.loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Loading...
                      </>
                    ) : (
                      'Load more'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
