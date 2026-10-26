/// <reference types="vite/client" />

// Types for the variables in .env, so import.meta.env.VITE_TMDB_API_KEY is a
// known string instead of "any".
interface ImportMetaEnv {
  readonly VITE_TMDB_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
