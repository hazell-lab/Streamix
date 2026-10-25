import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { useToast } from './ToastContext.jsx';
import { toListItem } from '../utils/helpers.js';

const RecentlyViewedContext = createContext(null);
const STORAGE_KEY = 'streamix:recently-viewed';
const MAX_ITEMS = 20;

export function RecentlyViewedProvider({ children }) {
  const [stored, setStored] = useLocalStorage(STORAGE_KEY, []);
  const { showToast } = useToast();

  const items = useMemo(
    () => (Array.isArray(stored) ? stored.filter((item) => item && item.id) : []),
    [stored],
  );

  const addRecent = useCallback(
    (item, mediaType) => {
      const entry = toListItem(item, mediaType);
      setStored((previous) => {
        const list = Array.isArray(previous) ? previous : [];
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

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) throw new Error('useRecentlyViewed must be used inside <RecentlyViewedProvider>');
  return context;
}
