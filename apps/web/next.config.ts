import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { securityHeaders } from './security-headers';

// One .env at the repository root serves every app (README). Next only reads .env files from the
// app folder, so load the root one for host runs. Variables already set (Docker) win, and NODE_ENV
// is left to the Next CLI (the root file says "development" for the API).
const rootEnv = path.join(import.meta.dirname, '../../.env');
if (existsSync(rootEnv)) {
  for (const [name, value] of Object.entries(parseEnv(readFileSync(rootEnv, 'utf8')))) {
    if (name !== 'NODE_ENV' && process.env[name] === undefined) process.env[name] = value;
  }
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Self-contained server bundle for the production Docker image (Vercel packages the app itself).
  output: process.env.VERCEL ? undefined : 'standalone',
  // Monorepo: trace dependencies from the repo root so workspace packages are included.
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
  poweredByHeader: false,
  // Don't let `next dev` write AGENTS.md/CLAUDE.md into the app when it detects an AI agent.
  agentRules: false,
  images: {
    // AVIF first (much smaller photos, so a faster Largest Contentful Paint), WebP as fallback.
    formats: ['image/avif', 'image/webp'],
    // Seed placeholders (picsum redirects to fastly.picsum.photos).
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      // Real photos from Wikimedia Commons (hotlinked thumbnails; credited on the page and /credits).
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/wikipedia/commons/**' },
      { protocol: 'https', hostname: 'thumb.wikimedia.org', pathname: '/wikipedia/commons/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders({
          isDev: process.env.NODE_ENV === 'development',
          // Same defaults as src/lib/env.ts (mapTiles, siteUrl).
          tileUrl:
            process.env.NEXT_PUBLIC_MAP_TILE_URL ||
            'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
        }),
      },
    ];
  },
};

export default withNextIntl(nextConfig);
