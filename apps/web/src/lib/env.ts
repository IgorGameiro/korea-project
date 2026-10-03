// Central access to environment variables used by the web app.

/** API base URL for code running in the browser (inlined at build time). */
export const publicApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

/**
 * API base URL for server components. Inside docker compose the browser URL (localhost)
 * is not reachable from the web container, so SSR uses the internal service name.
 */
export const serverApiUrl = process.env.API_INTERNAL_URL ?? publicApiUrl;

/** Public origin of the site, for absolute URLs (canonical, hreflang, Open Graph). */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Origin of an API base URL ("http://api:3001/api/v1" -> "http://api:3001"): OpenAPI paths are absolute. */
export const originOf = (url: string) => new URL(url).origin;
