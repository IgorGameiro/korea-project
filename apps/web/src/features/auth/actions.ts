import type { AuthResponseDto } from '@/lib/api/types';
import { AUTH_PATH, endSession, startSession } from './session';

/** Error codes the auth forms know how to explain (anything else is shown as a generic error). */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'TOO_MANY_REQUESTS'
  | 'API_UNAVAILABLE'
  | 'UNKNOWN';

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}

const KNOWN: AuthErrorCode[] = [
  'INVALID_CREDENTIALS',
  'EMAIL_ALREADY_REGISTERED',
  'TOO_MANY_REQUESTS',
  'API_UNAVAILABLE',
];

async function post(path: string, body: unknown): Promise<AuthResponseDto> {
  let response: Response;
  try {
    response = await fetch(`${AUTH_PATH}/${path}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError('API_UNAVAILABLE');
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { code?: string };
    } | null;
    const code = payload?.error?.code as AuthErrorCode | undefined;
    if (code && KNOWN.includes(code)) throw new AuthError(code);
    throw new AuthError(response.status >= 500 ? 'API_UNAVAILABLE' : 'UNKNOWN');
  }
  return (await response.json()) as AuthResponseDto;
}

export async function login(input: { email: string; password: string }) {
  startSession(await post('login', input));
}

export async function register(input: { name: string; email: string; password: string }) {
  startSession(await post('register', input));
}

/** Ends the session locally even if the API cannot be reached (the cookie then just expires). */
export async function logout() {
  try {
    await fetch(`${AUTH_PATH}/logout`, { method: 'POST', credentials: 'same-origin' });
  } finally {
    endSession();
  }
}
