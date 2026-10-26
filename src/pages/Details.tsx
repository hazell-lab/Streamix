import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Check, Clock, Play, Plus, Star, Tv } from 'lucide-react';
import LazyImage from '../components/LazyImage';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import MovieRow from '../components/MovieRow';
import useFetch from '../hooks/useFetch';
import usePageTitle from '../hooks/usePageTitle';
import { useMyList } from '../context/MyListContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { useTrailer } from '../context/TrailerContext';
import { getDetails } from '../services/tmdb';
import { formatDate, formatRuntime, getRating, getReleaseDate, getTitle, getYear, imageUrl } from '../utils/helpers';
import type { MediaType } from '../types/tmdb';

interface Fact {
  label: string;
  value: string | number | null | undefined;
}

// One page for both /movie/:id and /tv/:id (the route passes `mediaType`).
export default function Details({ mediaType }: { mediaType: MediaType }) {
  // Route params are always strings (and could be missing), so default to ''.
  const { id = '' } = useParams<{ id: string }>();
  const { data: details, loading, error, refetch } = useFetch(() => getDetails(mediaType, id), [mediaType, id]);

  const { openTrailer } = useTrailer();
  const { isInList, toggle } = useMyList();
  const { addRecent } = useRecentlyViewed();

  usePageTitle(details ? getTitle(details) : '');

  // Remember this title for the "Recently Viewed" row on the home page.
  useEffect(() => {
    if (details) addRecent(details, mediaType);
  }, [details, mediaType, addRecent]);

  if (loading) return <main><LoadingSkeleton variant="details" /></main>;

  if (error) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center pt-20">
        <ErrorMessage
          title={mediaType === 'tv' ? "Couldn't load this show" : "Couldn't load this movie"}
          message={error}
          onRetry={refetch}
        />
        <Link to="/" className="btn btn-secondary mt-2">Back to Home</Link>
      </main>
    );
  }

  if (!details) return null;

  const isTV = mediaType === 'tv';
  const title = getTitle(details);
  const rating = getRating(details);
  const saved = isInList(details.id, mediaType);
  const genres = details.genres || [];
  const cast = (details.credits?.cast || []).slice(0, 15);
  const seasons = (details.seasons || []).filter((season) => season.season_number > 0);
  const similar = details.similar?.results || [];
  const recommendations = details.recommendations?.results || [];
  const browsePath = isTV ? '/tv' : '/movies';

  const length = isTV
    ? details.number_of_seasons
      ? `${details.number_of_seasons} season${details.number_of_seasons === 1 ? '' : 's'}`
      : null
    : formatRuntime(details.runtime);

  const allFacts: (Fact | null)[] = [
    { label: isTV ? 'First aired' : 'Release date', value: formatDate(getReleaseDate(details)) },
    isTV ? { label: 'Episodes', value: details.number_of_episodes } : { label: 'Runtime', value: formatRuntime(details.runtime) },
    { label: 'Status', value: details.status },
    { label: 'Language', value: details.original_language ? details.original_language.toUpperCase() : null },
    isTV ? { label: 'Network', value: details.networks?.map((network) => network.name).join(', ') } : null,
    isTV ? { label: 'Created by', value: details.created_by?.map((person) => person.name).join(', ') } : null,
  ];
  // Type guard: drops the nulls and empty values, and tells TypeScript the rest are Facts.
  const facts = allFacts.filter((fact): fact is Fact => Boolean(fact?.value));

  return (
    <main>
      {/* ---------- Backdrop + main info ---------- */}
      <section className="relative isolate overflow-hidden">
        {details.backdrop_path && (
          <LazyImage
            src={imageUrl(details.backdrop_path, 'w1280')}
            alt=""
            className="absolute inset-0 -z-10"
            imgClassName="object-top opacity-60"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-surface via-surface/80 to-surface/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-surface via-surface/40 to-black/50" />

        <div className="page-x grid gap-8 pb-12 pt-28 sm:pt-36 md:grid-cols-[260px,1fr] md:gap-10 lg:grid-cols-[300px,1fr]">
          <div className="mx-auto w-44 sm:w-56 md:w-full">
            <LazyImage
              src={imageUrl(details.poster_path, 'w500')}
              alt={`${title} poster`}
              className="aspect-[2/3] rounded-xl shadow-2xl shadow-black ring-1 ring-white/10"
              loading="eager"
            />
          </div>

          <div className="space-y-5">
            <div>
              <h1 className="font-display text-5xl leading-none tracking-wide sm:text-6xl lg:text-7xl">{title}</h1>
              {details.tagline && <p className="mt-2 text-base italic text-white/60">{details.tagline}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
              {rating && (
                <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <Star className="h-4 w-4" fill="currentColor" aria-hidden="true" />
                  {rating}
                  <span className="font-normal text-white/50">
                    ({(details.vote_count || 0).toLocaleString()} votes)
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-white/50" aria-hidden="true" />
                {getYear(details)}
              </span>
              {length && (
                <span className="flex items-center gap-1.5">
                  {isTV ? <Tv className="h-4 w-4 text-white/50" aria-hidden="true" /> : <Clock className="h-4 w-4 text-white/50" aria-hidden="true" />}
                  {length}
                </span>
              )}
            </div>

            {genres.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Genres">
                {genres.map((genre) => (
                  <li key={genre.id}>
                    <Link
                      to={`${browsePath}?genre=${genre.id}`}
                      className="inline-block rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:border-brand hover:bg-brand/20 hover:text-white"
                    >
                      {genre.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <p className="max-w-3xl text-base leading-relaxed text-white/85">
              {details.overview || 'No overview is available for this title yet.'}
            </p>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => openTrailer(details, mediaType)} className="btn btn-primary">
                <Play className="h-5 w-5" fill="currentColor" aria-hidden="true" />
                Watch Trailer
              </button>
              <button
                type="button"
                onClick={() => toggle(details, mediaType)}
                aria-pressed={saved}
                className={`btn ${saved ? 'btn-brand' : 'btn-secondary'}`}
              >
                {saved ? <Check className="h-5 w-5" aria-hidden="true" /> : <Plus className="h-5 w-5" aria-hidden="true" />}
                {saved ? 'In My List' : 'Add to My List'}
              </button>
            </div>

            {facts.length > 0 && (
              <dl className="grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5 text-sm sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs uppercase tracking-wider text-white/40">{fact.label}</dt>
                    <dd className="mt-0.5 font-medium text-white/90">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </section>

      {/* ---------- Cast ---------- */}
      {cast.length > 0 && (
        <section className="py-4" aria-label="Cast">
          <h2 className="page-x mb-1 text-lg font-bold sm:text-xl md:text-2xl">Cast</h2>
          <ul className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-4 sm:px-8 lg:px-14">
            {cast.map((person) => (
              <li key={`${person.id}-${person.credit_id || person.character}`} className="w-28 shrink-0 sm:w-32">
                <LazyImage
                  src={imageUrl(person.profile_path, 'w185')}
                  alt={person.name}
                  className="aspect-[2/3] rounded-lg ring-1 ring-white/10"
                />
                <p className="mt-2 truncate text-sm font-semibold" title={person.name}>{person.name}</p>
                {person.character && (
                  <p className="truncate text-xs text-white/50" title={person.character}>{person.character}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Seasons (TV only) ---------- */}
      {isTV && seasons.length > 0 && (
        <section className="py-4" aria-label="Seasons">
          <h2 className="page-x mb-1 text-lg font-bold sm:text-xl md:text-2xl">Seasons</h2>
          <ul className="no-scrollbar flex gap-4 overflow-x-auto px-4 py-4 sm:px-8 lg:px-14">
            {seasons.map((season) => (
              <li key={season.id} className="w-36 shrink-0 sm:w-40">
                <LazyImage
                  src={imageUrl(season.poster_path, 'w342')}
                  alt={`${season.name} poster`}
                  className="aspect-[2/3] rounded-lg ring-1 ring-white/10"
                />
                <p className="mt-2 truncate text-sm font-semibold">{season.name}</p>
                <p className="text-xs text-white/50">
                  {season.episode_count} episode{season.episode_count === 1 ? '' : 's'}
                  {season.air_date ? ` • ${season.air_date.slice(0, 4)}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Similar + recommendations ---------- */}
      <div className="space-y-2">
        <MovieRow title={isTV ? 'More Shows Like This' : 'More Like This'} items={similar} mediaType={mediaType} />
        <MovieRow title="Recommended for You" items={recommendations} mediaType={mediaType} />
      </div>
    </main>
  );
}
