import 'server-only';
import { notFound } from 'next/navigation';
import createClient from 'openapi-fetch';
import { originOf, serverApiUrl } from '../env';
import type { paths } from './schema';

/** The API could not answer (down, timing out or failing): pages show a friendly error instead. */
export class ApiUnavailableError extends Error {
  constructor(detail: string) {
    super(`API unavailable: ${detail}`);
    this.name = 'ApiUnavailableError';
  }
}

const TIMEOUT_MS = 5000;

/**
 * Typed API client for server components. `revalidate` (seconds) feeds Next's data cache, so the
 * pages that use it stay statically generated and refresh in the background (ISR).
 * openapi-fetch builds a Request object, which drops Next's `next` option, so it is re-applied here.
 */
export function serverApi(revalidate = 300) {
  return createClient<paths>({
    baseUrl: originOf(serverApiUrl),
    fetch: (request: Request) =>
      fetch(request, { next: { revalidate }, signal: AbortSignal.timeout(TIMEOUT_MS) }),
  });
}

interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/** Unwraps a call: 404 -> notFound(), network errors and other failures -> ApiUnavailableError. */
export async function load<T>(call: Promise<FetchResult<T>>): Promise<T> {
  let result: FetchResult<T>;
  try {
    result = await call;
  } catch (error) {
    throw new ApiUnavailableError(error instanceof Error ? error.message : String(error));
  }
  if (result.response.status === 404) notFound();
  if (!result.response.ok || result.data === undefined) {
    throw new ApiUnavailableError(`HTTP ${result.response.status}`);
  }
  return result.data;
}

/** Like load(), but resolves to `fallback` when the API is unavailable (for non-essential data). */
export async function loadOr<T>(call: Promise<FetchResult<T>>, fallback: T): Promise<T> {
  try {
    return await load(call);
  } catch (error) {
    if (error instanceof ApiUnavailableError) return fallback;
    throw error;
  }
}
