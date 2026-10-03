import type { ExecutionContext } from '@nestjs/common';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import type { Request } from 'express';
import { API_PREFIX } from '../constants';

const AUTH_ROUTE = new RegExp(`^/${API_PREFIX}/v\\d+/auth(/|$)`);
const SEARCH_ROUTE = new RegExp(`^/${API_PREFIX}/v\\d+/search/?$`);

export const isAuthRoute = (path: string): boolean => AUTH_ROUTE.test(path);
export const isSearchRoute = (path: string): boolean => SEARCH_ROUTE.test(path);

interface ThrottleSettings {
  ttlMs: number;
  limit: number;
  authTtlMs: number;
  authLimit: number;
  searchLimit: number;
}

/**
 * Throttlers: `default` applies to every route; `auth` adds a stricter limit on /api/v{n}/auth/*
 * (login, register, refresh) to slow down credential stuffing; `search` limits the cross-city
 * search, the most expensive public query (per minute).
 * Use @SkipThrottle() on routes that must never be limited (e.g. health).
 */
export function buildThrottlerOptions(settings: ThrottleSettings): ThrottlerModuleOptions {
  return {
    throttlers: [
      { name: 'default', ttl: settings.ttlMs, limit: settings.limit },
      {
        name: 'auth',
        ttl: settings.authTtlMs,
        limit: settings.authLimit,
        skipIf: (ctx: ExecutionContext) =>
          !isAuthRoute(ctx.switchToHttp().getRequest<Request>().path),
      },
      {
        name: 'search',
        ttl: 60_000,
        limit: settings.searchLimit,
        skipIf: (ctx: ExecutionContext) =>
          !isSearchRoute(ctx.switchToHttp().getRequest<Request>().path),
      },
    ],
  };
}
