import type { Paginated } from '@korea-project/shared';

/** Builds the standard list response `{ data, meta }`. */
export function paginate<T>(
  data: T[],
  total: number,
  { page, limit }: { page: number; limit: number },
): Paginated<T> {
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
