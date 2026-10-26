import type { ImageSize, ListItem, MediaItem, MediaType, Video } from '../types/tmdb';

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Shared width classes so skeleton rows and real rows line up perfectly.
export const ROW_CARD_WIDTH = 'w-[44vw] sm:w-[30vw] md:w-[22vw] lg:w-[17vw] xl:w-[14vw]';

// Helpers that read a title accept partial or missing data, because TMDB
// fields are often absent.
type MaybeItem = Partial<MediaItem> | null | undefined;

export function imageUrl(path: string | null | undefined, size: ImageSize = 'w500'): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export function getTitle(item: MaybeItem): string {
  return item?.title || item?.name || item?.original_title || item?.original_name || 'Untitled';
}

export function getReleaseDate(item: MaybeItem): string {
  return item?.release_date || item?.first_air_date || '';
}

export function getYear(item: MaybeItem): string {
  const date = getReleaseDate(item);
  return date ? date.slice(0, 4) : 'TBA';
}

export function getRating(item: MaybeItem): string | null {
  const value = Number(item?.vote_average);
  return Number.isFinite(value) && value > 0 ? value.toFixed(1) : null;
}

export function getMediaType(item: MaybeItem, fallback: MediaType = 'movie'): MediaType {
  const type = item?.media_type;
  return type === 'tv' || type === 'movie' ? type : fallback;
}

export function hasImage(item: MaybeItem): boolean {
  return Boolean(item?.poster_path || item?.backdrop_path);
}

export function formatRuntime(minutes: number | null | undefined): string | null {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

export function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Keep only the fields we need before saving to LocalStorage.
export function toListItem(item: MediaItem, mediaType?: MediaType): ListItem {
  return {
    id: item.id,
    media_type: getMediaType(item, mediaType),
    title: item.title,
    name: item.name,
    poster_path: item.poster_path ?? null,
    backdrop_path: item.backdrop_path ?? null,
    vote_average: item.vote_average ?? 0,
    release_date: item.release_date,
    first_air_date: item.first_air_date,
  };
}

// Type guard: LocalStorage can contain anything, so check each saved entry
// before treating it as a ListItem.
export function isListItem(value: unknown): value is ListItem {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Partial<ListItem>;
  return typeof entry.id === 'number' && (entry.media_type === 'movie' || entry.media_type === 'tv');
}

// Choose the best YouTube video for the trailer modal.
export function pickTrailer(videos: Video[] = []): Video | null {
  const youtube = videos.filter((video) => video.site === 'YouTube' && video.key);
  return (
    youtube.find((video) => video.type === 'Trailer' && video.official) ||
    youtube.find((video) => video.type === 'Trailer') ||
    youtube.find((video) => video.type === 'Teaser') ||
    youtube[0] ||
    null
  );
}

// Deterministic fake progress (15-84%) for the "Continue Watching" mock row.
export function pseudoProgress(id: number | string): number {
  return (((Number(id) || 0) * 37) % 70) + 15;
}

// Generic: works for any list of objects with an `id` (and optional media_type),
// and returns the same type it was given.
export function uniqueById<T extends { id: number; media_type?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.media_type || ''}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// In TypeScript a caught error is `unknown` (anything can be thrown),
// so narrow it before reading `.message`.
export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
