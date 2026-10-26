import { act, renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import useLocalStorage from '../../src/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  test('starts with the saved value when there is one', () => {
    window.localStorage.setItem('volume', '7');

    const { result } = renderHook(() => useLocalStorage('volume', 5));

    expect(result.current[0]).toBe(7);
  });

  test('saves new values to LocalStorage', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('tags', []));

    act(() => result.current[1](['drama']));

    expect(result.current[0]).toEqual(['drama']);
    expect(window.localStorage.getItem('tags')).toBe('["drama"]');
  });

  test('falls back to the initial value when the saved JSON is corrupted', () => {
    window.localStorage.setItem('tags', '{not valid json');

    const { result } = renderHook(() => useLocalStorage<string[]>('tags', []));

    expect(result.current[0]).toEqual([]);
  });

  test('picks up changes made in another browser tab', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('tags', []));

    // Browsers fire a "storage" event in other tabs when LocalStorage changes.
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'tags', newValue: '["comedy"]', storageArea: window.localStorage }),
      );
    });

    expect(result.current[0]).toEqual(['comedy']);
  });
});
