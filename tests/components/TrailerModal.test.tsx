import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import TrailerModal from '../../src/components/TrailerModal';
import { useTrailer } from '../../src/context/TrailerContext';
import { getVideos } from '../../src/services/tmdb';
import { dune, renderWithProviders } from '../test-utils';

// Replace the real TMDB request with a fake we control in each test.
vi.mock('../../src/services/tmdb', () => ({ getVideos: vi.fn() }));
const mockedGetVideos = vi.mocked(getVideos);

// A button that opens the trailer, like the Play button on a card.
function PlayButton() {
  const { openTrailer } = useTrailer();
  return (
    <button type="button" onClick={() => openTrailer(dune, 'movie')}>
      Play trailer
    </button>
  );
}

function renderModal() {
  return renderWithProviders(
    <>
      <PlayButton />
      <TrailerModal />
    </>,
  );
}

describe('TrailerModal', () => {
  beforeEach(() => {
    mockedGetVideos.mockReset();
  });

  test('opens an accessible dialog with the official YouTube trailer', async () => {
    mockedGetVideos.mockResolvedValue([
      { key: 'teaser1', site: 'YouTube', type: 'Teaser' },
      { key: 'official1', site: 'YouTube', type: 'Trailer', official: true },
    ]);
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Play trailer' }));

    const dialog = screen.getByRole('dialog', { name: 'Dune: Part Two trailer' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(mockedGetVideos).toHaveBeenCalledWith('movie', 693134);

    const video = await screen.findByTitle('Dune: Part Two trailer');
    expect(video).toHaveAttribute('src', expect.stringContaining('/embed/official1'));
  });

  test('Escape closes the dialog and returns focus to the Play button', async () => {
    mockedGetVideos.mockResolvedValue([]);
    const user = userEvent.setup();
    renderModal();

    const playButton = screen.getByRole('button', { name: 'Play trailer' });
    await user.click(playButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(playButton).toHaveFocus();
  });

  test('says so when TMDB has no trailer', async () => {
    mockedGetVideos.mockResolvedValue([]);
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Play trailer' }));

    expect(await screen.findByText('No trailer available')).toBeInTheDocument();
  });

  test('shows the error message when the request fails', async () => {
    mockedGetVideos.mockRejectedValue(new Error('Network error. Please check your internet connection.'));
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Play trailer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
  });
});
