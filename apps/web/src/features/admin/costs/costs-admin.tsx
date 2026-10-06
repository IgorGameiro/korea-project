'use client';

import { useEffect, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { browserApi } from '@/features/auth/browser-api';
import type { components } from '@/lib/api/schema';
import { describeError, mutate, unwrap } from '../admin-api';
import { ErrorBanner, Notice } from '../form-parts';
import { TIER_LABELS, TIERS } from '../stays/stay-form';
import { useAdminCities } from '../use-admin-data';

type CostEstimate = components['schemas']['CostEstimateDto'];
type Tier = (typeof TIERS)[number];
const FIELDS = [
  ['lodgingPerRoomPerNightKRW', 'Lodging per room per night'],
  ['foodPerPersonPerDayKRW', 'Food per person per day'],
  ['transportPerPersonPerDayKRW', 'Transport per person per day'],
  ['activitiesPerPersonPerDayKRW', 'Activities per person per day'],
] as const;
type Field = (typeof FIELDS)[number][0];

/** /admin/costs: the three travel styles of a city, each saved on its own. */
export function CostsAdmin() {
  const cities = useAdminCities();
  const [cityId, setCityId] = useState('');
  const [estimates, setEstimates] = useState<{ cityId: string; items: CostEstimate[] } | null>(
    null,
  );
  const [failure, setFailure] = useState<string | null>(null);
  const selected = cityId || cities?.[0]?.id || '';

  useEffect(() => {
    if (!selected) return;
    let active = true;
    unwrap(
      browserApi().GET('/api/v1/admin/cost-estimates', {
        params: { query: { cityId: selected, limit: 10 } },
      }),
    )
      .then((page) => {
        if (active) setEstimates({ cityId: selected, items: page.data });
      })
      .catch((error: unknown) => {
        if (active) setFailure(describeError(error));
      });
    return () => {
      active = false;
    };
  }, [selected]);

  const current = estimates?.cityId === selected ? estimates.items : null;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Cost estimates</h1>
      <p className="text-sm text-navy-700">
        The trip calculator uses these amounts (KRW). Each travel style is saved separately.
      </p>
      <label className="flex w-fit flex-col gap-1 text-sm font-semibold">
        City
        <select
          value={selected}
          onChange={(e) => setCityId(e.target.value)}
          className="rounded-lg border border-navy-200 bg-white px-3 py-2"
        >
          {cities?.map((city) => (
            <option key={city.id} value={city.id}>
              {city.translations.en.name}
            </option>
          ))}
        </select>
      </label>
      <ErrorBanner message={failure} />
      {current === null && !failure ? <Skeleton className="h-64 w-full" /> : null}
      {current ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier) => (
            <TierCard
              key={`${selected}-${tier}`}
              cityId={selected}
              tier={tier}
              estimate={current.find((estimate) => estimate.tier === tier)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TierCard({
  cityId,
  tier,
  estimate,
}: {
  cityId: string;
  tier: Tier;
  estimate?: CostEstimate;
}) {
  const [saved, setSaved] = useState(estimate);
  const [values, setValues] = useState<Record<Field, string>>(
    () =>
      Object.fromEntries(
        FIELDS.map(([field]) => [field, estimate ? String(estimate[field]) : '']),
      ) as Record<Field, string>,
  );
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const invalid = FIELDS.filter(([field]) => !/^\d+$/.test(values[field].trim()));

  const save = async () => {
    setNotice(null);
    setFailure(null);
    if (invalid.length > 0) {
      setFailure('Every amount must be a whole number of won (0 or more).');
      return;
    }
    const amounts = Object.fromEntries(
      FIELDS.map(([field]) => [field, Number(values[field])]),
    ) as Record<Field, number>;
    setBusy(true);
    try {
      const result = saved
        ? await mutate(
            browserApi().PATCH('/api/v1/admin/cost-estimates/{id}', {
              params: { path: { id: saved.id } },
              body: amounts,
            }),
          )
        : await mutate(
            browserApi().POST('/api/v1/admin/cost-estimates', {
              body: { cityId, tier, ...amounts },
            }),
          );
      setSaved(result);
      setNotice(`${TIER_LABELS[tier]} saved.`);
    } catch (error) {
      setFailure(describeError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-labelledby={`tier-${tier}`}
      className="flex flex-col gap-3 rounded-[var(--radius-card)] p-5 ring-1 ring-navy-100"
    >
      <h2 id={`tier-${tier}`} className="font-bold">
        {TIER_LABELS[tier]}
        {saved ? null : <span className="ml-2 text-sm font-normal text-coral-700">not set</span>}
      </h2>
      {FIELDS.map(([field, label]) => {
        const id = `${tier}-${field}`;
        const bad = invalid.some(([f]) => f === field) && values[field] !== '';
        return (
          <div key={field} className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-semibold">
              {label} (KRW)
            </label>
            <input
              id={id}
              inputMode="numeric"
              value={values[field]}
              aria-invalid={bad ? true : undefined}
              onChange={(e) => setValues((v) => ({ ...v, [field]: e.target.value }))}
              className={`rounded-lg border bg-white px-3 py-2 ${bad ? 'border-coral-600' : 'border-navy-200'}`}
            />
          </div>
        );
      })}
      <Notice message={notice} />
      <ErrorBanner message={failure} />
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className={buttonClasses('primary', 'self-start')}
      >
        {busy ? 'Saving…' : `Save ${TIER_LABELS[tier]}`}
      </button>
    </section>
  );
}
