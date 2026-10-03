import { PlaceCategory } from '@korea-project/shared';

export const SEARCH_MIN = 2;
export const SEARCH_MAX = 100;
const MAX_PAGE = 1000;

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const isCategory = (value: string | undefined): value is PlaceCategory =>
  (Object.values(PlaceCategory) as string[]).includes(value ?? '');

export interface ParsedSearch {
  q: string;
  category?: PlaceCategory;
  page: number;
  /** Why the term cannot be searched, if it cannot. */
  problem?: 'tooShort' | 'tooLong';
  /** Whether there is something to ask the API for. */
  searchable: boolean;
}

/**
 * Reads the URL safely: an invalid category or page falls back to the default (no filter, page 1)
 * instead of breaking the page, and a term outside 2–100 characters is reported, not sent.
 */
export function parseSearchParams(raw: RawParams): ParsedSearch {
  const q = (first(raw.q) ?? '').trim();
  const categoryValue = first(raw.category);
  const category = isCategory(categoryValue) ? categoryValue : undefined;
  const pageNumber = Number(first(raw.page));
  const page =
    Number.isInteger(pageNumber) && pageNumber >= 1 && pageNumber <= MAX_PAGE ? pageNumber : 1;

  const problem =
    q.length > SEARCH_MAX
      ? 'tooLong'
      : q.length > 0 && q.length < SEARCH_MIN
        ? 'tooShort'
        : undefined;
  const searchable = problem === undefined && (q.length > 0 || category !== undefined);
  return { q, category, page, problem, searchable };
}
