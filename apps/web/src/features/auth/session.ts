import type { AuthResponseDto, UserDto } from '@/lib/api/types';

// Browser session. The access token lives only in this module's memory (never localStorage,
// never logged); the refresh token is an httpOnly cookie the browser sends to /api/v1/auth.
// A page load starts in "restoring" until the first refresh answers.

export type SessionState =
  | { status: 'restoring'; user: null }
  | { status: 'authenticated'; user: UserDto }
  | { status: 'anonymous'; user: null };

export const AUTH_PATH = '/api/v1/auth';
const REFRESH_LOCK = 'korea-project:refresh';

const RESTORING: SessionState = { status: 'restoring', user: null };
const ANONYMOUS: SessionState = { status: 'anonymous', user: null };

let state: SessionState = RESTORING;
let accessToken: string | null = null;
let inFlight: Promise<string | null> | null = null;
const listeners = new Set<() => void>();

function setState(next: SessionState) {
  state = next;
  for (const listener of listeners) listener();
}

export const sessionStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => state,
  /** The HTML is static: it always renders the neutral "restoring" state. */
  getServerSnapshot: () => RESTORING,
};

export const getAccessToken = () => accessToken;

/** A refresh in progress, if any (requests wait for it instead of starting their own). */
export const pendingRefresh = () => inFlight;

export function startSession(response: AuthResponseDto) {
  accessToken = response.accessToken;
  setState({ status: 'authenticated', user: response.user });
}

export function endSession() {
  accessToken = null;
  setState(ANONYMOUS);
}

/**
 * Single-flight refresh: concurrent callers share one request. Across tabs, the Web Locks API
 * serializes refreshes, so two tabs never present the same (rotating) refresh token — the API would
 * treat the second use as token reuse and revoke the whole session.
 */
export function refreshSession(): Promise<string | null> {
  inFlight ??= withCrossTabLock(doRefresh).finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Readable hint set by the API next to the httpOnly refresh cookie (no secret in it). */
const SESSION_HINT = /(?:^|;\s*)has_session=1(?:;|$)/;
const hasSessionHint = () => typeof document !== 'undefined' && SESSION_HINT.test(document.cookie);

/**
 * Page-load restore: only when the browser holds a session cookie (its readable hint says so).
 * Anonymous visitors settle at once, without a request (and without a 401 in the console).
 */
export function restoreSession(): Promise<string | null> {
  if (!hasSessionHint()) {
    if (state.status === 'restoring') setState(ANONYMOUS);
    return Promise.resolve(null);
  }
  return refreshSession();
}

async function doRefresh(): Promise<string | null> {
  let response: Response;
  try {
    response = await fetch(`${AUTH_PATH}/refresh`, {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    // Network failure: keep a signed-in user signed in (the next call retries); a page that was
    // still restoring becomes anonymous so the UI can settle.
    if (state.status === 'restoring') setState(ANONYMOUS);
    return null;
  }
  if (!response.ok) {
    if (response.status === 401 || state.status === 'restoring') endSession();
    return null;
  }
  const body = (await response.json()) as AuthResponseDto;
  startSession(body);
  return body.accessToken;
}

function withCrossTabLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
  return locks ? locks.request(REFRESH_LOCK, task) : task();
}

/**
 * fetch() for authenticated API calls: sends the access token, and on a 401 refreshes once
 * (shared with every other request that expired at the same time) and retries.
 */
export async function authFetch(request: Request): Promise<Response> {
  const pending = pendingRefresh();
  if (pending) await pending;

  const retry = request.clone();
  const sentToken = accessToken;
  const response = await fetch(withToken(request, sentToken));
  if (response.status !== 401 || request.url.includes(`${AUTH_PATH}/`)) return response;

  // Another request may already have refreshed while this one was in flight.
  const token = accessToken !== sentToken ? accessToken : await refreshSession();
  return token ? fetch(withToken(retry, token)) : response;
}

function withToken(request: Request, token: string | null): Request {
  if (!token) return request;
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return new Request(request, { headers });
}

/** Test hook: back to a fresh page load. */
export function resetSessionForTests() {
  state = RESTORING;
  accessToken = null;
  inFlight = null;
  listeners.clear();
}
