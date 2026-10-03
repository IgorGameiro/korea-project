import { DEFAULT_LOCALE, LOCALES } from '@korea-project/shared';
import { defineRouting } from 'next-intl/routing';

/**
 * English at the root (/cities/seoul), Portuguese under /pt (/pt/cities/seoul).
 * The URL prefix "/pt" maps to the BCP 47 tag "pt-BR" used everywhere else (API, database, html lang)
 * through `localePrefix.prefixes` (next-intl 4.14: LocalePrefixConfigVerbose).
 */
export const routing = defineRouting({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: {
    mode: 'as-needed',
    prefixes: { 'pt-BR': '/pt' },
  },
  // English is the default for everyone; Portuguese is an explicit choice, never an automatic
  // redirect based on Accept-Language.
  localeDetection: false,
  // hreflang alternates (with x-default) are emitted as <link> tags by generateMetadata instead.
  alternateLinks: false,
});
