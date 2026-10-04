import { createHash, timingSafeEqual } from 'node:crypto';
import type { ExecutionContext } from '@nestjs/common';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import type { Request } from 'express';
import { API_PREFIX } from '../constants';

const AUTH_ROUTE = new RegExp(`^/${API_PREFIX}/v\\d+/auth(/|$)`);
const SEARCH_ROUTE = new RegExp(`^/${API_PREFIX}/v\\d+/search/?$`);

export const isAuthRoute = (path: string): boolean => AUTH_ROUTE.test(path);
export const isSearchRoute = (path: string): boolean => SEARCH_ROUTE.test(path);

/** Header the web server sends on its own server-side calls (SSR/ISR), never on browser calls. */
export const INTERNAL_TOKEN_HEADER = 'x-internal-token';

const digest = (value: string) => createHash('sha256').update(value).digest();

/**
 * True when the request carries the shared internal token. Compared in constant time (on
 * fixed-length digests, so the token length does not leak either). Without a configured token,
 * nothing is internal.
 */
export function isInternalRequest(
  req: Pick<Request, 'headers'>,
  token: string | undefined,
): boolean {
  const sent = req.headers[INTERNAL_TOKEN_HEADER];
  if (!token || typeof sent !== 'string') return false;
  return timingSafeEqual(digest(sent), digest(token));
}

interface ThrottleSettings {
  ttlMs: number;
  limit: number;
  authTtlMs: number;
  authLimit: number;
  searchLimit: number;
  /** INTERNAL_API_TOKEN: the web server's own requests are not rate limited. */
  internalToken?: string;
}

/**
 * Throttlers: `default` applies to every route; `auth` adds a stricter limit on /api/v{n}/auth/*
 * (login, register, refresh) to slow down credential stuffing; `search` limits the cross-city
 * search, the most expensive public query (per minute).
 * Use @SkipThrottle() on routes that must never be limited (e.g. health).
 *
 * The web server's server-side rendering (build, ISR regeneration) comes from a single IP and would
 * otherwise exhaust a per-visitor limit; it authenticates with INTERNAL_API_TOKEN and is exempt.
 * Browser calls through the web gateway never carry that header (the gateway removes it).
 */
export function buildThrottlerOptions(settings: ThrottleSettings): ThrottlerModuleOptions {
  const request = (ctx: ExecutionContext) => ctx.switchToHttp().getRequest<Request>();
  const internal = (ctx: ExecutionContext) =>
    isInternalRequest(request(ctx), settings.internalToken);
  return {
    throttlers: [
      { name: 'default', ttl: settings.ttlMs, limit: settings.limit, skipIf: internal },
      {
        name: 'auth',
        ttl: settings.authTtlMs,
        limit: settings.authLimit,
        skipIf: (ctx) => internal(ctx) || !isAuthRoute(request(ctx).path),
      },
      {
        name: 'search',
        ttl: 60_000,
        limit: settings.searchLimit,
        skipIf: (ctx) => internal(ctx) || !isSearchRoute(request(ctx).path),
      },
    ],
  };
}
