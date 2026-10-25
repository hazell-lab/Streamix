import BrowsePage from './BrowsePage.jsx';
import { getPopularMovies, getTopRatedMovies, getUpcomingMovies } from '../services/tmdb.js';

const ROWS = [
  { title: 'Popular', fetcher: getPopularMovies },
  { title: 'Top Rated', fetcher: getTopRatedMovies },
  { title: 'Upcoming', fetcher: getUpcomingMovies },
];

export default function Movies() {
  return <BrowsePage mediaType="movie" title="Movies" rows={ROWS} />;
}
