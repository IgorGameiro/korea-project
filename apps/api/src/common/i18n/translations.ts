import { DEFAULT_LOCALE, type Locale } from '@korea-project/shared';

/** Locales worth loading for a request: the requested one plus the default, for fallback. */
export const localesToLoad = (locale: Locale): Locale[] =>
  locale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [locale, DEFAULT_LOCALE];

/** Prisma `include` fragment that loads only the translations a response can use. */
export const translationsFor = (locale: Locale) => ({
  where: { locale: { in: localesToLoad(locale) } },
});

/** The requested translation, else the default-locale one, else any (data should never get there). */
export function pickTranslation<T extends { locale: string }>(
  rows: readonly T[],
  locale: Locale,
): T | undefined {
  return (
    rows.find((row) => row.locale === locale) ??
    rows.find((row) => row.locale === DEFAULT_LOCALE) ??
    rows[0]
  );
}
