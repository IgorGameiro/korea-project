import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { FILTERED_HEADER, FILTERED_SEGMENT } from './lib/filtered-route';
import { hasFilterParams, matchSectionPath } from './lib/sections';

// Next 16 renamed the `middleware` file convention to `proxy`. It resolves the locale from the URL
// (/pt -> pt-BR) and rewrites to the [locale] segment; it never reads the currency cookie.
const handleI18nRouting = createMiddleware(routing);

/**
 * A city section without filters (/cities/seoul/hiking) is a static ISR page. The same URL with
 * filters (?difficulty=easy) is rewritten — invisibly, the public URL stays the same — to a dynamic
 * sibling route that reads the query, so filtering never turns the static page dynamic.
 */
export default function proxy(request: NextRequest): NextResponse {
  // next-intl only reads the URL, headers and cookies; it forwards these headers on its rewrite.
  // Only the proxy may mark a request as filtered (the route 404s without the header), so a
  // client-sent copy is always dropped.
  const headers = new Headers(request.headers);
  headers.delete(FILTERED_HEADER);

  const { pathname, searchParams } = request.nextUrl;

  // The admin exists in English only: /pt/admin/... -> /admin/... (same page).
  if (/^\/pt\/admin(\/|$)/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice('/pt'.length);
    return NextResponse.redirect(url);
  }
  if (matchSectionPath(pathname) && hasFilterParams(searchParams)) {
    const url = request.nextUrl.clone();
    url.pathname = `${pathname.replace(/\/$/, '')}/${FILTERED_SEGMENT}`;
    const filteredHeaders = new Headers(headers);
    filteredHeaders.set(FILTERED_HEADER, '1');
    const response = handleI18nRouting(new NextRequest(url, { headers: filteredHeaders }));
    // Locale redirects (e.g. /en/... -> /...) must keep the public path: handle them normally.
    if (!isRedirect(response)) return response;
  }
  return handleI18nRouting(new NextRequest(request.nextUrl, { headers }));
}

const isRedirect = (response: NextResponse) => response.status >= 300 && response.status < 400;

export const config = {
  // Everything except Next internals, the API and files with an extension (images, robots.txt…).
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
