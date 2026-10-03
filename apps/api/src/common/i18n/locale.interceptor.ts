import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import type { AppRequest } from '../types/app-request';
import { resolveLocale } from './locale';

/**
 * Resolves the request locale once (see resolveLocale), exposes it to handlers through
 * @RequestLocale() and announces it with Content-Language (+ Vary when it depends on the header).
 */
@Injectable()
export class LocaleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const http = context.switchToHttp();
    const request = http.getRequest<AppRequest>();
    const response = http.getResponse<Response>();
    const { locale, fromHeader } = resolveLocale(
      request.query?.locale,
      request.headers['accept-language'],
    );

    request.locale = locale;
    response.setHeader('Content-Language', locale);
    if (fromHeader) response.vary('Accept-Language');

    return next.handle();
  }
}
