import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import useScrolled from '../hooks/useScrolled.js';

// 1) Resets scroll to the top on every route change.
// 2) Shows a floating "back to top" button after scrolling down.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const showButton = useScrolled(700);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  if (!showButton) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 animate-fade-in items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-black/60 transition hover:scale-110 hover:bg-brand-dark sm:bottom-8 sm:right-8"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
