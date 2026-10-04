import type { PlaceCategory } from '@korea-project/shared';
import { CATEGORIES, CATEGORY_META } from './categories';

// City sections are URL segments: /cities/seoul/restaurants … /cities/seoul/stays.
// This module has no server-only imports because the proxy uses it too.

export const STAYS_SECTION = 'stays';

export const PLACE_SECTIONS = CATEGORIES.map((category) => CATEGORY_META[category].section);
export const SECTIONS = [...PLACE_SECTIONS, STAYS_SECTION];

export const isSection = (value: string): boolean => SECTIONS.includes(value);

export const categoryForSection = (section: string): PlaceCategory | undefined =>
  CATEGORIES.find((category) => CATEGORY_META[category].section === section);

/** Query parameters that change a section listing. Anything else is ignored. */
export const FILTER_PARAMS = [
  'district',
  'price',
  'rating',
  'difficulty',
  'sort',
  'tier',
  'type',
  'page',
] as const;

export const hasFilterParams = (params: URLSearchParams): boolean =>
  FILTER_PARAMS.some((name) => params.has(name));

/**
 * Public section path ("/cities/seoul/hiking" or "/pt/cities/seoul/hiking"), without a trailing
 * slash. Returns null for any other path.
 */
const SECTION_PATH = /^(\/pt)?\/cities\/[a-z0-9-]+\/([a-z-]+)\/?$/;
export const matchSectionPath = (pathname: string): boolean => {
  const match = SECTION_PATH.exec(pathname);
  return match !== null && isSection(match[2] ?? '');
};
