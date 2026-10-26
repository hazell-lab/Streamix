# TypeScript in Streamix

Streamix was first written in JavaScript and then migrated to **strict TypeScript**. This page explains how the project is set up and the TypeScript patterns it uses, with examples from the real code.

## How it is set up

| File | What it does |
| --- | --- |
| `tsconfig.json` | Compiler settings. `strict: true` turns on all the safety checks (no implicit `any`, `null` must be handled). `noEmit: true` because TypeScript only *checks* the code. |
| `src/vite-env.d.ts` | Types for Vite features: `import.meta.env.VITE_TMDB_API_KEY` and image imports like `placeholder.svg`. |
| `src/types/tmdb.ts` | Shared types for the TMDB data the app uses. |
| `src/types/react-augment.d.ts` | Adds the `fetchpriority` image attribute, which React 18's types don't include yet. |
| `eslint.config.js` | `typescript-eslint` lints the `.ts` / `.tsx` files. |

**Important: Vite does not type-check.** Vite removes the types and bundles the code, so a type error would not stop `vite build` on its own. That is why the build script is:

```json
"build": "tsc --noEmit && vite build"
```

`tsc --noEmit` checks every file first, and the build stops if there is a type error.

## Patterns used

### 1. Shared data types and union types

All TMDB shapes live in one file, so every component agrees on what a "movie" looks like:

```ts
// src/types/tmdb.ts
export type MediaType = 'movie' | 'tv';
export type SortOption = 'popularity.desc' | 'vote_average.desc';
export type ImageSize = 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original';

export interface MediaItem {
  id: number;
  title?: string;      // movies
  name?: string;       // TV shows
  poster_path?: string | null;
  // ...
}
```

Union types like `ImageSize` mean `imageUrl(path, 'w5000')` is a compile error instead of a broken image at runtime.

### 2. Typed component props

Each component describes its props with an interface. Optional props (`?`) get default values:

```tsx
// src/components/MovieCard.tsx
interface MovieCardProps {
  item: MediaItem;
  mediaType?: MediaType;
  variant?: 'backdrop' | 'poster';
  progress?: number;
}

export default function MovieCard({ item, mediaType = 'movie', variant = 'backdrop', progress }: MovieCardProps) {
```

`LazyImage` reuses React's built-in `<img>` types and changes only what it needs, using the `Omit` utility type:

```ts
interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | null; // TMDB images can be missing
  alt: string;        // required for accessibility
}
```

### 3. Generics

A generic lets one function work with many types while keeping them connected. `useFetch` returns `data` with whatever type the fetcher resolves to:

```ts
// src/hooks/useFetch.ts
export default function useFetch<T>(fetcher: (() => Promise<T>) | null, deps: DependencyList = []): UseFetchResult<T>

// In Hero.tsx, `data` is inferred as MediaItem[] | null. No annotation needed.
const { data } = useFetch(() => getTrending('all', 'day'), []);
```

The same idea is used in `useLocalStorage<T>`, `useDebounce<T>`, the API helper `request<T>()` in `tmdb.ts`, and `uniqueById<T extends { id: number }>()`, which only accepts objects that have an `id`.

### 4. Typed React context

Each context starts as `null` until its provider mounts. Its hook checks for that, so components always get a non-null, fully typed value:

```tsx
// src/context/MyListContext.tsx
const MyListContext = createContext<MyListContextValue | null>(null);

export function useMyList(): MyListContextValue {
  const context = useContext(MyListContext);
  if (!context) throw new Error('useMyList must be used inside <MyListProvider>');
  return context;
}
```

### 5. Type guards for untrusted data

LocalStorage can contain anything: old versions, values edited by hand, or values from another app. So My List is read as `unknown` and checked with a **type guard**, a function whose return type (`value is ListItem`) tells TypeScript what the value is when it returns `true`:

```ts
// src/utils/helpers.ts
export function isListItem(value: unknown): value is ListItem {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Partial<ListItem>;
  return typeof entry.id === 'number' && (entry.media_type === 'movie' || entry.media_type === 'tv');
}

// MyListContext.tsx: `items` is ListItem[] after the filter
const items = Array.isArray(stored) ? stored.filter(isListItem) : [];
```

The same technique checks the `?sort=` value from the URL (`isSortOption` in `BrowsePage.tsx`) and removes empty rows from the details "facts" list (`Details.tsx`).

### 6. `unknown` instead of `any` for errors

In TypeScript a caught error is `unknown`, because JavaScript can throw anything, not just `Error` objects. Instead of assuming `error.message` exists, one helper narrows it safely:

```ts
export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
```

The project uses no `any` anywhere.

### 7. `Record` for complete lookups

```ts
// src/components/ToastContainer.tsx
const STYLES: Record<ToastType, { icon: LucideIcon; color: string }> = {
  success: { icon: Check, color: 'text-emerald-400' },
  info: { icon: Info, color: 'text-sky-400' },
  error: { icon: AlertTriangle, color: 'text-brand' },
};
```

If a new toast type is added to `ToastType`, TypeScript reports an error here until it has a style too.

### 8. Handling values that might be missing

Strict mode makes you handle `null` and `undefined` explicitly. Two examples it flagged:

```ts
// main.tsx: getElementById returns HTMLElement | null
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing <div id="root"> in index.html');

// Details.tsx: route params may be missing, so default to ''
const { id = '' } = useParams<{ id: string }>();
```

### 9. A custom error class

`tmdb.ts` turns low-level Axios errors into a `TmdbError` that keeps the HTTP status, instead of adding a property to a plain `Error`, which TypeScript would not allow:

```ts
export class TmdbError extends Error {
  status?: number;
}
```

## Where type assertions (`as`) are used

Assertions tell TypeScript "trust me", so they are kept to the few places where the type truly cannot be known:

- `JSON.parse(raw) as T` in `useLocalStorage`. JSON parsing returns `any`, and the contexts then validate the data with `isListItem`.
- `cache.get(key) as Promise<T>` in `tmdb.ts`. One cache stores responses of different types.
- `event.target as Node` in `useClickOutside`. DOM event targets are typed loosely.
- `value as Partial<ListItem>` inside the `isListItem` type guard. Every field is treated as possibly missing and then checked one by one.

## Checking the project

```bash
npm run typecheck   # TypeScript only
npm run lint        # ESLint with typescript-eslint
npm test            # Vitest unit tests
npm run build       # type-check + production build
```
