import axios, { type AxiosError } from 'axios';
import type {
  Genre,
  GenreMap,
  MediaDetails,
  MediaItem,
  MediaType,
  PagedResults,
  SortOption,
  Video,
} from '../types/tmdb';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// True only when a real key has been provided in .env
export const hasApiKey = Boolean(API_KEY) && API_KEY !== 'your_tmdb_api_key_here';

// An Error that also remembers the HTTP status, so callers can react to e.g. 404.
export class TmdbError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'TmdbError';
    this.status = status;
  }
}

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 15000,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
});

// Turn low-level axios errors into friendly messages the UI can display.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ status_message?: string }>) => {
    let message = 'Something went wrong while contacting TMDB.';

    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) message = 'Invalid TMDB API key. Check the VITE_TMDB_API_KEY value in your .env file.';
      else if (status === 404) message = 'We could not find what you were looking for.';
      else if (status === 429) message = 'Too many requests. Please wait a moment and try again.';
      else if (data?.status_message) message = data.status_message;
    } else if (error.code === 'ECONNABORTED') {
      message = 'The request timed out. Please try again.';
    } else if (error.request) {
      message = 'Network error. Please check your internet connection.';
    }

    return Promise.reject(new TmdbError(message, error.response?.status));
  },
);

type QueryParams = Record<string, string | number | boolean | undefined>;

// Tiny in-memory cache: identical requests during a session are only sent once.
const cache = new Map<string, Promise<unknown>>();

// Generic GET: the caller says what shape the JSON has, e.g. request<{ genres: Genre[] }>(...)
function request<T>(path: string, params: QueryParams = {}): Promise<T> {
  const key = `${path}?${JSON.stringify(params)}`;
  let promise = cache.get(key) as Promise<T> | undefined;
  if (!promise) {
    promise = api.get<T>(path, { params }).then((response) => response.data);
    // Don't cache failures so "Try again" really retries.
    promise.catch(() => cache.delete(key));
    cache.set(key, promise);
  }
  return promise;
}

// Endpoints like /movie/popular don't include media_type, so we add it ourselves.
function tag(results: MediaItem[] | undefined, type?: MediaType): MediaItem[] {
  return (results || []).map((item) => ({ ...item, media_type: item.media_type || type }));
}

async function getList(path: string, type?: MediaType): Promise<MediaItem[]> {
  const data = await request<PagedResults<MediaItem>>(path);
  return tag(data.results, type);
}

/* ---------- Lists ---------- */

export const getTrending = (type: MediaType | 'all' = 'all', timeWindow: 'day' | 'week' = 'week') =>
  getList(`/trending/${type}/${timeWindow}`, type === 'all' ? undefined : type);

export const getPopularMovies = () => getList('/movie/popular', 'movie');
export const getTopRatedMovies = () => getList('/movie/top_rated', 'movie');
export const getNowPlayingMovies = () => getList('/movie/now_playing', 'movie');
export const getUpcomingMovies = () => getList('/movie/upcoming', 'movie');

export const getPopularTV = () => getList('/tv/popular', 'tv');
export const getTopRatedTV = () => getList('/tv/top_rated', 'tv');
export const getAiringTV = () => getList('/tv/on_the_air', 'tv');

/* ---------- Details ---------- */

export async function getDetails(type: MediaType, id: string | number): Promise<MediaDetails> {
  const data = await request<MediaDetails>(`/${type}/${id}`, {
    append_to_response: 'videos,credits,similar,recommendations',
  });
  return {
    ...data,
    media_type: type,
    similar: { ...data.similar, results: tag(data.similar?.results, type) },
    recommendations: { ...data.recommendations, results: tag(data.recommendations?.results, type) },
  };
}

export async function getVideos(type: MediaType, id: number): Promise<Video[]> {
  const data = await request<{ results?: Video[] }>(`/${type}/${id}/videos`);
  return data.results || [];
}

/* ---------- Genres & discover ---------- */

export async function getGenres(type: MediaType): Promise<Genre[]> {
  const data = await request<{ genres?: Genre[] }>(`/genre/${type}/list`);
  return data.genres || [];
}

let genreMapPromise: Promise<GenreMap> | null = null;

// { 28: 'Action', 12: 'Adventure', ... } for both movies and TV.
export function getGenreMap(): Promise<GenreMap> {
  if (!genreMapPromise) {
    genreMapPromise = Promise.all([getGenres('movie'), getGenres('tv')])
      .then(([movieGenres, tvGenres]) => {
        const map: GenreMap = {};
        [...movieGenres, ...tvGenres].forEach((genre) => {
          map[genre.id] = genre.name;
        });
        return map;
      })
      .catch((error: unknown) => {
        genreMapPromise = null;
        throw error;
      });
  }
  return genreMapPromise;
}

interface DiscoverOptions {
  genreId?: number | null;
  sortBy?: SortOption;
  page?: number;
}

export async function discoverMedia(
  type: MediaType,
  { genreId, sortBy = 'popularity.desc', page = 1 }: DiscoverOptions = {},
): Promise<PagedResults<MediaItem>> {
  const data = await request<PagedResults<MediaItem>>(`/discover/${type}`, {
    with_genres: genreId ?? undefined,
    sort_by: sortBy,
    page,
    include_adult: false,
    // Avoid obscure titles with a single 10/10 vote when sorting by rating.
    ...(sortBy.startsWith('vote_average') ? { 'vote_count.gte': 300 } : {}),
  });
  return {
    page: data.page,
    total_pages: Math.min(data.total_pages || 1, 500),
    total_results: data.total_results || 0,
    results: tag(data.results, type),
  };
}

/* ---------- Search ---------- */

export async function searchMulti(query: string, page = 1): Promise<PagedResults<MediaItem>> {
  const data = await request<PagedResults<MediaItem>>('/search/multi', { query, page, include_adult: false });
  return {
    page: data.page,
    total_pages: Math.min(data.total_pages || 1, 500),
    total_results: data.total_results || 0,
    results: (data.results || []).filter((item) => item.media_type === 'movie' || item.media_type === 'tv'),
  };
}
