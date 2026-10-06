import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', '*.test.ts'],
    // next-intl imports "next/server" without an extension, which Node's ESM resolver rejects
    // (next has no exports map). Letting Vite bundle it resolves the path like Next does.
    server: { deps: { inline: ['next-intl'] } },
  },
});
