import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import { getErrorMessage } from '../utils/helpers';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseFetchResult<T> extends FetchState<T> {
  refetch: () => void;
}

/**
 * Runs an async function and tracks { data, loading, error }.
 * - Generic: the type of `data` comes from what the fetcher resolves to.
 * - Pass `null` as the fetcher to skip fetching.
 * - Re-runs whenever a value in `deps` changes, or when `refetch()` is called.
 * - Ignores results that arrive after the component unmounted / deps changed.
 */
export default function useFetch<T>(
  fetcher: (() => Promise<T>) | null,
  deps: DependencyList = [],
): UseFetchResult<T> {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: Boolean(fetcher), error: null });
  const [attempt, setAttempt] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const run = fetcherRef.current;
    if (!run) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    run()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ data: null, loading: false, error: getErrorMessage(err) });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const refetch = useCallback(() => setAttempt((count) => count + 1), []);

  return { ...state, refetch };
}
