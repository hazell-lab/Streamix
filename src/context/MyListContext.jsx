import { createContext, useCallback, useContext, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { useToast } from './ToastContext.jsx';
import { getMediaType, getTitle, toListItem } from '../utils/helpers.js';

const MyListContext = createContext(null);
const STORAGE_KEY = 'streamix:my-list';

export function MyListProvider({ children }) {
  const [stored, setStored] = useLocalStorage(STORAGE_KEY, []);
  const { showToast } = useToast();

  // Guard against anything unexpected in LocalStorage.
  const items = useMemo(
    () => (Array.isArray(stored) ? stored.filter((item) => item && item.id) : []),
    [stored],
  );

  const isInList = useCallback(
    (id, mediaType) => items.some((item) => item.id === id && item.media_type === mediaType),
    [items],
  );

  const toggle = useCallback(
    (item, mediaType) => {
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

export function useMyList() {
  const context = useContext(MyListContext);
  if (!context) throw new Error('useMyList must be used inside <MyListProvider>');
  return context;
}
