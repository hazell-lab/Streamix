import BrowsePage from './BrowsePage.jsx';
import { getAiringTV, getPopularTV, getTopRatedTV } from '../services/tmdb.js';

const ROWS = [
  { title: 'Popular', fetcher: getPopularTV },
  { title: 'Top Rated', fetcher: getTopRatedTV },
  { title: 'Currently Airing', fetcher: getAiringTV },
];

export default function TVShows() {
  return <BrowsePage mediaType="tv" title="TV Shows" rows={ROWS} />;
}
