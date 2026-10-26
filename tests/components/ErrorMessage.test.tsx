import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import ErrorMessage from '../../src/components/ErrorMessage';

describe('ErrorMessage', () => {
  test('announces the error with role="alert"', () => {
    render(<ErrorMessage title="Search failed" message="Network error." />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Search failed');
    expect(alert).toHaveTextContent('Network error.');
  });

  test('"Try again" calls onRetry', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorMessage onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('hides the retry button when there is nothing to retry', () => {
    render(<ErrorMessage />);

    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });
});
