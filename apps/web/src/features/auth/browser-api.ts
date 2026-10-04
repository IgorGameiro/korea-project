import createClient from 'openapi-fetch';
import type { paths } from '@/lib/api/schema';
import { authFetch } from './session';

/**
 * Typed API client for client components. Calls go to the site's own /api/v1 (the same-origin
 * gateway), carry the in-memory access token and refresh it transparently.
 */
let client: ReturnType<typeof createClient<paths>> | null = null;

export function browserApi() {
  client ??= createClient<paths>({ baseUrl: window.location.origin, fetch: authFetch });
  return client;
}
