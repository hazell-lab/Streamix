import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, SearchX } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import MovieRow from '../components/MovieRow';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import useDebounce from '../hooks/useDebounce';
import usePageTitle from '../hooks/usePageTitle';
import { getTrending, searchMulti } from '../services/tmdb';
import { getErrorMessage, hasImage, uniqueById } from '../utils/helpers';
import type { MediaItem } from '../types/tmdb';

interface SearchState {
  status: 'idle' | 'loading' | 'success' | 'error';
  results: MediaItem[];
  page: number;
  totalPages: number;
  totalResults: number;
  error: string | null;
  loadingMore: boolean;
  moreError: string | null;
}

const INITIAL: SearchState = {
  status: 'idle',
  results: [],
  page: 1,
  totalPages: 1,
  totalResults: 0,
  error: null,
  loadingMore: false,
  moreError: null,
};

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(urlQuery);
  const debouncedQuery = useDebounce(query.trim(), 450);

  // If the URL changes from outside this page (navbar Search link, back/forward
  // buttons), update the input so it never shows results for a different query.
  useEffect(() => {
    if (urlQuery !== debouncedQuery) setQuery(urlQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  const [state, setState] = useState<SearchState>(INITIAL);
  const [attempt, setAttempt] = useState(0);
  const requestRef = useRef(0);

  usePageTitle(debouncedQuery ? `Search: ${debouncedQuery}` : 'Search');

  // Keep the URL in sync so searches can be shared / refreshed.
  useEffect(() => {
    const current = searchParams.get('q') || '';
    if (current === debouncedQuery) return;
    setSearchParams(debouncedQuery ? { q: debouncedQuery } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Fetch results whenever the (debounced) query changes.
  useEffect(() => {
    requestRef.current += 1;
    const requestId = requestRef.current;

    if (!debouncedQuery) {
      setState(INITIAL);
      return undefined;
    }

    setState({ ...INITIAL, status: 'loading' });

    searchMulti(debouncedQuery, 1)
      .then((data) => {
        if (requestId !== requestRef.current) return;
        setState({
          ...INITIAL,
          status: 'success',
          results: uniqueById(data.results.filter(hasImage)),
          page: data.page,
          totalPages: data.total_pages,
          totalResults: data.total_results,
        });
      })
      .catch((error: unknown) => {
        if (requestId !== requestRef.current) return;
        setState({ ...INITIAL, status: 'error', error: getErrorMessage(error) });
      });

    return () => {
      requestRef.current += 1;
    };
  }, [debouncedQuery, attempt]);

  const loadMore = useCallback(() => {
    if (state.loadingMore || state.page >= state.totalPages) return;
    const requestId = requestRef.current;
    setState((prev) => ({ ...prev, loadingMore: true, moreError: null }));

    searchMulti(debouncedQuery, state.page + 1)
      .then((data) => {
        if (requestId !== requestRef.current) return;
        setState((prev) => ({
          ...prev,
          results: uniqueById([...prev.results, ...data.results.filter(hasImage)]),
          page: data.page,
          totalPages: data.total_pages,
          loadingMore: false,
        }));
      })
      .catch((error: unknown) => {
        if (requestId !== requestRef.current) return;
        setState((prev) => ({ ...prev, loadingMore: false, moreError: getErrorMessage(error) }));
      });
  }, [debouncedQuery, state.loadingMore, state.page, state.totalPages]);

  // While the user is still typing, show a skeleton instead of stale results.
  const isTyping = query.trim() !== debouncedQuery;
  const { status, results } = state;

  return (
    <main className="min-h-[70vh] pb-8 pt-24 sm:pt-28">
      <div className="page-x space-y-8">
        <header className="mx-auto max-w-2xl space-y-4 text-center">
          <h1 className="font-display text-5xl tracking-wide sm:text-6xl">Search</h1>
          <SearchBar
            value={query}
            onChange={setQuery}
            onClear={() => setQuery('')}
            autoFocus
            placeholder="Search for a movie or TV show..."
          />
        </header>

        {status === 'idle' && !isTyping && (
          <p className="text-center text-white/60">Start typing to find movies and TV shows.</p>
        )}

        {(status === 'loading' || (isTyping && query.trim())) && <LoadingSkeleton variant="grid" />}

        {status === 'error' && !isTyping && (
          <ErrorMessage
            title="Search failed"
            message={state.error}
            onRetry={() => setAttempt((count) => count + 1)}
          />
        )}

        {status === 'success' && !isTyping && results.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <SearchX className="h-14 w-14 text-white/30" aria-hidden="true" />
            <p className="text-xl font-semibold">No results for "{debouncedQuery}"</p>
            <p className="max-w-sm text-sm text-white/60">
              Check the spelling or try a different title, actor or keyword.
            </p>
          </div>
        )}

        {status === 'success' && !isTyping && results.length > 0 && (
          <section aria-label="Search results">
            <p className="mb-5 text-sm text-white/60" aria-live="polite">
              {state.totalResults.toLocaleString()} result{state.totalResults === 1 ? '' : 's'} for{' '}
              <span className="font-semibold text-white">"{debouncedQuery}"</span>
            </p>
            <MovieGrid items={results} />

            {state.moreError && (
              <p role="alert" className="mt-6 text-center text-sm text-brand">
                {state.moreError}
              </p>
            )}

            {state.page < state.totalPages && (
              <div className="mt-10 flex justify-center">
                <button type="button" onClick={loadMore} disabled={state.loadingMore} className="btn btn-secondary min-w-40">
                  {state.loadingMore ? (
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
          </section>
        )}
      </div>

      {status === 'idle' && !isTyping && (
        <div className="mt-10">
          <MovieRow title="Trending right now" fetcher={() => getTrending('all', 'week')} />
        </div>
      )}
    </main>
  );
}
