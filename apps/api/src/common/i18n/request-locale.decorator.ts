import { applyDecorators, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { ApiHeader, ApiQuery } from '@nestjs/swagger';
import { DEFAULT_LOCALE, type Locale, LOCALES } from '@korea-project/shared';
import type { AppRequest } from '../types/app-request';

/** The locale resolved by LocaleInterceptor: `@RequestLocale() locale: Locale`. */
export const RequestLocale = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): Locale =>
    ctx.switchToHttp().getRequest<AppRequest>().locale ?? DEFAULT_LOCALE,
);

/** Documents the locale inputs of a localized endpoint in Swagger. */
export const ApiLocale = () =>
  applyDecorators(
    ApiQuery({
      name: 'locale',
      required: false,
      enum: LOCALES,
      description: `Content language. Unsupported values fall back to "${DEFAULT_LOCALE}". Takes precedence over Accept-Language.`,
    }),
    ApiHeader({
      name: 'Accept-Language',
      required: false,
      description: 'Used when ?locale is absent.',
    }),
  );
