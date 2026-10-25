export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Shared width classes so skeleton rows and real rows line up perfectly.
export const ROW_CARD_WIDTH = 'w-[44vw] sm:w-[30vw] md:w-[22vw] lg:w-[17vw] xl:w-[14vw]';

export function imageUrl(path, size = 'w500') {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}

export function getTitle(item) {
  return item?.title || item?.name || item?.original_title || item?.original_name || 'Untitled';
}

export function getReleaseDate(item) {
  return item?.release_date || item?.first_air_date || '';
}

export function getYear(item) {
  const date = getReleaseDate(item);
  return date ? date.slice(0, 4) : 'TBA';
}

export function getRating(item) {
  const value = Number(item?.vote_average);
  return Number.isFinite(value) && value > 0 ? value.toFixed(1) : null;
}

export function getMediaType(item, fallback = 'movie') {
  const type = item?.media_type;
  return type === 'tv' || type === 'movie' ? type : fallback;
}

export function hasImage(item) {
  return Boolean(item?.poster_path || item?.backdrop_path);
}

export function formatRuntime(minutes) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours ? `${hours}h ${mins}m` : `${mins}m`;
}

export function formatDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Keep only the fields we need before saving to LocalStorage.
export function toListItem(item, mediaType) {
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

// Choose the best YouTube video for the trailer modal.
export function pickTrailer(videos = []) {
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
export function pseudoProgress(id) {
  return (((Number(id) || 0) * 37) % 70) + 15;
}

export function uniqueById(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.media_type || ''}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
