import type { NextRequest } from 'next/server';
import { originOf, serverApiUrl } from '@/lib/env';

// Same-origin gateway for browser calls: /api/v1/* on the site is forwarded to the API at runtime
// (API_INTERNAL_URL), so the refresh-token cookie is a first-party cookie of the site and the
// browser needs no CORS. It forwards requests verbatim and never reads or logs their content.

export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 10_000;

// Hop-by-hop headers (RFC 9110 §7.6.1) and those fetch() recomputes.
const DROPPED_REQUEST_HEADERS = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
];
// fetch() already decoded the body, so its original encoding/length no longer apply.
const DROPPED_RESPONSE_HEADERS = [
  'connection',
  'keep-alive',
  'transfer-encoding',
  'content-encoding',
  'content-length',
];

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, { params }: Context): Promise<Response> {
  const { path } = await params;
  // "." / ".." would let URL normalization climb out of /api/v1.
  if (path.some((segment) => segment === '.' || segment === '..')) {
    return errorResponse(404, 'NOT_FOUND', 'Not found');
  }
  const target = new URL(
    `/api/v1/${path.map(encodeURIComponent).join('/')}`,
    originOf(serverApiUrl),
  );
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  for (const name of DROPPED_REQUEST_HEADERS) headers.delete(name);
  // x-forwarded-for is passed through unchanged: Next fills it with the socket address when the
  // client sent none, and in production the reverse proxy in front of Next appends the real
  // client IP (see README, "Before production"). The API trusts exactly one hop (TRUST_PROXY=1).

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? request.body : undefined,
      // Required by Node's fetch to stream a request body.
      ...(hasBody ? { duplex: 'half' } : {}),
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    } as RequestInit);
  } catch {
    return errorResponse(502, 'API_UNAVAILABLE', 'The API is unavailable');
  }

  const responseHeaders = new Headers(upstream.headers);
  for (const name of DROPPED_RESPONSE_HEADERS) responseHeaders.delete(name);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

const errorResponse = (status: number, code: string, message: string) =>
  Response.json({ error: { code, message } }, { status });

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
