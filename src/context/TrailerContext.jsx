import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { getMediaType, getTitle } from '../utils/helpers.js';

const TrailerContext = createContext(null);

export function TrailerProvider({ children }) {
  const [trailer, setTrailer] = useState(null); // { id, mediaType, title, returnFocus }

  const openTrailer = useCallback((item, mediaType) => {
    setTrailer({
      id: item.id,
      mediaType: getMediaType(item, mediaType),
      title: getTitle(item),
      // The button that opened the modal, so focus can go back to it on close.
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

export function useTrailer() {
  const context = useContext(TrailerContext);
  if (!context) throw new Error('useTrailer must be used inside <TrailerProvider>');
  return context;
}
