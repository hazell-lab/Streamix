// Shapes of the TMDB data this app uses. TMDB returns many more fields;
// we only describe the ones the UI actually reads.

export type MediaType = 'movie' | 'tv';

export type SortOption = 'popularity.desc' | 'vote_average.desc';

// Poster / backdrop / profile widths that TMDB serves.
export type ImageSize = 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original';

export interface Genre {
  id: number;
  name: string;
}

// One movie or TV show as it appears in lists, rows and search results.
// Movies have `title` / `release_date`; TV shows have `name` / `first_air_date`.
export interface MediaItem {
  id: number;
  media_type?: MediaType | 'person';
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

// The trimmed-down copy of a title that we save to LocalStorage.
export interface ListItem {
  id: number;
  media_type: MediaType;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface Video {
  key: string;
  site: string;
  type: string;
  official?: boolean;
  name?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character?: string;
  credit_id?: string;
  profile_path: string | null;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
}

interface NamedEntity {
  id: number;
  name: string;
}

// The full details page response (with videos, credits, similar and
// recommendations appended in the same request).
export interface MediaDetails extends MediaItem {
  media_type: MediaType;
  tagline?: string;
  genres?: Genre[];
  runtime?: number | null;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  original_language?: string;
  networks?: NamedEntity[];
  created_by?: NamedEntity[];
  seasons?: Season[];
  credits?: { cast: CastMember[] };
  similar?: { results: MediaItem[] };
  recommendations?: { results: MediaItem[] };
}

// A page of results, as returned by discover and search.
export interface PagedResults<T> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}

// Genre id -> genre name, e.g. { 28: 'Action' }.
export type GenreMap = Record<number, string>;
