import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard.jsx';
import LoadingSkeleton from './LoadingSkeleton.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import useFetch from '../hooks/useFetch.js';
import { ROW_CARD_WIDTH, getMediaType, hasImage } from '../utils/helpers.js';

/**
 * A horizontally scrolling carousel.
 * Provide EITHER `fetcher` (async function returning an array)
 * OR `items` (an array you already have).
 */
export default function MovieRow({
  title,
  fetcher,
  items: itemsProp,
  mediaType = 'movie',
  variant = 'backdrop',
  getProgress,
}) {
  const { data, loading, error, refetch } = useFetch(fetcher || null, []);
  const items = (itemsProp ?? data ?? []).filter(hasImage);

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows, items.length]);

  const scrollByPage = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  const heading = (
    <h2 className="page-x mb-1 text-lg font-bold tracking-tight sm:text-xl md:text-2xl">{title}</h2>
  );

  if (loading) {
    return (
      <section className="py-2" aria-label={title}>
        {heading}
        <LoadingSkeleton variant="row" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-2" aria-label={title}>
        {heading}
        <ErrorMessage compact title={`Couldn't load ${title}`} message={error} onRetry={refetch} />
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-2" aria-label={title}>
      {heading}
      <div className="group/row relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label={`Scroll ${title} left`}
            className="absolute bottom-5 left-0 top-5 z-40 hidden w-12 items-center justify-center bg-gradient-to-r from-black/80 to-transparent text-white opacity-0 transition-opacity duration-300 hover:from-black focus-visible:opacity-100 group-hover/row:opacity-100 md:flex"
          >
            <ChevronLeft className="h-9 w-9" aria-hidden="true" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth px-4 py-5 sm:px-8 lg:px-14"
        >
          {items.map((item) => (
            <div key={`${getMediaType(item, mediaType)}-${item.id}`} className={`shrink-0 ${ROW_CARD_WIDTH}`}>
              <MovieCard
                item={item}
                mediaType={mediaType}
                variant={variant}
                progress={getProgress ? getProgress(item) : undefined}
              />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label={`Scroll ${title} right`}
            className="absolute bottom-5 right-0 top-5 z-40 hidden w-12 items-center justify-center bg-gradient-to-l from-black/80 to-transparent text-white opacity-0 transition-opacity duration-300 hover:from-black focus-visible:opacity-100 group-hover/row:opacity-100 md:flex"
          >
            <ChevronRight className="h-9 w-9" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
