import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import MovieCard from '../../src/components/MovieCard';
import ToastContainer from '../../src/components/ToastContainer';
import { dune, renderWithProviders } from '../test-utils';

describe('MovieCard', () => {
  test('shows the title, year, rating and a link to the details page', () => {
    renderWithProviders(<MovieCard item={dune} />);

    expect(screen.getByRole('heading', { name: 'Dune: Part Two' })).toBeInTheDocument();
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('8.3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view details for dune: part two/i })).toHaveAttribute(
      'href',
      '/movie/693134',
    );
  });

  test('adds the title to My List, saves it to LocalStorage and shows a toast', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <MovieCard item={dune} />
        <ToastContainer />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Add Dune: Part Two to My List' }));

    // The button flips to a pressed "remove" button.
    const removeButton = screen.getByRole('button', { name: 'Remove Dune: Part Two from My List' });
    expect(removeButton).toHaveAttribute('aria-pressed', 'true');

    // The list survives a refresh because it is in LocalStorage.
    const saved = JSON.parse(window.localStorage.getItem('streamix:my-list') ?? '[]');
    expect(saved).toEqual([expect.objectContaining({ id: 693134, media_type: 'movie' })]);

    expect(screen.getByRole('status')).toHaveTextContent('Added "Dune: Part Two" to My List');
  });

  test('clicking again removes it from My List', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MovieCard item={dune} />);

    await user.click(screen.getByRole('button', { name: 'Add Dune: Part Two to My List' }));
    await user.click(screen.getByRole('button', { name: 'Remove Dune: Part Two from My List' }));

    expect(screen.getByRole('button', { name: 'Add Dune: Part Two to My List' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(JSON.parse(window.localStorage.getItem('streamix:my-list') ?? '[]')).toEqual([]);
  });

  test('loads titles that were saved in an earlier visit', () => {
    window.localStorage.setItem(
      'streamix:my-list',
      JSON.stringify([{ id: 693134, media_type: 'movie', poster_path: null, backdrop_path: null, vote_average: 8.3 }]),
    );

    renderWithProviders(<MovieCard item={dune} />);

    expect(screen.getByRole('button', { name: 'Remove Dune: Part Two from My List' })).toBeInTheDocument();
  });
});
