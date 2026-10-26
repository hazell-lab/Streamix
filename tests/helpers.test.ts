// Unit tests for the pure helper functions. Run with: npm test (Vitest).
import { expect, test } from 'vitest';
import {
  formatRuntime,
  getErrorMessage,
  getMediaType,
  getRating,
  getTitle,
  getYear,
  imageUrl,
  isListItem,
  pickTrailer,
  pseudoProgress,
  toListItem,
  uniqueById,
} from '../src/utils/helpers';

test('imageUrl builds a TMDB image URL, or null when there is no path', () => {
  expect(imageUrl('/abc.jpg')).toBe('https://image.tmdb.org/t/p/w500/abc.jpg');
  expect(imageUrl('/abc.jpg', 'w1280')).toBe('https://image.tmdb.org/t/p/w1280/abc.jpg');
  expect(imageUrl(null)).toBe(null);
});

test('getTitle works for movies, TV shows and missing data', () => {
  expect(getTitle({ title: 'Dune' })).toBe('Dune');
  expect(getTitle({ name: 'Severance' })).toBe('Severance');
  expect(getTitle({ original_name: 'Squid Game' })).toBe('Squid Game');
  expect(getTitle(null)).toBe('Untitled');
});

test('getYear reads release_date or first_air_date', () => {
  expect(getYear({ release_date: '2021-10-22' })).toBe('2021');
  expect(getYear({ first_air_date: '2022-02-18' })).toBe('2022');
  expect(getYear({})).toBe('TBA');
});

test('getRating rounds to one decimal and hides zero ratings', () => {
  expect(getRating({ vote_average: 7.849 })).toBe('7.8');
  expect(getRating({ vote_average: 0 })).toBe(null);
  expect(getRating({})).toBe(null);
});

test('getMediaType only accepts movie or tv', () => {
  expect(getMediaType({ media_type: 'tv' })).toBe('tv');
  expect(getMediaType({ media_type: 'person' })).toBe('movie');
  expect(getMediaType({}, 'tv')).toBe('tv');
});

test('formatRuntime turns minutes into "Xh Ym"', () => {
  expect(formatRuntime(155)).toBe('2h 35m');
  expect(formatRuntime(45)).toBe('45m');
  expect(formatRuntime(0)).toBe(null);
});

test('pickTrailer prefers official YouTube trailers', () => {
  const videos = [
    { site: 'Vimeo', type: 'Trailer', key: 'v1', official: true },
    { site: 'YouTube', type: 'Teaser', key: 't1' },
    { site: 'YouTube', type: 'Trailer', key: 'y1', official: false },
    { site: 'YouTube', type: 'Trailer', key: 'y2', official: true },
  ];
  expect(pickTrailer(videos)?.key).toBe('y2');
  expect(pickTrailer(videos.slice(0, 2))?.key).toBe('t1');
  expect(pickTrailer([])).toBe(null);
});

test('pseudoProgress is stable and stays between 15 and 84', () => {
  expect(pseudoProgress(550)).toBe(pseudoProgress(550));
  for (const id of [1, 42, 550, 1399, 99999]) {
    const value = pseudoProgress(id);
    expect(value).toBeGreaterThanOrEqual(15);
    expect(value).toBeLessThanOrEqual(84);
  }
});

test('uniqueById removes duplicates but keeps a movie and show with the same id', () => {
  const items = [
    { id: 1, media_type: 'movie' },
    { id: 1, media_type: 'movie' },
    { id: 1, media_type: 'tv' },
  ];
  expect(uniqueById(items).length).toBe(2);
});

test('toListItem keeps only the fields saved to LocalStorage', () => {
  const saved = toListItem({ id: 7, title: 'Up', overview: 'long text', poster_path: '/p.jpg' }, 'movie');
  expect(saved.media_type).toBe('movie');
  expect(saved.poster_path).toBe('/p.jpg');
  expect(saved.backdrop_path).toBe(null);
  expect('overview' in saved).toBe(false);
});

test('isListItem accepts saved titles and rejects anything else in LocalStorage', () => {
  expect(isListItem({ id: 7, media_type: 'movie' })).toBe(true);
  expect(isListItem({ id: 7, media_type: 'person' })).toBe(false);
  expect(isListItem({ id: '7', media_type: 'tv' })).toBe(false);
  expect(isListItem(null)).toBe(false);
  expect(isListItem('hello')).toBe(false);
});

test('getErrorMessage reads Error messages and falls back for anything else', () => {
  expect(getErrorMessage(new Error('Network error'))).toBe('Network error');
  expect(getErrorMessage('oops')).toBe('Something went wrong.');
  expect(getErrorMessage(undefined, 'Custom fallback')).toBe('Custom fallback');
});
