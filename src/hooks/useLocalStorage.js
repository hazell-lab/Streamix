import { useEffect, useState } from 'react';

// Like useState, but the value is saved to (and restored from) LocalStorage.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      // Corrupted JSON or storage blocked (private mode) - start fresh.
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable - the app still works for this session.
    }
  }, [key, value]);

  // Keep several open tabs in sync: when another tab changes this key,
  // the browser fires a "storage" event here and we adopt the new value.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.storageArea !== window.localStorage || event.key !== key) return;
      try {
        setValue(event.newValue !== null ? JSON.parse(event.newValue) : initialValue);
      } catch {
        // Ignore malformed values written by something else.
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // initialValue is usually an inline [] - leaving it out avoids re-subscribing every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue];
}
