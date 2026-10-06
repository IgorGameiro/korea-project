import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshAfterStartup } from './startup-refresh';

afterEach(() => vi.unstubAllGlobals());

const options = {
  apiUrl: 'http://api:3001/api/v1',
  siteOrigin: 'http://127.0.0.1:3000',
  token: 'the-token',
  delayMs: 0,
};

describe('refreshAfterStartup', () => {
  it('waits for the API, then calls the revalidate route with the token', async () => {
    const calls: string[] = [];
    let healthChecks = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init: RequestInit) => {
        calls.push(String(url));
        if (String(url).endsWith('/health')) {
          healthChecks++;
          if (healthChecks < 3) throw new Error('ECONNREFUSED');
          return new Response('{}');
        }
        expect(new Headers(init.headers).get('x-startup-token')).toBe('the-token');
        return Response.json({ revalidated: true });
      }),
    );

    await expect(refreshAfterStartup(options)).resolves.toBe(true);
    expect(calls).toEqual([
      'http://api:3001/api/v1/health',
      'http://api:3001/api/v1/health',
      'http://api:3001/api/v1/health',
      'http://127.0.0.1:3000/api/revalidate',
    ]);
  });

  it('gives up after the attempts without throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('ECONNREFUSED');
      }),
    );
    await expect(refreshAfterStartup({ ...options, attempts: 3 })).resolves.toBe(false);
  });
});
