import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getMediaType, getTitle } from '../utils/helpers';
import type { MediaItem, MediaType } from '../types/tmdb';

export interface TrailerTarget {
  id: number;
  mediaType: MediaType;
  title: string;
  // The button that opened the modal, so focus can go back to it on close.
  returnFocus: Element | null;
}

interface TrailerContextValue {
  trailer: TrailerTarget | null;
  openTrailer: (item: MediaItem, mediaType?: MediaType) => void;
  closeTrailer: () => void;
}

const TrailerContext = createContext<TrailerContextValue | null>(null);

export function TrailerProvider({ children }: { children: ReactNode }) {
  const [trailer, setTrailer] = useState<TrailerTarget | null>(null);

  const openTrailer = useCallback((item: MediaItem, mediaType?: MediaType) => {
    setTrailer({
      id: item.id,
      mediaType: getMediaType(item, mediaType),
      title: getTitle(item),
      returnFocus: document.activeElement,
    });
  }, []);

  const closeTrailer = useCallback(() => setTrailer(null), []);

  const value = useMemo(
    () => ({ trailer, openTrailer, closeTrailer }),
    [trailer, openTrailer, closeTrailer],
  );

  return <TrailerContext.Provider value={value}>{children}</TrailerContext.Provider>;
}

export function useTrailer(): TrailerContextValue {
  const context = useContext(TrailerContext);
  if (!context) throw new Error('useTrailer must be used inside <TrailerProvider>');
  return context;
}
