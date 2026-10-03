import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

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
