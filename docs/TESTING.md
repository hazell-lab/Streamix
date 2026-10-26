# Testing in Streamix

Streamix has **34 automated tests** that run with **Vitest** and **React Testing Library**.

```bash
npm test             # run every test once
npm run test:watch   # re-run the tests each time you save a file
```

## What is tested

| File | What it checks |
| --- | --- |
| `tests/helpers.test.ts` | Pure functions: titles, years, ratings, runtimes, trailer picking, de-duplication, LocalStorage validation |
| `tests/hooks/useDebounce.test.ts` | The search box value only updates after typing stops (uses fake timers) |
| `tests/hooks/useLocalStorage.test.ts` | Saving, loading, corrupted JSON, and syncing between browser tabs |
| `tests/components/SearchBar.test.tsx` | Typing, the clear button, and submitting with Enter |
| `tests/components/GenreFilter.test.tsx` | Selecting genres, `aria-pressed` for screen readers, the loading state |
| `tests/components/ErrorMessage.test.tsx` | `role="alert"` and the "Try again" button |
| `tests/components/MovieCard.test.tsx` | Adding and removing a title from My List, LocalStorage, toast messages |
| `tests/components/TrailerModal.test.tsx` | Opening the trailer, Escape to close, focus returning to the Play button, no-trailer and error states |

## How the tests are set up

- **`vite.config.ts`** has a `test` section. `environment: 'jsdom'` gives the tests a fake browser (a `document`, `window` and `localStorage`) so components can render without opening a real browser.
- **`tests/setup.ts`** runs before every test file. It adds extra matchers such as `toBeInTheDocument()` and `toHaveAttribute()`, and resets LocalStorage after each test so tests don't affect each other.
- **`tests/test-utils.tsx`** has `renderWithProviders()`, which wraps a component in the same providers as `main.tsx` (router, toasts, My List, recently viewed, trailer). Components that call `useMyList()` would crash without them.

## The ideas behind the tests

### 1. Test what the user sees, not the code inside

React Testing Library finds elements the way a user (or a screen reader) would: by role and accessible name, not by CSS class.

```tsx
await user.click(screen.getByRole('button', { name: 'Add Dune: Part Two to My List' }));
expect(screen.getByRole('button', { name: 'Remove Dune: Part Two from My List' }))
  .toHaveAttribute('aria-pressed', 'true');
```

This means the tests keep passing if the styling or code structure changes, and fail only when behaviour changes. It also checks accessibility for free: if a button lost its `aria-label`, `getByRole` could no longer find it and the test would fail.

### 2. Simulate real interaction with `user-event`

`userEvent.setup()` types, clicks and presses keys like a real user, firing all the events in between (focus, keydown, input, keyup).

```tsx
await user.type(screen.getByRole('textbox'), 'oppenheimer{Enter}');
await user.keyboard('{Escape}');
```

### 3. Mock the network

Tests should not call the real TMDB API: it would be slow, need an API key, and give different results each day. `vi.mock` replaces the service with a fake whose answer each test controls:

```tsx
vi.mock('../../src/services/tmdb', () => ({ getVideos: vi.fn() }));

mockedGetVideos.mockResolvedValue([{ key: 'official1', site: 'YouTube', type: 'Trailer', official: true }]);
mockedGetVideos.mockRejectedValue(new Error('Network error...')); // to test the error state
```

`vi.mocked(getVideos)` keeps the mock fully typed in TypeScript.

### 4. Wait for async updates with `findBy`

The trailer loads after a request, so the test waits for it to appear:

```tsx
const video = await screen.findByTitle('Dune: Part Two trailer'); // retries until it appears
```

Use `getBy` for things that should already be there, `queryBy` to check that something is **not** there, and `findBy` for things that appear later.

### 5. Control time with fake timers

`useDebounce` waits 400ms. Instead of really waiting, the test moves the clock forward:

```ts
vi.useFakeTimers();
act(() => vi.advanceTimersByTime(400));
```

### 6. Test hooks on their own with `renderHook`

```ts
const { result } = renderHook(() => useLocalStorage<string[]>('tags', []));
act(() => result.current[1](['drama']));
expect(window.localStorage.getItem('tags')).toBe('["drama"]');
```

## Do the tests catch real bugs?

Yes. To check this, three bugs were added on purpose, and the tests caught every one:

- The trailer modal ignored the Escape key. **1 test failed.**
- Adding to My List did nothing. **2 tests failed.**
- Tabs stopped syncing My List. **1 test failed.**
