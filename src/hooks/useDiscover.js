import { useCallback, useEffect, useRef, useState } from 'react';
import { discoverMedia } from '../services/tmdb.js';
import { uniqueById } from '../utils/helpers.js';

const EMPTY = {
  items: [],
  page: 1,
  totalPages: 1,
  loading: false,
  loadingMore: false,
  error: null,
  moreError: null,
};

/**
 * Paginated "browse by genre" data for the Movies / TV pages.
 * Does nothing while `genreId` is null.
 */
export default function useDiscover(mediaType, genreId, sortBy) {
  const [state, setState] = useState(EMPTY);
  const [attempt, setAttempt] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const requestRef = useRef(0);

  useEffect(() => {
    requestRef.current += 1;
    const requestId = requestRef.current;

    if (!genreId) {
      setState(EMPTY);
      return undefined;
    }

    setState({ ...EMPTY, loading: true });

    discoverMedia(mediaType, { genreId, sortBy, page: 1 })
      .then((data) => {
        if (requestId !== requestRef.current) return;
        setState({
          ...EMPTY,
          items: uniqueById(data.results),
          page: data.page,
          totalPages: data.total_pages,
        });
      })
      .catch((error) => {
        if (requestId !== requestRef.current) return;
        setState({ ...EMPTY, error: error.message });
      });

    return () => {
      requestRef.current += 1;
    };
  }, [mediaType, genreId, sortBy, attempt]);

  const loadMore = useCallback(() => {
    const current = stateRef.current;
    if (!genreId || current.loadingMore || current.page >= current.totalPages) return;

    const requestId = requestRef.current;
    setState((prev) => ({ ...prev, loadingMore: true, moreError: null }));

    discoverMedia(mediaType, { genreId, sortBy, page: current.page + 1 })
      .then((data) => {
        if (requestId !== requestRef.current) return;
        setState((prev) => ({
          ...prev,
          items: uniqueById([...prev.items, ...data.results]),
          page: data.page,
          totalPages: data.total_pages,
          loadingMore: false,
        }));
      })
      .catch((error) => {
        if (requestId !== requestRef.current) return;
        setState((prev) => ({ ...prev, loadingMore: false, moreError: error.message }));
      });
  }, [mediaType, genreId, sortBy]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return {
    ...state,
    hasMore: state.page < state.totalPages,
    loadMore,
    retry,
  };
}
