import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/env';

/**
 * Everything is crawlable except the admin and the API. Search results, login, register and the
 * account page are NOT blocked here on purpose: they carry `noindex`, and a crawler must be able to
 * fetch a page to see that (a blocked URL can still be indexed from links, without content).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/pt/admin', '/api/'],
    },
    sitemap: new URL('/sitemap.xml', siteUrl).toString(),
    host: siteUrl,
  };
}
