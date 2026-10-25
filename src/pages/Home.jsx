import Hero from '../components/Hero.jsx';
import MovieRow from '../components/MovieRow.jsx';
import useFetch from '../hooks/useFetch.js';
import usePageTitle from '../hooks/usePageTitle.js';
import { useRecentlyViewed } from '../context/RecentlyViewedContext.jsx';
import {
  getNowPlayingMovies,
  getPopularMovies,
  getPopularTV,
  getTopRatedMovies,
  getTrending,
  getUpcomingMovies,
} from '../services/tmdb.js';
import { pseudoProgress } from '../utils/helpers.js';

export default function Home() {
  usePageTitle('Home');

  const { items: recentlyViewed } = useRecentlyViewed();

  // Same request as the "Trending Now" row (the service caches it, so it's only sent once).
  const { data: trending } = useFetch(() => getTrending('all', 'week'), []);
  // "Continue Watching" is a mock: trending titles with fake progress bars.
  const continueWatching = (trending || []).slice(3, 11);

  return (
    <main>
      <Hero />

      <div className="relative z-10 -mt-16 space-y-2 sm:-mt-28">
        {recentlyViewed.length > 0 && <MovieRow title="Recently Viewed" items={recentlyViewed} />}

        <MovieRow title="Trending Now" fetcher={() => getTrending('all', 'week')} />

        {continueWatching.length > 0 && (
          <MovieRow title="Continue Watching" items={continueWatching} getProgress={(item) => pseudoProgress(item.id)} />
        )}

        <MovieRow title="Popular Movies" fetcher={getPopularMovies} mediaType="movie" />
        <MovieRow title="Top Rated" fetcher={getTopRatedMovies} mediaType="movie" />
        <MovieRow title="Now Playing" fetcher={getNowPlayingMovies} mediaType="movie" />
        <MovieRow title="Upcoming" fetcher={getUpcomingMovies} mediaType="movie" />
        <MovieRow title="Popular TV Shows" fetcher={getPopularTV} mediaType="tv" />
      </div>
    </main>
  );
}
