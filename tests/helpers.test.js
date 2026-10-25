// Unit tests for the pure helper functions. Run with: npm test
// Uses Node's built-in test runner, so no extra packages are needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRuntime,
  getMediaType,
  getRating,
  getTitle,
  getYear,
  imageUrl,
  pickTrailer,
  pseudoProgress,
  toListItem,
  uniqueById,
} from '../src/utils/helpers.js';

test('imageUrl builds a TMDB image URL, or null when there is no path', () => {
  assert.equal(imageUrl('/abc.jpg'), 'https://image.tmdb.org/t/p/w500/abc.jpg');
  assert.equal(imageUrl('/abc.jpg', 'w1280'), 'https://image.tmdb.org/t/p/w1280/abc.jpg');
  assert.equal(imageUrl(null), null);
});

test('getTitle works for movies, TV shows and missing data', () => {
  assert.equal(getTitle({ title: 'Dune' }), 'Dune');
  assert.equal(getTitle({ name: 'Severance' }), 'Severance');
  assert.equal(getTitle({ original_name: 'Squid Game' }), 'Squid Game');
  assert.equal(getTitle(null), 'Untitled');
});

test('getYear reads release_date or first_air_date', () => {
  assert.equal(getYear({ release_date: '2021-10-22' }), '2021');
  assert.equal(getYear({ first_air_date: '2022-02-18' }), '2022');
  assert.equal(getYear({}), 'TBA');
});

test('getRating rounds to one decimal and hides zero ratings', () => {
  assert.equal(getRating({ vote_average: 7.849 }), '7.8');
  assert.equal(getRating({ vote_average: 0 }), null);
  assert.equal(getRating({}), null);
});

test('getMediaType only accepts movie or tv', () => {
  assert.equal(getMediaType({ media_type: 'tv' }), 'tv');
  assert.equal(getMediaType({ media_type: 'person' }), 'movie');
  assert.equal(getMediaType({}, 'tv'), 'tv');
});

test('formatRuntime turns minutes into "Xh Ym"', () => {
  assert.equal(formatRuntime(155), '2h 35m');
  assert.equal(formatRuntime(45), '45m');
  assert.equal(formatRuntime(0), null);
});

test('pickTrailer prefers official YouTube trailers', () => {
  const videos = [
    { site: 'Vimeo', type: 'Trailer', key: 'v1', official: true },
    { site: 'YouTube', type: 'Teaser', key: 't1' },
    { site: 'YouTube', type: 'Trailer', key: 'y1', official: false },
    { site: 'YouTube', type: 'Trailer', key: 'y2', official: true },
  ];
  assert.equal(pickTrailer(videos).key, 'y2');
  assert.equal(pickTrailer(videos.slice(0, 2)).key, 't1');
  assert.equal(pickTrailer([]), null);
});

test('pseudoProgress is stable and stays between 15 and 84', () => {
  assert.equal(pseudoProgress(550), pseudoProgress(550));
  for (const id of [1, 42, 550, 1399, 99999]) {
    const value = pseudoProgress(id);
    assert.ok(value >= 15 && value <= 84, `${id} -> ${value}`);
  }
});

test('uniqueById removes duplicates but keeps a movie and show with the same id', () => {
  const items = [
    { id: 1, media_type: 'movie' },
    { id: 1, media_type: 'movie' },
    { id: 1, media_type: 'tv' },
  ];
  assert.equal(uniqueById(items).length, 2);
});

test('toListItem keeps only the fields saved to LocalStorage', () => {
  const saved = toListItem({ id: 7, title: 'Up', overview: 'long text', poster_path: '/p.jpg' }, 'movie');
  assert.equal(saved.media_type, 'movie');
  assert.equal(saved.poster_path, '/p.jpg');
  assert.equal(saved.backdrop_path, null);
  assert.equal('overview' in saved, false);
});
