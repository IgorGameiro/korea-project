'use client';

import { DISPLAY_CURRENCIES, isDisplayCurrency } from '@korea-project/shared';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { useCurrency } from '@/lib/currency/currency-context';

export function CurrencySwitcher() {
  const t = useTranslations();
  const { currency, setCurrency } = useCurrency();
  const id = useId();

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <label htmlFor={id} className="sr-only">
        {t('header.switchCurrency')}
      </label>
      <select
        id={id}
        value={currency}
        onChange={(event) => {
          if (isDisplayCurrency(event.target.value)) setCurrency(event.target.value);
        }}
        className="rounded-full border border-navy-200 bg-white px-2.5 py-1 font-semibold text-navy-900"
      >
        {DISPLAY_CURRENCIES.map((code) => (
          <option key={code} value={code}>
            {code} — {t(`currencyNames.${code}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
