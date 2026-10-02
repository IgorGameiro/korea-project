import { HttpException, HttpStatus } from '@nestjs/common';
import type { ApiErrorBody } from '@korea-project/shared';
import { Prisma } from '../../generated/prisma/client';

export interface MappedError {
  status: number;
  body: ApiErrorBody;
}

const error = (status: number, code: string, message: string, details?: unknown): MappedError => ({
  status,
  body: { error: details === undefined ? { code, message } : { code, message, details } },
});

/** HttpStatus.NOT_FOUND -> 'NOT_FOUND'. Falls back to a generic code for non-standard statuses. */
const codeForStatus = (status: number): string => {
  const name: string | undefined = HttpStatus[status];
  return name ?? (status >= 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR');
};

function fromHttpException(exception: HttpException): MappedError {
  const status = exception.getStatus();
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return error(status, codeForStatus(status), response);
  }

  const res = response as Record<string, unknown>;
  // Already in our format (e.g. thrown by the ValidationPipe exceptionFactory).
  if (typeof res.code === 'string' && typeof res.message === 'string') {
    return error(status, res.code, res.message, res.details);
  }
  // Nest default body: { statusCode, message, error }. Message may be a string or a list.
  if (typeof res.message === 'string') {
    return error(status, codeForStatus(status), res.message);
  }
  if (Array.isArray(res.message)) {
    return error(status, codeForStatus(status), exception.message, res.message);
  }
  // Anything else (e.g. Terminus health report): keep the payload as details.
  return error(status, codeForStatus(status), exception.message, response);
}

function fromPrismaKnownError(exception: Prisma.PrismaClientKnownRequestError): MappedError | null {
  switch (exception.code) {
    case 'P2002':
      return error(HttpStatus.CONFLICT, 'CONFLICT', 'Resource already exists', {
        fields: exception.meta?.target,
      });
    case 'P2003':
      return error(HttpStatus.CONFLICT, 'CONFLICT', 'Related resource constraint failed', {
        field: exception.meta?.field_name,
      });
    case 'P2025':
      return error(HttpStatus.NOT_FOUND, 'NOT_FOUND', 'Resource not found');
    default:
      return null;
  }
}

/** Converts any thrown value into the API's standard error response. Never leaks internals on 5xx. */
export function mapException(exception: unknown): MappedError {
  if (exception instanceof HttpException) {
    return fromHttpException(exception);
  }
  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = fromPrismaKnownError(exception);
    if (mapped) return mapped;
  }
  return error(HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_ERROR', 'Internal server error');
}
