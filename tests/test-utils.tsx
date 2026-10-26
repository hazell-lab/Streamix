// Renders a component inside the same providers the real app uses (see main.tsx),
// so components that call useMyList(), useToast() or useTrailer() work in tests.
import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from '../src/context/ToastContext';
import { MyListProvider } from '../src/context/MyListContext';
import { RecentlyViewedProvider } from '../src/context/RecentlyViewedContext';
import { TrailerProvider } from '../src/context/TrailerContext';
import type { MediaItem } from '../src/types/tmdb';

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <ToastProvider>
        <MyListProvider>
          <RecentlyViewedProvider>
            <TrailerProvider>{children}</TrailerProvider>
          </RecentlyViewedProvider>
        </MyListProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: AllProviders });
}

// Sample TMDB data shared by several tests.
export const dune: MediaItem = {
  id: 693134,
  media_type: 'movie',
  title: 'Dune: Part Two',
  overview: 'Paul Atreides unites with the Fremen.',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  vote_average: 8.3,
  release_date: '2024-02-27',
};
