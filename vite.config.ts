/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom gives the tests a fake browser (document, window, localStorage).
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    // A fake key so the TMDB service module loads; real requests are mocked.
    env: { VITE_TMDB_API_KEY: 'test-key' },
  },
});
