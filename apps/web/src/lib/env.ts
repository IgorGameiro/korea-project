// Central access to environment variables used by the web app.

/** API base URL for code running in the browser (inlined at build time). */
export const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/**
 * API base URL for server components. Inside docker compose the browser URL (localhost)
 * is not reachable from the web container, so SSR uses the internal service name.
 */
export const serverApiUrl = process.env.API_INTERNAL_URL ?? publicApiUrl;

/**
 * Shared secret sent on server-side API calls so ISR/builds are not rate limited like visitors.
 * Server-only (no NEXT_PUBLIC_ prefix): it is never inlined into the browser bundle.
 */
export const internalApiToken = process.env.INTERNAL_API_TOKEN || undefined;

/** Public origin of the site, for absolute URLs (canonical, hreflang, Open Graph). */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Origin of an API base URL ("http://api:3001/api/v1" -> "http://api:3001"): OpenAPI paths are absolute. */
export const originOf = (url: string) => new URL(url).origin;

/**
 * Map tiles. Defaults to the public OpenStreetMap tile servers, which are fine for development but
 * have a usage policy that MUST be reviewed before production (see README): set a tile provider here.
 * `||`, not `??`: Compose passes unset variables as empty strings.
 */
export const mapTiles = {
  url: process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution:
    process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};
