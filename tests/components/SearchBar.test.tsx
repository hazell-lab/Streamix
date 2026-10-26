import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

// SearchBar is "controlled" (its parent owns the value), so the test gives it a real parent.
function ControlledSearchBar({ onSubmit }: { onSubmit?: (value: string) => void }) {
  const [value, setValue] = useState('');
  return <SearchBar value={value} onChange={setValue} onClear={() => setValue('')} onSubmit={onSubmit} />;
}

describe('SearchBar', () => {
  test('shows what the user types', async () => {
    const user = userEvent.setup();
    render(<ControlledSearchBar />);

    const input = screen.getByRole('textbox', { name: /search movies and tv shows/i });
    await user.type(input, 'dune');

    expect(input).toHaveValue('dune');
  });

  test('only shows the clear button when there is text, and clearing empties the box', async () => {
    const user = userEvent.setup();
    render(<ControlledSearchBar />);

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();

    await user.type(screen.getByRole('textbox'), 'severance');
    await user.click(screen.getByRole('button', { name: /clear search/i }));

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
  });

  test('pressing Enter submits the current value', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ControlledSearchBar onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox'), 'oppenheimer{Enter}');

    expect(onSubmit).toHaveBeenCalledWith('oppenheimer');
  });
});
