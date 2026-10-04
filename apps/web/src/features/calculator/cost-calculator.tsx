'use client';

import type { Locale } from '@korea-project/shared';
import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { CostCalculationDto } from '@/lib/api/types';
import { useCurrency } from '@/lib/currency/currency-context';
import { formatMoney } from '@/lib/format';
import { type CalculatorInput, clamp, DAYS, PEOPLE, TIERS } from './params';
import { useCostEstimate } from './use-cost-estimate';

export interface CityOption {
  slug: string;
  name: string;
}

/**
 * Trip cost calculator. Controlled: the city page keeps the input in state, /plan keeps it in the
 * URL. The numbers come from the API (the rule lives in the back end); this only displays them.
 */
export function CostCalculator({
  value,
  onChange,
  cities,
  delayMs,
}: {
  value: CalculatorInput;
  onChange: (next: CalculatorInput) => void;
  /** When given, the city can be chosen (on /plan). */
  cities?: CityOption[];
  delayMs?: number;
}) {
  const t = useTranslations('calculator');
  const tTier = useTranslations('tiers');
  const estimate = useCostEstimate(value, delayMs);
  const set = (patch: Partial<CalculatorInput>) => onChange({ ...value, ...patch });
  const ids = useId();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <form
        className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-navy-50 p-5"
        onSubmit={(event) => event.preventDefault()}
      >
        {cities ? (
          <div className="flex flex-col gap-1">
            <label htmlFor={`${ids}-city`} className="text-sm font-semibold">
              {t('city')}
            </label>
            <select
              id={`${ids}-city`}
              value={value.citySlug}
              onChange={(event) => set({ citySlug: event.target.value })}
              className="rounded-lg border border-navy-200 bg-white px-3 py-2.5"
            >
              {cities.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <Stepper
          label={t('people')}
          value={value.people}
          range={PEOPLE}
          onChange={(people) => set({ people })}
        />
        <Stepper
          label={t('days')}
          value={value.days}
          range={DAYS}
          onChange={(days) => set({ days })}
        />

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold">{t('style')}</legend>
          {TIERS.map((tier) => (
            <label
              key={tier}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-navy-200 bg-white p-3 has-[:checked]:border-navy-900 has-[:checked]:ring-1 has-[:checked]:ring-navy-900"
            >
              <input
                type="radio"
                name={`${ids}-tier`}
                value={tier}
                checked={value.tier === tier}
                onChange={() => set({ tier })}
                className="mt-1 accent-navy-900"
              />
              <span>
                <span className="block font-semibold">{tTier(tier)}</span>
                <span className="block text-sm text-navy-700">{t(`tierHints.${tier}`)}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </form>

      <section
        aria-labelledby={`${ids}-result`}
        aria-live="polite"
        aria-busy={estimate.loading}
        className="rounded-[var(--radius-card)] p-5 ring-1 ring-navy-100"
      >
        <h3 id={`${ids}-result`} className="text-lg font-bold">
          {t('result')}
        </h3>
        {estimate.error ? (
          <ErrorMessage code={estimate.error} />
        ) : estimate.data ? (
          <Result data={estimate.data} stale={estimate.loading} />
        ) : (
          <div className="mt-4 flex flex-col gap-3" aria-label={t('calculating')}>
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}
        {estimate.loading && estimate.data ? (
          <p className="sr-only" role="status">
            {t('calculating')}
          </p>
        ) : null}
      </section>
    </div>
  );
}

function ErrorMessage({
  code,
}: {
  code: NonNullable<ReturnType<typeof useCostEstimate>['error']>;
}) {
  const t = useTranslations('calculator');
  const { currency } = useCurrency();
  return (
    <p role="alert" className="mt-4 rounded-lg bg-coral-50 p-3 text-sm font-medium text-coral-700">
      {t(`errors.${code}`, { currency })}
    </p>
  );
}

const BREAKDOWN = [
  { key: 'lodging', color: '#16335c' },
  { key: 'food', color: '#c9353a' },
  { key: 'transport', color: '#1f7a6d' },
  { key: 'activities', color: '#9a6b00' },
] as const;

function Result({ data, stale }: { data: CostCalculationDto; stale: boolean }) {
  const t = useTranslations('calculator');
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const money = (amount: number) => formatMoney(amount, data.currency, locale);
  const krw = (amount: number) => formatMoney(amount, 'KRW', locale);

  return (
    <div className={`mt-3 flex flex-col gap-5 transition-opacity ${stale ? 'opacity-60' : ''}`}>
      <div>
        <p className="text-sm text-navy-700">{t('total')}</p>
        <p className="text-3xl font-bold">{money(data.total.amount)}</p>
        <p className="text-navy-700">{krw(data.total.krw)}</p>
        <p className="mt-2 text-sm">
          {t('perDay', { amount: money(data.perDay.amount) })} ·{' '}
          {t('perPerson', { amount: money(data.perPerson.amount) })}
        </p>
        <p className="mt-1 text-sm text-navy-700">
          {t('tripSummary', {
            people: data.people,
            days: data.days,
            nights: data.nights,
            rooms: data.rooms,
          })}
        </p>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">{t('breakdown')}</h4>
        <ul className="flex flex-col gap-3">
          {BREAKDOWN.map(({ key, color }) => {
            const part = data.breakdown[key];
            const percent = data.total.krw > 0 ? Math.round((part.krw / data.total.krw) * 100) : 0;
            return (
              <li key={key}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                  <span className="font-semibold">{t(`categories.${key}`)}</span>
                  <span>
                    <span className="font-semibold">{money(part.amount)}</span>{' '}
                    <span className="text-navy-700">({krw(part.krw)})</span>
                  </span>
                </div>
                <div
                  className="mt-1 h-2 overflow-hidden rounded-full bg-navy-100"
                  role="img"
                  aria-label={t('share', { category: t(`categories.${key}`), percent })}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${percent}%`, backgroundColor: color }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="text-xs text-navy-700">
        <p>
          {t('rateUsed', {
            rate: format.number(data.exchangeRate.rate, {
              style: 'currency',
              currency: data.currency,
              maximumSignificantDigits: 4,
            }),
            date: format.dateTime(new Date(data.exchangeRate.updatedAt), { dateStyle: 'medium' }),
          })}
        </p>
        <p className="mt-1">{t('disclaimer')}</p>
      </div>
    </div>
  );
}

/** − [n] + control. Typing is allowed; out-of-range values snap back to the limits on blur. */
function Stepper({
  label,
  value,
  range,
  onChange,
}: {
  label: string;
  value: number;
  range: { min: number; max: number };
  onChange: (value: number) => void;
}) {
  const t = useTranslations('calculator');
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const what = label.toLowerCase();

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed)) onChange(clamp(parsed, range));
    setDraft(null);
  };

  const buttonClass =
    'grid size-10 place-items-center rounded-full bg-white text-lg font-bold ring-1 ring-navy-200 hover:bg-navy-50 disabled:opacity-40';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t('fewer', { what })}
          aria-controls={id}
          disabled={value <= range.min}
          onClick={() => onChange(clamp(value - 1, range))}
          className={buttonClass}
        >
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={range.min}
          max={range.max}
          value={draft ?? value}
          onChange={(event) => {
            const raw = event.target.value;
            setDraft(raw);
            const parsed = Number(raw);
            if (Number.isInteger(parsed) && parsed >= range.min && parsed <= range.max) {
              onChange(parsed);
            }
          }}
          onBlur={(event) => commit(event.target.value)}
          className="w-20 rounded-lg border border-navy-200 bg-white px-3 py-2 text-center"
        />
        <button
          type="button"
          aria-label={t('more', { what })}
          aria-controls={id}
          disabled={value >= range.max}
          onClick={() => onChange(clamp(value + 1, range))}
          className={buttonClass}
        >
          +
        </button>
      </div>
    </div>
  );
}
