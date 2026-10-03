'use client';

import type { Locale } from '@korea-project/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useCurrency } from '@/lib/currency/currency-context';
import { formatMoney } from '@/lib/format';

/**
 * A KRW price with its equivalent in the visitor's currency: "₩26,000 ≈ $18.72".
 * The KRW part is always shown; the converted part appears only when a rate is available.
 */
export function PriceTag({ krw, suffix }: { krw: number; suffix?: string }) {
  const t = useTranslations('price');
  const locale = useLocale() as Locale;
  const { currency, convert } = useCurrency();

  if (krw === 0) return <span className="font-semibold">{t('free')}</span>;

  const converted = convert(krw);
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      <span className="font-semibold">{formatMoney(krw, 'KRW', locale)}</span>
      {converted !== null ? (
        <span className="text-sm text-navy-700">
          {t('approx', { amount: formatMoney(converted, currency, locale) })}
        </span>
      ) : null}
      {suffix ? <span className="text-sm text-navy-700">{suffix}</span> : null}
    </span>
  );
}

/** ₩ symbols for the 1–4 price level, with a spoken equivalent. */
export function PriceLevel({ level }: { level: number }) {
  const t = useTranslations('price');
  return (
    <span className="font-semibold tracking-wide" role="img" aria-label={t('level', { level })}>
      <span aria-hidden="true">{'₩'.repeat(level)}</span>
      <span aria-hidden="true" className="text-navy-200">
        {'₩'.repeat(4 - level)}
      </span>
    </span>
  );
}
