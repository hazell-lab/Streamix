import MovieCard from './MovieCard';
import { getMediaType } from '../utils/helpers';
import type { MediaItem, MediaType } from '../types/tmdb';

interface MovieGridProps {
  items: MediaItem[];
  mediaType?: MediaType;
}

// Responsive poster grid used by Search, Movies, TV Shows and My List.
export default function MovieGrid({ items, mediaType = 'movie' }: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <MovieCard
          key={`${getMediaType(item, mediaType)}-${item.id}`}
          item={item}
          mediaType={mediaType}
          variant="poster"
        />
      ))}
    </div>
  );
}
