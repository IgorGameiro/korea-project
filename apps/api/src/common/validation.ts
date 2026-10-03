/** Lowercase ASCII words separated by single hyphens: "gyeongbokgung-palace". */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SLUG_MESSAGE = 'must be lowercase words separated by hyphens (e.g. "seoul-forest")';

/** "true"/"false" query strings to booleans (anything else is left for validation to reject). */
export const toBooleanQuery = ({ value }: { value: unknown }) =>
  value === 'true' ? true : value === 'false' ? false : value;

/** "1,2, 3" (or a repeated query param) to ["1", "2", "3"]; empty items are dropped. */
export const toCommaList = ({ value }: { value: unknown }) => {
  const items = Array.isArray(value) ? (value as unknown[]) : [value];
  return items
    .flatMap((item) => (typeof item === 'string' ? item.split(',') : [item]))
    .map((item) => (typeof item === 'string' ? item.trim() : item))
    .filter((item) => item !== '' && item !== undefined);
};

/**
 * Escapes LIKE/ILIKE wildcards so a search term matches literally. Prisma's `contains` does NOT do
 * this (a search for "%" would match every row). Postgres uses backslash as the default escape.
 */
export const escapeLike = (term: string) => term.replace(/[\\%_]/g, (char) => `\\${char}`);
