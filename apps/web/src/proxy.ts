import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next 16 renamed the `middleware` file convention to `proxy`. It resolves the locale from the URL
// (/pt -> pt-BR) and rewrites to the [locale] segment; it never reads the currency cookie.
export default createMiddleware(routing);

export const config = {
  // Everything except Next internals, the API and files with an extension (images, robots.txt…).
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
