import type { CookieOptions } from 'express';
import { API_PREFIX, DEFAULT_API_VERSION } from '../../common/constants';

export const REFRESH_COOKIE = 'refresh_token';

/**
 * httpOnly (no JavaScript access), SameSite=Lax (not sent on cross-site POSTs) and scoped to the
 * auth routes, so the refresh token never travels with ordinary API calls.
 * In production the web and the API must share a site (e.g. example.com + api.example.com).
 */
export const refreshCookieOptions = (secure: boolean): CookieOptions => ({
  httpOnly: true,
  secure,
  sameSite: 'lax',
  path: `/${API_PREFIX}/v${DEFAULT_API_VERSION}/auth`,
});

/**
 * Readable hint that a session cookie exists ("1", no secret), so the web app only tries to restore
 * a session when there is one — anonymous visitors make no refresh request (and log no 401). It
 * proves nothing: the refresh token itself stays httpOnly and is what the API checks.
 */
export const SESSION_HINT_COOKIE = 'has_session';

export const sessionHintCookieOptions = (secure: boolean): CookieOptions => ({
  httpOnly: false,
  secure,
  sameSite: 'lax',
  path: '/',
});
