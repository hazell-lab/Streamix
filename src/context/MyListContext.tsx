import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useToast } from './ToastContext';
import { getMediaType, getTitle, isListItem, toListItem } from '../utils/helpers';
import type { ListItem, MediaItem, MediaType } from '../types/tmdb';

interface MyListContextValue {
  items: ListItem[];
  isInList: (id: number, mediaType: MediaType) => boolean;
  toggle: (item: MediaItem, mediaType?: MediaType) => void;
  clearList: () => void;
}

const MyListContext = createContext<MyListContextValue | null>(null);
const STORAGE_KEY = 'streamix:my-list';

export function MyListProvider({ children }: { children: ReactNode }) {
  // Stored as `unknown`: LocalStorage could hold anything, so it is validated below.
  const [stored, setStored] = useLocalStorage<unknown>(STORAGE_KEY, []);
  const { showToast } = useToast();

  // Guard against anything unexpected in LocalStorage.
  const items = useMemo(() => (Array.isArray(stored) ? stored.filter(isListItem) : []), [stored]);

  const isInList = useCallback(
    (id: number, mediaType: MediaType) => items.some((item) => item.id === id && item.media_type === mediaType),
    [items],
  );

  const toggle = useCallback(
    (item: MediaItem, mediaType?: MediaType) => {
      const type = getMediaType(item, mediaType);
      const exists = items.some((entry) => entry.id === item.id && entry.media_type === type);

      if (exists) {
        setStored(items.filter((entry) => !(entry.id === item.id && entry.media_type === type)));
        showToast(`Removed "${getTitle(item)}" from My List`, 'info');
      } else {
        setStored([toListItem(item, type), ...items]);
        showToast(`Added "${getTitle(item)}" to My List`, 'success');
      }
    },
    [items, setStored, showToast],
  );

  const clearList = useCallback(() => {
    setStored([]);
    showToast('My List cleared', 'info');
  }, [setStored, showToast]);

  const value = useMemo(
    () => ({ items, isInList, toggle, clearList }),
    [items, isInList, toggle, clearList],
  );

  return <MyListContext.Provider value={value}>{children}</MyListContext.Provider>;
}

export function useMyList(): MyListContextValue {
  const context = useContext(MyListContext);
  if (!context) throw new Error('useMyList must be used inside <MyListProvider>');
  return context;
}
