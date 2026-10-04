'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { type CityOption, CostCalculator } from './cost-calculator';
import { parsePlanParams, planQuery } from './params';

/**
 * Calculator on /plan: the input lives in the URL, so a plan can be shared or bookmarked.
 * useSearchParams makes this a client-only island: the page renders it inside <Suspense>.
 */
export function PlanCalculator({ cities }: { cities: CityOption[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const slugs = useMemo(() => cities.map((city) => city.slug), [cities]);
  const value = parsePlanParams(params, slugs);

  return (
    <CostCalculator
      value={value}
      cities={cities}
      onChange={(next) => router.replace(`${pathname}?${planQuery(next)}`, { scroll: false })}
    />
  );
}
