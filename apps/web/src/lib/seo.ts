import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { siteUrl } from './env';

const absolute = (locale: Locale, href: string) =>
  new URL(getPathname({ href, locale }), siteUrl).toString();

/**
 * canonical + hreflang alternates for a page, rendered as <link rel="alternate" hreflang="…">.
 * x-default points to the English (default-locale) URL.
 */
export function alternatesFor(href: string, locale: Locale): Metadata['alternates'] {
  return {
    canonical: absolute(locale, href),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, absolute(l, href)])),
      'x-default': absolute(routing.defaultLocale, href),
    },
  };
}
