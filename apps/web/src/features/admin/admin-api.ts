import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

// Admin calls go through the same typed browser client (and session) as the rest of the site.
// The API is the authority: it checks the ADMIN role and validates every payload; its errors are
// shown next to the matching form fields.

export interface FieldError {
  field: string;
  errors: string[];
}

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: FieldError[] = [],
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

/** Unwraps an openapi-fetch call; failures become AdminApiError (network errors: status 0). */
export async function unwrap<T>(
  call: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  let result: { data?: T; error?: unknown; response: Response };
  try {
    result = await call;
  } catch {
    throw new AdminApiError(0, 'API_UNAVAILABLE', 'The API is unavailable.');
  }
  const { response } = result;
  if (response.ok) return result.data as T;
  const body = (result.error ?? {}) as ErrorBody;
  const details = Array.isArray(body.error?.details) ? (body.error.details as FieldError[]) : [];
  throw new AdminApiError(
    response.status,
    body.error?.code ?? `HTTP_${response.status}`,
    body.error?.message ?? response.statusText,
    details,
  );
}

const FRIENDLY: Record<string, string> = {
  API_UNAVAILABLE: 'The API is unavailable. Try again in a moment.',
  UNAUTHORIZED: 'Your session has ended. Log in again.',
  FORBIDDEN: 'Your account is not allowed to do this (ADMIN role required).',
  CONFLICT:
    'This conflicts with existing data (for example a slug already in use, or related records that still exist).',
  VALIDATION_ERROR: 'Some fields are invalid. See the messages next to them.',
};

/** A sentence for the top of a form or list. */
export function describeError(error: unknown): string {
  if (!(error instanceof AdminApiError)) return 'Something went wrong. Try again.';
  return FRIENDLY[error.code] ?? `${error.message} (${error.code})`;
}

/**
 * Puts the API's per-field validation messages on the form fields with the same path
 * ("translations.en.name"); returns the ones that match no field.
 */
export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): FieldError[] {
  if (!(error instanceof AdminApiError)) return [];
  const unmatched: FieldError[] = [];
  for (const detail of error.details) {
    if (fields.includes(detail.field)) {
      setError(detail.field as Path<T>, { type: 'server', message: detail.errors.join(' ') });
    } else {
      unmatched.push(detail);
    }
  }
  return unmatched;
}
