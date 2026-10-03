import type { Locale } from '@korea-project/shared';
import type { Request } from 'express';
import type { AuthUser } from './auth-user';

/** Express request enriched by the global interceptors and guards. */
export interface AppRequest extends Request {
  /** Set by LocaleInterceptor on every HTTP request. */
  locale?: Locale;
  /** Set by the JWT guard on authenticated routes. */
  user?: AuthUser;
}
