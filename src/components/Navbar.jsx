import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Search, Trash2, User, X, Bookmark } from 'lucide-react';
import useScrolled from '../hooks/useScrolled.js';
import useClickOutside from '../hooks/useClickOutside.js';
import { useMyList } from '../context/MyListContext.jsx';
import { useRecentlyViewed } from '../context/RecentlyViewedContext.jsx';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/movies', label: 'Movies' },
  { to: '/tv', label: 'TV Shows' },
  { to: '/my-list', label: 'My List' },
];

const linkClass = ({ isActive }) =>
  `text-sm transition-colors duration-200 hover:text-white ${
    isActive ? 'font-semibold text-white' : 'text-white/70'
  }`;

export default function Navbar() {
  const scrolled = useScrolled(30);
  const location = useLocation();
  const { items: myList } = useMyList();
  const { items: recent, clearRecent } = useRecentlyViewed();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const closeProfile = useCallback(() => setProfileOpen(false), []);
  useClickOutside(profileRef, closeProfile, profileOpen);

  // Close menus whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Escape closes whichever menu is open.
  useEffect(() => {
    if (!mobileOpen && !profileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, profileOpen]);

  const solid = scrolled || mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid
          ? 'bg-surface/95 shadow-lg shadow-black/50 backdrop-blur-md'
          : 'bg-gradient-to-b from-black/80 via-black/30 to-transparent'
      }`}
    >
      <nav className="page-x flex h-16 items-center gap-6 sm:h-[72px]" aria-label="Main navigation">
        <Link
          to="/"
          className="font-display text-3xl tracking-[0.08em] text-brand transition hover:text-brand-glow sm:text-4xl"
          aria-label="Streamix home"
        >
          STREAMIX
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink to={link.to} end={link.end} className={linkClass}>
                {link.label}
                {link.to === '/my-list' && myList.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {myList.length}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <Link
            to="/search"
            aria-label="Search"
            className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Profile menu"
              className="flex items-center gap-1 rounded-md p-1 transition hover:bg-white/10"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand to-orange-500">
                <User className="h-5 w-5" aria-hidden="true" />
              </span>
              <ChevronDown
                className={`hidden h-4 w-4 transition-transform sm:block ${profileOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 animate-pop-in overflow-hidden rounded-lg border border-white/10 bg-surface-raised py-1 shadow-2xl shadow-black/70"
              >
                <Link
                  to="/my-list"
                  role="menuitem"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                >
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  My List
                  <span className="ml-auto text-xs text-white/40">{myList.length}</span>
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  disabled={recent.length === 0}
                  onClick={() => {
                    clearRecent();
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Clear recently viewed
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white md:hidden"
          >
            {mobileOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-white/10 md:hidden">
          <ul className="page-x flex flex-col py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-md px-2 py-3 text-base transition ${
                      isActive ? 'font-semibold text-white' : 'text-white/70 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                  {link.to === '/my-list' && myList.length > 0 && (
                    <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold">{myList.length}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
