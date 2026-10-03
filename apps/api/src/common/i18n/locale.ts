import { DEFAULT_LOCALE, type Locale, LOCALES } from '@korea-project/shared';

export interface ResolvedLocale {
  locale: Locale;
  /**
   * True when the response depends on the Accept-Language header (no `?locale=` was given),
   * so caches must key on it: the caller sends `Vary: Accept-Language`.
   */
  fromHeader: boolean;
}

/** Case-insensitive match against the supported BCP 47 tags ("pt-br" -> "pt-BR"). */
export function normalizeLocale(value: unknown): Locale | undefined {
  if (typeof value !== 'string') return undefined;
  const wanted = value.trim().toLowerCase();
  return LOCALES.find((locale) => locale.toLowerCase() === wanted);
}

/**
 * Best supported locale for an Accept-Language header, honoring q-values.
 * Exact tags win; otherwise the primary language matches ("pt-PT" or "pt" -> "pt-BR", "en-GB" -> "en").
 */
export function matchAcceptLanguage(header: string | undefined): Locale | undefined {
  if (!header) return undefined;

  const ranges = header
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return { tag: tag.trim(), q: q ? Number(q.slice(2)) : 1, index };
    })
    .filter(({ tag, q }) => tag && tag !== '*' && q > 0 && !Number.isNaN(q))
    .sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { tag } of ranges) {
    const exact = normalizeLocale(tag);
    if (exact) return exact;
    const primary = tag.toLowerCase().split('-')[0];
    const sameLanguage = LOCALES.find((locale) => locale.toLowerCase().split('-')[0] === primary);
    if (sameLanguage) return sameLanguage;
  }
  return undefined;
}

/**
 * Locale for a request: `?locale=` wins (an unsupported value falls back to the default, never 400),
 * then Accept-Language, then the default locale.
 */
export function resolveLocale(query: unknown, acceptLanguage: string | undefined): ResolvedLocale {
  if (query !== undefined) {
    const value = Array.isArray(query) ? (query as unknown[])[0] : query;
    return { locale: normalizeLocale(value) ?? DEFAULT_LOCALE, fromHeader: false };
  }
  return { locale: matchAcceptLanguage(acceptLanguage) ?? DEFAULT_LOCALE, fromHeader: true };
}
