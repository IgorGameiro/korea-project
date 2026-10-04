import type { CostTier } from '@korea-project/shared';

// Calculator input and its URL form (/plan?city=seoul&people=2&days=5&tier=mid).
// Same limits as the API's CalculateCostDto (which validates again).

export const PEOPLE = { min: 1, max: 20, initial: 2 } as const;
export const DAYS = { min: 1, max: 30, initial: 5 } as const;
export const TIERS: CostTier[] = ['BUDGET', 'MID', 'LUXURY'];
export const DEFAULT_TIER: CostTier = 'MID';

export interface CalculatorInput {
  citySlug: string;
  people: number;
  days: number;
  tier: CostTier;
}

const integerIn = (raw: string | null, range: { min: number; max: number; initial: number }) => {
  if (raw === null || !/^\d{1,3}$/.test(raw)) return range.initial;
  const value = Number(raw);
  return value >= range.min && value <= range.max ? value : range.initial;
};

/** Reads /plan's query. Every invalid or missing value falls back to its default. */
export function parsePlanParams(
  params: URLSearchParams,
  citySlugs: readonly string[],
): CalculatorInput {
  const city = params.get('city');
  const tier = params.get('tier')?.toUpperCase();
  return {
    citySlug: city && citySlugs.includes(city) ? city : (citySlugs[0] ?? ''),
    people: integerIn(params.get('people'), PEOPLE),
    days: integerIn(params.get('days'), DAYS),
    tier: TIERS.find((value) => value === tier) ?? DEFAULT_TIER,
  };
}

export function planQuery(input: CalculatorInput): string {
  return new URLSearchParams({
    city: input.citySlug,
    people: String(input.people),
    days: String(input.days),
    tier: input.tier.toLowerCase(),
  }).toString();
}

export const clamp = (value: number, range: { min: number; max: number }) =>
  Math.min(range.max, Math.max(range.min, value));
