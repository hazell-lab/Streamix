import { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import TrailerModal from './components/TrailerModal.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import MissingApiKey from './components/MissingApiKey.jsx';
import LoadingSkeleton from './components/LoadingSkeleton.jsx';
import Home from './pages/Home.jsx';
import { hasApiKey } from './services/tmdb.js';

// Home is the landing page, so it ships in the main bundle. Every other page is
// split into its own chunk and only downloaded the first time it is visited.
const Movies = lazy(() => import('./pages/Movies.jsx'));
const TVShows = lazy(() => import('./pages/TVShows.jsx'));
const Details = lazy(() => import('./pages/Details.jsx'));
const Search = lazy(() => import('./pages/Search.jsx'));
const MyList = lazy(() => import('./pages/MyList.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function PageFallback() {
  return (
    <div className="page-x pt-28">
      <LoadingSkeleton variant="grid" />
    </div>
  );
}

export default function App() {
  const location = useLocation();

  if (!hasApiKey) return <MissingApiKey />;

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />

      {/* Re-keying on the pathname replays the fade-in animation for every page change. */}
      <div key={location.pathname} className="flex-1 animate-page-in">
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/movie/:id" element={<Details mediaType="movie" />} />
            <Route path="/tv/:id" element={<Details mediaType="tv" />} />
            <Route path="/search" element={<Search />} />
            <Route path="/my-list" element={<MyList />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>

      <Footer />
      <TrailerModal />
      <ToastContainer />
      <ScrollToTop />
    </div>
  );
}
