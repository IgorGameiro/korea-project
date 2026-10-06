import { vi } from 'vitest';

// A tiny in-memory stand-in for the auth API with a cookie jar that survives a "page reload"
// (resetSessionForTests clears only the page's memory, like a real reload).

export const USER = {
  id: '01a10284-0000-7000-8000-000000000001',
  name: 'Ana Souza',
  email: 'ana@example.com',
  role: 'USER' as const,
  createdAt: '2026-10-01T00:00:00Z',
};
export const PASSWORD = 'correct horse battery';

export function installFakeApi() {
  document.cookie = 'has_session=; path=/; max-age=0';
  let cookie: string | null = null;
  let issued = 0;
  const calls: string[] = [];
  const validTokens = new Set<string>();

  const session = () => {
    issued += 1;
    const accessToken = `access-${issued}`;
    validTokens.add(accessToken);
    cookie = `refresh-${issued}`;
    // The real API sets this readable hint next to the httpOnly refresh cookie.
    document.cookie = 'has_session=1; path=/';
    return Response.json({ accessToken, tokenType: 'Bearer', expiresIn: 900, user: USER });
  };

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request =
      input instanceof Request
        ? input
        : new Request(new URL(String(input), 'http://localhost'), init);
    const path = new URL(request.url).pathname;
    calls.push(`${request.method} ${path}`);
    // Let the event loop interleave concurrent requests, like a network would.
    await new Promise((resolve) => setTimeout(resolve, 5));

    if (path === '/api/v1/auth/login') {
      const body = (await request.json()) as { email: string; password: string };
      if (body.email === USER.email && body.password === PASSWORD) return session();
      return Response.json({ error: { code: 'INVALID_CREDENTIALS' } }, { status: 401 });
    }
    if (path === '/api/v1/auth/refresh') {
      return cookie
        ? session()
        : Response.json({ error: { code: 'INVALID_REFRESH_TOKEN' } }, { status: 401 });
    }
    if (path === '/api/v1/auth/logout') {
      cookie = null;
      document.cookie = 'has_session=; path=/; max-age=0';
      return new Response(null, { status: 204 });
    }
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token || !validTokens.has(token)) {
      return Response.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
    }
    return Response.json({ ok: true, token });
  });

  vi.stubGlobal('fetch', fetchMock);
  return {
    calls,
    refreshCalls: () => calls.filter((call) => call.endsWith('/auth/refresh')).length,
    /** Every access token issued so far stops working (as when they expire). */
    expireAccessTokens: () => validTokens.clear(),
    signOutEverywhere: () => {
      cookie = null;
    },
  };
}
