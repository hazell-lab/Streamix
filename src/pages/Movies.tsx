import BrowsePage, { type BrowseRow } from './BrowsePage';
import { getPopularMovies, getTopRatedMovies, getUpcomingMovies } from '../services/tmdb';

const ROWS: BrowseRow[] = [
  { title: 'Popular', fetcher: getPopularMovies },
  { title: 'Top Rated', fetcher: getTopRatedMovies },
  { title: 'Upcoming', fetcher: getUpcomingMovies },
];

export default function Movies() {
  return <BrowsePage mediaType="movie" title="Movies" rows={ROWS} />;
}
