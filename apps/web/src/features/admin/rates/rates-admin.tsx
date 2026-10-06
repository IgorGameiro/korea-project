'use client';

import { DISPLAY_CURRENCIES, type DisplayCurrency } from '@korea-project/shared';
import { useEffect, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { browserApi } from '@/features/auth/browser-api';
import type { components } from '@/lib/api/schema';
import { describeError, unwrap } from '../admin-api';
import { ErrorBanner, Notice } from '../form-parts';

type Rate = components['schemas']['ExchangeRateDto'];
/** Positive, at most 8 decimal places (same rule as the API). */
const RATE = /^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/;

/** /admin/exchange-rates: KRW -> USD/BRL, used by the calculator and every converted price. */
export function RatesAdmin() {
  const [rates, setRates] = useState<Rate[] | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    unwrap(browserApi().GET('/api/v1/exchange-rates'))
      .then((response) => setRates(response.rates))
      .catch((error: unknown) => setFailure(describeError(error)));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Exchange rates</h1>
      <p className="text-sm text-navy-700">
        How many units of each currency one won buys. Changes apply at once to the calculator; pages
        show them when they refresh.
      </p>
      <ErrorBanner message={failure} />
      {rates === null && !failure ? <Skeleton className="h-40 w-full" /> : null}
      {rates ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {DISPLAY_CURRENCIES.map((currency) => (
            <RateCard
              key={currency}
              currency={currency}
              rate={rates.find((r) => r.currency === currency)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RateCard({ currency, rate }: { currency: DisplayCurrency; rate?: Rate }) {
  const [saved, setSaved] = useState(rate);
  const [value, setValue] = useState(rate ? String(rate.rate) : '');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const valid = RATE.test(value.trim()) && Number(value) > 0;
  const id = `rate-${currency}`;

  const save = async () => {
    setNotice(null);
    setFailure(null);
    if (!valid) {
      setFailure('A positive number with at most 8 decimal places, e.g. 0.00072.');
      return;
    }
    setBusy(true);
    try {
      const result = await unwrap(
        browserApi().PUT('/api/v1/admin/exchange-rates/{currency}', {
          params: { path: { currency } },
          body: { rate: Number(value) },
        }),
      );
      setSaved(result);
      setNotice(`${currency} rate saved.`);
    } catch (error) {
      setFailure(describeError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="flex flex-col gap-3 rounded-[var(--radius-card)] p-5 ring-1 ring-navy-100"
    >
      <h2 id={`${id}-title`} className="font-bold">
        KRW → {currency}
      </h2>
      <p className="text-sm text-navy-700">
        {saved
          ? `Updated ${new Date(saved.updatedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })} (source: ${saved.source}).`
          : 'Not set: prices are shown in KRW only and the calculator refuses this currency.'}
      </p>
      <label htmlFor={id} className="text-sm font-semibold">
        1 KRW in {currency}
      </label>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        aria-invalid={value !== '' && !valid ? true : undefined}
        aria-describedby={`${id}-preview`}
        onChange={(e) => setValue(e.target.value.trim())}
        className="rounded-lg border border-navy-200 bg-white px-3 py-2 font-mono"
      />
      <p id={`${id}-preview`} className="text-xs text-navy-700">
        {valid
          ? `So 1 ${currency} ≈ ₩${Math.round(1 / Number(value)).toLocaleString('en-US')}.`
          : ' '}
      </p>
      <Notice message={notice} />
      <ErrorBanner message={failure} />
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className={buttonClasses('primary', 'self-start')}
      >
        {busy ? 'Saving…' : `Save ${currency} rate`}
      </button>
    </section>
  );
}
