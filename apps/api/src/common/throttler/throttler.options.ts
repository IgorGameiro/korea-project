import type { ExecutionContext } from '@nestjs/common';
import type { ThrottlerModuleOptions } from '@nestjs/throttler';
import type { Request } from 'express';
import { API_PREFIX } from '../constants';

const AUTH_ROUTE = new RegExp(`^/${API_PREFIX}/v\\d+/auth(/|$)`);

export const isAuthRoute = (path: string): boolean => AUTH_ROUTE.test(path);

interface ThrottleSettings {
  ttlMs: number;
  limit: number;
  authTtlMs: number;
  authLimit: number;
}

/**
 * Two throttlers: `default` applies to every route; `auth` adds a stricter limit
 * on /api/v{n}/auth/* (login, register, refresh) to slow down credential stuffing.
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
    ],
  };
}
