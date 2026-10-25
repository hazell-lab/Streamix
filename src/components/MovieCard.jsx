import { Link } from 'react-router-dom';
import { Check, Info, Play, Plus, Star } from 'lucide-react';
import LazyImage from './LazyImage.jsx';
import { useMyList } from '../context/MyListContext.jsx';
import { useTrailer } from '../context/TrailerContext.jsx';
import { getMediaType, getRating, getTitle, getYear, imageUrl } from '../utils/helpers.js';

/**
 * One movie / TV card.
 * - variant: 'backdrop' (16:9, used in rows) or 'poster' (2:3, used in grids)
 * - progress: optional 0-100 value that draws a "continue watching" bar
 */
export default function MovieCard({ item, mediaType = 'movie', variant = 'backdrop', progress }) {
  const { isInList, toggle } = useMyList();
  const { openTrailer } = useTrailer();

  const type = getMediaType(item, mediaType);
  const title = getTitle(item);
  const rating = getRating(item);
  const saved = isInList(item.id, type);
  const detailsPath = `/${type}/${item.id}`;

  const isPoster = variant === 'poster';
  const imagePath = isPoster ? item.poster_path : item.backdrop_path || item.poster_path;
  const src = imageUrl(imagePath, isPoster ? 'w342' : 'w500');

  return (
    <article className="group relative overflow-hidden rounded-lg bg-surface-raised shadow-lg shadow-black/40 ring-1 ring-white/5 transition-all duration-300 ease-out focus-within:ring-white/40 md:hover:z-30 md:hover:scale-110 md:hover:shadow-2xl md:hover:shadow-black/80 md:hover:ring-white/20">
      <div className="relative">
        <Link to={detailsPath} aria-label={`View details for ${title}`} className="block">
          <LazyImage
            src={src}
            alt={`${title} ${isPoster ? 'poster' : 'backdrop'}`}
            className={isPoster ? 'aspect-[2/3]' : 'aspect-video'}
          />
        </Link>

        {/* Action buttons: always visible on touch screens, revealed on hover for desktop */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 pt-8 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => openTrailer(item, type)}
            aria-label={`Play trailer for ${title}`}
            title="Play trailer"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition hover:scale-110 hover:bg-white/80"
          >
            <Play className="h-4 w-4 translate-x-px" fill="currentColor" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => toggle(item, type)}
            aria-label={saved ? `Remove ${title} from My List` : `Add ${title} to My List`}
            aria-pressed={saved}
            title={saved ? 'Remove from My List' : 'Add to My List'}
            className={`pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border-2 transition hover:scale-110 ${
              saved
                ? 'border-brand bg-brand text-white'
                : 'border-white/60 bg-black/50 text-white hover:border-white'
            }`}
          >
            {saved ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
          </button>
          <Link
            to={detailsPath}
            aria-label={`More details about ${title}`}
            title="Details"
            className="pointer-events-auto ml-auto flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/60 bg-black/50 text-white transition hover:scale-110 hover:border-white"
          >
            <Info className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {typeof progress === 'number' && (
        <div className="h-1 bg-white/20" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Watch progress">
          <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="space-y-1 p-2.5">
        <h3 className="truncate text-sm font-semibold" title={title}>
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-white/60">
          {rating ? (
            <span className="flex items-center gap-1 font-medium text-emerald-400">
              <Star className="h-3 w-3" fill="currentColor" aria-hidden="true" />
              {rating}
            </span>
          ) : (
            <span>Not rated</span>
          )}
          <span aria-hidden="true">•</span>
          <span>{getYear(item)}</span>
          <span className="ml-auto rounded border border-white/20 px-1 text-[10px] uppercase tracking-wide">
            {type === 'tv' ? 'TV' : 'Movie'}
          </span>
        </div>
      </div>
    </article>
  );
}
