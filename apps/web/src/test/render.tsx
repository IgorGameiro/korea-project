import type { Locale } from '@korea-project/shared';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { CurrencyProvider, type Rate } from '@/lib/currency/currency-context';
import en from '@/messages/en.json';
import ptBR from '@/messages/pt-BR.json';

export const testRates: Rate[] = [
  { currency: 'USD', rate: 0.00072, updatedAt: '2026-10-01T00:00:00Z' },
  { currency: 'BRL', rate: 0.0039, updatedAt: '2026-10-01T00:00:00Z' },
];

/** Renders with the real messages of a locale and the currency provider, like the app does. */
export function renderWithApp(
  ui: ReactNode,
  { locale = 'en', rates = testRates }: { locale?: Locale; rates?: Rate[] } = {},
) {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={locale === 'en' ? en : ptBR}
      timeZone="Asia/Seoul"
    >
      <CurrencyProvider locale={locale} rates={rates}>
        {ui}
      </CurrencyProvider>
    </NextIntlClientProvider>,
  );
}
