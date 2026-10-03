import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { map, type Observable } from 'rxjs';

/** Field names that must never appear in an HTTP response, at any depth. */
export const SECRET_FIELDS = new Set(['passwordHash', 'tokenHash']);

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value) as unknown;
  return proto === Object.prototype || proto === null;
};

/** Returns a copy of `value` without secret fields (arrays and plain objects are walked). */
export function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !SECRET_FIELDS.has(key))
      .map(([key, nested]) => [key, redactSecrets(nested)]),
  );
}

/**
 * Safety net only: responses are built from explicit DTOs that never include secrets.
 * This catches a mistake (e.g. returning a raw Prisma row) before it reaches a client.
 */
@Injectable()
export class RedactSecretsInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(redactSecrets));
  }
}
