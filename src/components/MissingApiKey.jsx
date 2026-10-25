import { KeyRound } from 'lucide-react';

// Shown instead of the app when VITE_TMDB_API_KEY has not been configured.
export default function MissingApiKey() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl space-y-6 rounded-2xl border border-white/10 bg-surface-raised p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <KeyRound className="h-8 w-8 text-brand" aria-hidden="true" />
          <h1 className="text-2xl font-bold">TMDB API key needed</h1>
        </div>

        <p className="text-white/70">
          Streamix loads all of its movie and TV data from TMDB. Add your free API key and restart the dev server.
        </p>

        <ol className="list-decimal space-y-2 pl-5 text-sm text-white/80">
          <li>
            Create a free account at{' '}
            <a className="text-brand underline" href="https://www.themoviedb.org/signup" target="_blank" rel="noopener noreferrer">
              themoviedb.org
            </a>
            .
          </li>
          <li>
            Open{' '}
            <a className="text-brand underline" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer">
              Settings → API
            </a>{' '}
            and request a Developer key.
          </li>
          <li>
            Copy <code className="rounded bg-black/40 px-1.5 py-0.5">.env.example</code> to{' '}
            <code className="rounded bg-black/40 px-1.5 py-0.5">.env</code>.
          </li>
          <li>
            Paste the <strong>API Key (v3 auth)</strong> after{' '}
            <code className="rounded bg-black/40 px-1.5 py-0.5">VITE_TMDB_API_KEY=</code>
          </li>
          <li>
            Stop the server and run <code className="rounded bg-black/40 px-1.5 py-0.5">npm run dev</code> again.
          </li>
        </ol>
      </div>
    </main>
  );
}
