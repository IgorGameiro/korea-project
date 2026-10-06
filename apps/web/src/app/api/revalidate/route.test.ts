import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const revalidateTag = vi.fn();
const revalidatePath = vi.fn();
vi.mock('next/cache', () => ({ revalidateTag, revalidatePath }));
vi.mock('server-only', () => ({}));

const { POST } = await import('./route');

const post = (authorization?: string) =>
  POST(
    new NextRequest('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: authorization ? { authorization } : {},
    }),
  );

function apiReturns(response: Response | Error) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      expect(String(url)).toMatch(/\/api\/v1\/auth\/me$/);
      expect(new Headers(init.headers).get('authorization')).toBe('Bearer the-token');
      if (response instanceof Error) throw response;
      return response;
    }),
  );
}

beforeEach(() => {
  revalidateTag.mockReset();
  revalidatePath.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

describe('POST /api/revalidate', () => {
  it('requires a bearer token', async () => {
    const response = await post();
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('refuses tokens the API does not accept', async () => {
    apiReturns(Response.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 }));
    expect((await post('Bearer the-token')).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('refuses users without the ADMIN role', async () => {
    apiReturns(Response.json({ id: 'u1', role: 'USER' }));
    const response = await post('Bearer the-token');
    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe('FORBIDDEN');
    expect(revalidateTag).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('lets an ADMIN refresh all content right away', async () => {
    apiReturns(Response.json({ id: 'u1', role: 'ADMIN' }));
    const response = await post('Bearer the-token');
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith('content', { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout');
  });

  it('says so when the API cannot be reached', async () => {
    apiReturns(new Error('ECONNREFUSED'));
    expect((await post('Bearer the-token')).status).toBe(502);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
