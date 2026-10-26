import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Info, Play, Plus, Star } from 'lucide-react';
import LazyImage from './LazyImage';
import LoadingSkeleton from './LoadingSkeleton';
import ErrorMessage from './ErrorMessage';
import useFetch from '../hooks/useFetch';
import { useMyList } from '../context/MyListContext';
import { useTrailer } from '../context/TrailerContext';
import { getGenreMap, getTrending } from '../services/tmdb';
import { getMediaType, getRating, getTitle, getYear, imageUrl } from '../utils/helpers';

// Big cinematic banner featuring a random trending title.
export default function Hero() {
  const { data, loading, error, refetch } = useFetch(() => getTrending('all', 'day'), []);
  const { data: genreMap } = useFetch(getGenreMap, []);
  const { openTrailer } = useTrailer();
  const { isInList, toggle } = useMyList();

  const featured = useMemo(() => {
    const pool = (data || []).filter((item) => item.backdrop_path && item.overview);
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [data]);

  if (loading) return <LoadingSkeleton variant="hero" />;

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-20">
        <ErrorMessage title="Couldn't load the featured title" message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!featured) return null;

  const type = getMediaType(featured, 'movie');
  const title = getTitle(featured);
  const rating = getRating(featured);
  const saved = isInList(featured.id, type);
  const genres = (featured.genre_ids || []).map((id) => genreMap?.[id]).filter(Boolean).slice(0, 3);

  return (
    <section className="relative h-[75vh] min-h-[500px] w-full overflow-hidden sm:h-[85vh]" aria-label="Featured title">
      <LazyImage
        src={imageUrl(featured.backdrop_path, 'w1280')}
        alt=""
        className="absolute inset-0"
        imgClassName="object-top"
        loading="eager"
        fetchpriority="high"
      />

      {/* Cinematic gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/40" />

      <div className="page-x absolute inset-x-0 bottom-24 sm:bottom-36">
        <div className="max-w-2xl animate-page-in space-y-4">
          <span className="inline-block rounded bg-brand/90 px-2 py-1 text-xs font-bold uppercase tracking-widest">
            Trending today
          </span>

          <h1 className="font-display text-5xl leading-none tracking-wide drop-shadow-lg sm:text-7xl lg:text-8xl">
            {title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
            {rating && (
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <Star className="h-4 w-4" fill="currentColor" aria-hidden="true" />
                {rating}
              </span>
            )}
            <span>{getYear(featured)}</span>
            <span className="rounded border border-white/30 px-1.5 text-xs uppercase">
              {type === 'tv' ? 'TV Series' : 'Movie'}
            </span>
            {genres.length > 0 && <span className="text-white/60">{genres.join(' • ')}</span>}
          </div>

          <p className="line-clamp-3 max-w-xl text-sm text-white/80 drop-shadow sm:text-base lg:text-lg">
            {featured.overview}
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button type="button" onClick={() => openTrailer(featured, type)} className="btn btn-primary">
              <Play className="h-5 w-5" fill="currentColor" aria-hidden="true" />
              Play
            </button>
            <Link to={`/${type}/${featured.id}`} className="btn btn-secondary">
              <Info className="h-5 w-5" aria-hidden="true" />
              More Info
            </Link>
            <button
              type="button"
              onClick={() => toggle(featured, type)}
              aria-pressed={saved}
              aria-label={saved ? `Remove ${title} from My List` : `Add ${title} to My List`}
              className="btn btn-secondary hidden sm:inline-flex"
            >
              {saved ? <Check className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
              My List
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
