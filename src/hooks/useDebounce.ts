import { useEffect, useState } from 'react';

// Returns `value` only after it has stopped changing for `delay` ms.
// Generic: useDebounce('text') returns a string, useDebounce(42) a number.
export default function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
