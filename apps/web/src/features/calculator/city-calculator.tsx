'use client';

import { useState } from 'react';
import { CostCalculator } from './cost-calculator';
import { type CalculatorInput, DAYS, DEFAULT_TIER, PEOPLE } from './params';

/** Calculator on a city page: the city is fixed and the input lives in local state. */
export function CityCalculator({ citySlug }: { citySlug: string }) {
  const [value, setValue] = useState<CalculatorInput>({
    citySlug,
    people: PEOPLE.initial,
    days: DAYS.initial,
    tier: DEFAULT_TIER,
  });
  return <CostCalculator value={value} onChange={setValue} />;
}
