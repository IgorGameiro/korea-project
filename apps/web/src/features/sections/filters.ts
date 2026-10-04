import {
  CostTier,
  AccommodationType,
  type PlaceCategory,
  TrailDifficulty,
} from '@korea-project/shared';

// Section filters live in the URL. Every value is validated here: anything invalid falls back to
// the default (no filter / first page) instead of producing an error or reaching the API.

type RawParams = Record<string, string | string[] | undefined>;

const MAX_PAGE = 1000;
export const RATING_STEPS = [3, 3.5, 4, 4.5] as const;
export const PRICE_LEVELS = [1, 2, 3, 4] as const;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** "price=1,2" and "price=1&price=2" (what a checkbox group submits) are both accepted. */
const list = (value: string | string[] | undefined): string[] =>
  (Array.isArray(value) ? value : [value ?? ''])
    .flatMap((item) => item.split(','))
    .map((item) => item.trim())
    .filter(Boolean);

const oneOf = <T extends string>(values: readonly T[], raw: string | undefined): T | undefined =>
  values.find((value) => value.toLowerCase() === raw?.toLowerCase());

const parsePage = (raw: string | undefined): number => {
  const page = Number(raw);
  return Number.isInteger(page) && page >= 1 && page <= MAX_PAGE ? page : 1;
};

export interface DistrictRef {
  id: string;
  slug: string;
}

const parseDistrict = (raw: string | undefined, districts: DistrictRef[]) =>
  districts.find((district) => district.slug === raw);

export interface PlaceFilters {
  district?: DistrictRef;
  price: number[];
  rating?: number;
  difficulty?: TrailDifficulty;
  sort: 'rating' | 'price';
  page: number;
}

export function parsePlaceFilters(
  raw: RawParams,
  { districts, category }: { districts: DistrictRef[]; category: PlaceCategory },
): PlaceFilters {
  const price = [
    ...new Set(
      list(raw.price)
        .map(Number)
        .filter((n) => PRICE_LEVELS.includes(n as 1)),
    ),
  ].sort((a, b) => a - b);
  const rating = Number(first(raw.rating));
  return {
    district: parseDistrict(first(raw.district), districts),
    price,
    rating: RATING_STEPS.includes(rating as 3) ? rating : undefined,
    // Difficulty only exists for trails.
    difficulty:
      category === 'HIKING'
        ? oneOf(Object.values(TrailDifficulty), first(raw.difficulty))
        : undefined,
    sort: first(raw.sort) === 'price' ? 'price' : 'rating',
    page: parsePage(first(raw.page)),
  };
}

export interface StayFilters {
  district?: DistrictRef;
  tier?: CostTier;
  type?: AccommodationType;
  sort: 'price' | '-price';
  page: number;
}

export function parseStayFilters(
  raw: RawParams,
  { districts }: { districts: DistrictRef[] },
): StayFilters {
  return {
    district: parseDistrict(first(raw.district), districts),
    tier: oneOf(Object.values(CostTier), first(raw.tier)),
    type: oneOf(Object.values(AccommodationType), first(raw.type)),
    sort: first(raw.sort) === 'price-desc' ? '-price' : 'price',
    page: parsePage(first(raw.page)),
  };
}

/** The URL query for a set of filters: defaults are left out, so "no filter" means no query. */
export function placeFiltersQuery(filters: PlaceFilters, page = filters.page) {
  return clean({
    district: filters.district?.slug,
    price: filters.price.length > 0 ? filters.price.join(',') : undefined,
    rating: filters.rating?.toString(),
    difficulty: filters.difficulty?.toLowerCase(),
    sort: filters.sort === 'rating' ? undefined : filters.sort,
    page: page > 1 ? String(page) : undefined,
  });
}

export function stayFiltersQuery(filters: StayFilters, page = filters.page) {
  return clean({
    district: filters.district?.slug,
    tier: filters.tier?.toLowerCase(),
    type: filters.type?.toLowerCase(),
    sort: filters.sort === '-price' ? 'price-desc' : undefined,
    page: page > 1 ? String(page) : undefined,
  });
}

const clean = (query: Record<string, string | undefined>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(query).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
