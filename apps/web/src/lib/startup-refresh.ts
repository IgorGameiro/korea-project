import { randomBytes, timingSafeEqual } from 'node:crypto';
import { originOf } from './env';

/**
 * The Docker image is built without a reachable API, so the pages prebuilt by `next build` (home,
 * plan…) hold their "could not be loaded" fallback until their ISR window ends. Once the production
 * server is up, it waits for the API and invalidates them, so the first visitors get real content.
 *
 * The server calls its own POST /api/revalidate with a random one-time token that only this process
 * knows (kept in process.env, which the instrumentation hook and the route handlers share).
 */
const TOKEN_KEY = 'KOREA_STARTUP_REFRESH_TOKEN';
export const STARTUP_TOKEN_HEADER = 'x-startup-token';

export function issueStartupToken(): string {
  const token = randomBytes(32).toString('hex');
  process.env[TOKEN_KEY] = token;
  return token;
}

/** True once for the token issued at startup; it cannot be reused afterwards. */
export function consumeStartupToken(candidate: string | null): boolean {
  const expected = process.env[TOKEN_KEY];
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  delete process.env[TOKEN_KEY];
  return true;
}

interface RefreshOptions {
  apiUrl: string;
  siteOrigin: string;
  token: string;
  attempts?: number;
  delayMs?: number;
}

/** Waits for the API (and this server) to answer, then invalidates the site. Never throws. */
export async function refreshAfterStartup({
  apiUrl,
  siteOrigin,
  token,
  attempts = 90,
  delayMs = 2000,
}: RefreshOptions): Promise<boolean> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const health = await fetch(`${originOf(apiUrl)}/api/v1/health`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (health.ok) {
        const response = await fetch(`${siteOrigin}/api/revalidate`, {
          method: 'POST',
          headers: { [STARTUP_TOKEN_HEADER]: token },
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok) return true;
      }
    } catch {
      // The API or this server is not listening yet: try again.
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return false;
}
