// Languages and currencies supported by the product.

/** BCP 47 language tags, used verbatim in the database, the API and the web routes. */
export const LOCALES = ['en', 'pt-BR'] as const;
export type Locale = (typeof LOCALES)[number];

/** Content is always available in the default locale; other locales fall back to it. */
export const DEFAULT_LOCALE: Locale = 'en';

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

/** Currencies a price can be displayed in. Amounts are stored in KRW and converted. */
export const DISPLAY_CURRENCIES = ['USD', 'BRL'] as const;
export type DisplayCurrency = (typeof DISPLAY_CURRENCIES)[number];

/** Currency preselected for each locale; the user can still pick another one. */
export const DEFAULT_CURRENCY_BY_LOCALE: Record<Locale, DisplayCurrency> = {
  en: 'USD',
  'pt-BR': 'BRL',
};

export const isDisplayCurrency = (value: unknown): value is DisplayCurrency =>
  typeof value === 'string' && (DISPLAY_CURRENCIES as readonly string[]).includes(value);
