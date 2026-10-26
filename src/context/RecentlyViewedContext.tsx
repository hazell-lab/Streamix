import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from './ToastContext';
import { isListItem, toListItem } from '../utils/helpers';
import type { ListItem, MediaItem, MediaType } from '../types/tmdb';

interface RecentlyViewedContextValue {
  items: ListItem[];
  addRecent: (item: MediaItem, mediaType?: MediaType) => void;
  clearRecent: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);
const STORAGE_KEY = 'streamix:recently-viewed';
const MAX_ITEMS = 20;

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<unknown>(STORAGE_KEY, []);
  const { showToast } = useToast();

  const items = useMemo(() => (Array.isArray(stored) ? stored.filter(isListItem) : []), [stored]);

  const addRecent = useCallback(
    (item: MediaItem, mediaType?: MediaType) => {
      const entry = toListItem(item, mediaType);
      setStored((previous: unknown) => {
        const list = Array.isArray(previous) ? previous.filter(isListItem) : [];
        const rest = list.filter(
          (existing) => !(existing.id === entry.id && existing.media_type === entry.media_type),
        );
        return [entry, ...rest].slice(0, MAX_ITEMS);
      });
    },
    [setStored],
  );

  const clearRecent = useCallback(() => {
    setStored([]);
    showToast('Recently viewed cleared', 'info');
  }, [setStored, showToast]);

  const value = useMemo(() => ({ items, addRecent, clearRecent }), [items, addRecent, clearRecent]);

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed(): RecentlyViewedContextValue {
  const context = useContext(RecentlyViewedContext);
  if (!context) throw new Error('useRecentlyViewed must be used inside <RecentlyViewedProvider>');
  return context;
}
