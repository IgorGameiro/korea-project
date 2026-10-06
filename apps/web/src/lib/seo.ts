import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { siteUrl } from './env';

export const absolute = (locale: Locale, href: string) =>
  new URL(getPathname({ href, locale }), siteUrl).toString();

/** Absolute URL of a page in every locale, plus x-default (English). */
export function languageUrls(href: string): Record<string, string> {
  return {
    ...Object.fromEntries(routing.locales.map((l) => [l, absolute(l, href)])),
    'x-default': absolute(routing.defaultLocale, href),
  };
}

/** Open Graph locale format: "pt-BR" -> "pt_BR". */
export const ogLocale = (locale: Locale) => locale.replace('-', '_');

/**
 * canonical + hreflang alternates for a page, rendered as <link rel="alternate" hreflang="…">.
 * x-default points to the English (default-locale) URL.
 */
export function alternatesFor(href: string, locale: Locale): Metadata['alternates'] {
  return {
    canonical: absolute(locale, href),
    languages: languageUrls(href),
  };
}

/**
 * Complete Open Graph data for a page. A page's `openGraph` replaces its parent's object entirely,
 * so every page passes the shared fields again (site name, locale and its alternate).
 */
export function openGraphFor({
  locale,
  siteName,
  title,
  description,
  images,
  type = 'website',
}: {
  locale: Locale;
  siteName: string;
  title?: string;
  description?: string;
  images?: string[];
  type?: 'website' | 'article';
}): Metadata['openGraph'] {
  return {
    siteName,
    type,
    locale: ogLocale(locale),
    alternateLocale: routing.locales.filter((l) => l !== locale).map(ogLocale),
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    images:
      images && images.length > 0
        ? images
        : [{ url: absolute(locale, '/og'), width: 1200, height: 630, alt: siteName }],
  };
}
