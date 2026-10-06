import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import proxy from './proxy';

const run = (path: string, headers?: Record<string, string>) =>
  proxy(new NextRequest(new URL(path, 'http://localhost:3000'), { headers }));

const rewriteOf = (response: Response) => {
  const target = response.headers.get('x-middleware-rewrite');
  return target ? new URL(target).pathname + new URL(target).search : null;
};

const forwardedHeader = (response: Response, name: string) =>
  response.headers.get(`x-middleware-request-${name}`);

describe('proxy', () => {
  it('serves an unfiltered section from the static route', () => {
    expect(rewriteOf(run('/cities/seoul/hiking'))).toBe('/en/cities/seoul/hiking');
    expect(rewriteOf(run('/pt/cities/seoul/hiking'))).toBe('/pt-BR/cities/seoul/hiking');
  });

  it('rewrites a filtered section to the dynamic route, keeping the query', () => {
    const response = run('/cities/seoul/hiking?difficulty=easy');
    expect(rewriteOf(response)).toBe('/en/cities/seoul/hiking/filtered?difficulty=easy');
    expect(forwardedHeader(response, 'x-kp-filtered-section')).toBe('1');
    expect(rewriteOf(run('/pt/cities/seoul/stays?tier=budget'))).toBe(
      '/pt-BR/cities/seoul/stays/filtered?tier=budget',
    );
  });

  it('ignores unrelated query parameters', () => {
    expect(rewriteOf(run('/cities/seoul/hiking?utm_source=x'))).toBe(
      '/en/cities/seoul/hiking?utm_source=x',
    );
  });

  it('keeps public paths in locale redirects', () => {
    const response = run('/en/cities/seoul/hiking?difficulty=easy');
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(new URL(response.headers.get('location')!).pathname).toBe('/cities/seoul/hiking');
  });

  it('never trusts a client-sent filtered header', () => {
    const response = run('/cities/seoul/hiking/filtered', { 'x-kp-filtered-section': '1' });
    expect(forwardedHeader(response, 'x-kp-filtered-section')).toBeNull();
  });

  it('sends the Portuguese admin URLs to the English admin, keeping the page', () => {
    const response = run('/pt/admin/cities/abc?tab=districts');
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get('location')!);
    expect(location.pathname + location.search).toBe('/admin/cities/abc?tab=districts');
    expect(run('/pt/administrator').status).not.toBe(307);
  });
});
