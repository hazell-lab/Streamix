import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import GenreFilter from '../../src/components/GenreFilter';

const genres = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
];

describe('GenreFilter', () => {
  test('marks the selected genre as pressed for screen readers', () => {
    render(<GenreFilter genres={genres} selected={28} onSelect={() => {}} />);

    expect(screen.getByRole('button', { name: 'Action' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Comedy' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('sends the genre id when a chip is clicked, and null for "All"', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<GenreFilter genres={genres} selected={null} onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: 'Comedy' }));
    await user.click(screen.getByRole('button', { name: 'All' }));

    expect(onSelect).toHaveBeenNthCalledWith(1, 35);
    expect(onSelect).toHaveBeenNthCalledWith(2, null);
  });

  test('shows a busy placeholder instead of buttons while loading', () => {
    render(<GenreFilter genres={[]} selected={null} onSelect={() => {}} loading />);

    expect(screen.getByLabelText(/loading genres/i)).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
