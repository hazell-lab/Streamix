import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import useDebounce from '../../src/hooks/useDebounce';

describe('useDebounce', () => {
  // Fake timers let the test move time forward instantly instead of waiting.
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test('only updates after the value stops changing for the delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
      initialProps: { value: 'd' },
    });

    rerender({ value: 'du' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'dune' });
    act(() => vi.advanceTimersByTime(200));

    // 400ms have passed in total, but only 200ms since the last keystroke.
    expect(result.current).toBe('d');

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('dune');
  });
});
