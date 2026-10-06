import { revalidatePath, revalidateTag } from 'next/cache';
import type { NextRequest } from 'next/server';
import { CONTENT_TAG } from '@/lib/api/server';
import { originOf, serverApiUrl } from '@/lib/env';

export const dynamic = 'force-dynamic';

const error = (status: number, code: string, message: string) =>
  Response.json({ error: { code, message } }, { status });

/**
 * POST /api/revalidate — called by the admin after a change, so the site shows it on the next
 * visit instead of after the ISR window (up to 5 minutes).
 *
 * Only administrators: the caller's bearer token is checked against the API (GET /auth/me) and
 * must belong to an ADMIN. Everything content-related is invalidated, not a computed list of pages:
 * a city appears on the home page, its sections, every place breadcrumb and the search, and a
 * missed dependency would silently show stale data. Pages regenerate lazily, on their next visit.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return error(401, 'UNAUTHORIZED', 'Authentication required');
  }

  let me: Response;
  try {
    me = await fetch(`${originOf(serverApiUrl)}/api/v1/auth/me`, {
      headers: { Authorization: authorization },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return error(502, 'API_UNAVAILABLE', 'The API is unavailable');
  }
  if (me.status === 401) return error(401, 'UNAUTHORIZED', 'Authentication required');
  if (!me.ok) return error(502, 'API_UNAVAILABLE', 'The API is unavailable');
  const user = (await me.json()) as { role?: string };
  if (user.role !== 'ADMIN') return error(403, 'FORBIDDEN', 'Requires the ADMIN role');

  // expire: 0 — the next visit gets fresh data (an admin checks the page right after saving).
  revalidateTag(CONTENT_TAG, { expire: 0 });
  revalidatePath('/', 'layout');
  return Response.json({ revalidated: true });
}
