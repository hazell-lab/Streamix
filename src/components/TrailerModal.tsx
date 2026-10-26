import { useEffect, useRef, useState } from 'react';
import { Film, Loader2, X } from 'lucide-react';
import { useTrailer } from '../context/TrailerContext';
import { getVideos } from '../services/tmdb';
import { getErrorMessage, pickTrailer } from '../utils/helpers';
import type { Video } from '../types/tmdb';

interface TrailerState {
  loading: boolean;
  error: string | null;
  video: Video | null;
}

// Responsive YouTube trailer modal. Close with the X, a backdrop click, or Escape.
export default function TrailerModal() {
  const { trailer, closeTrailer } = useTrailer();
  const [state, setState] = useState<TrailerState>({ loading: false, error: null, video: null });
  const dialogRef = useRef<HTMLDivElement>(null);

  // Fetch the trailer whenever a new title is opened.
  useEffect(() => {
    if (!trailer) return undefined;

    let cancelled = false;
    setState({ loading: true, error: null, video: null });

    getVideos(trailer.mediaType, trailer.id)
      .then((videos) => {
        if (!cancelled) setState({ loading: false, error: null, video: pickTrailer(videos) });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ loading: false, error: getErrorMessage(error), video: null });
      });

    return () => {
      cancelled = true;
    };
  }, [trailer]);

  // Escape key, focus trap and page scroll lock while open.
  useEffect(() => {
    if (!trailer) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeTrailer();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      // Keep Tab / Shift+Tab cycling inside the dialog.
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, iframe, [href], [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Send focus back to the button that opened the trailer (e.g. a card's Play button).
      const { returnFocus } = trailer;
      if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus();
    };
  }, [trailer, closeTrailer]);

  if (!trailer) return null;

  const { loading, error, video } = state;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${trailer.title} trailer`}
      onClick={closeTrailer}
      className="fixed inset-0 z-[100] flex animate-fade-in items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
    >
      <div onClick={(event) => event.stopPropagation()} className="relative w-full max-w-4xl animate-pop-in">
        <button
          type="button"
          onClick={closeTrailer}
          autoFocus
          aria-label="Close trailer"
          className="absolute -top-11 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-brand"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-2xl shadow-black ring-1 ring-white/10">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center" role="status" aria-label="Loading trailer">
              <Loader2 className="h-10 w-10 animate-spin text-brand" aria-hidden="true" />
            </div>
          )}

          {!loading && error && (
            <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <Film className="h-10 w-10 text-brand" aria-hidden="true" />
              <p className="font-semibold">Couldn't load the trailer</p>
              <p className="text-sm text-white/60">{error}</p>
            </div>
          )}

          {!loading && !error && !video && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <Film className="h-10 w-10 text-white/40" aria-hidden="true" />
              <p className="font-semibold">No trailer available</p>
              <p className="text-sm text-white/60">TMDB doesn't have a trailer for this title yet.</p>
            </div>
          )}

          {video && (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${video.key}?autoplay=1&rel=0&modestbranding=1`}
              title={`${trailer.title} trailer`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )}
        </div>

        <p className="mt-3 truncate text-center text-sm font-medium text-white/80">{trailer.title}</p>
      </div>
    </div>
  );
}
