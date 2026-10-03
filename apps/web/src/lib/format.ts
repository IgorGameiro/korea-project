import type { DisplayCurrency, Locale } from '@korea-project/shared';

export type Currency = DisplayCurrency | 'KRW';

/** "₩1,250,000", "$900.00", "R$ 4.212,00" — formatted for the reader's locale. */
export function formatMoney(amount: number, currency: Currency, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2,
    minimumFractionDigits: currency === 'KRW' ? 0 : 2,
  }).format(amount);
}

/** KRW amount in another currency, rounded to cents (same rule as the API). */
export const convertKRW = (amountKRW: number, rate: number) =>
  Math.round(amountKRW * rate * 100) / 100;
