import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

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
  // Self-contained server bundle for the production Docker image.
  output: 'standalone',
  // Monorepo: trace dependencies from the repo root so workspace packages are included.
  outputFileTracingRoot: path.join(import.meta.dirname, '../../'),
  poweredByHeader: false,
  // Don't let `next dev` write AGENTS.md/CLAUDE.md into the app when it detects an AI agent.
  agentRules: false,
  images: {
    // Seed placeholders (picsum redirects to fastly.picsum.photos).
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
  },
};

export default withNextIntl(nextConfig);
