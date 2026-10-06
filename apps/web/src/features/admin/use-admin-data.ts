'use client';

import { useEffect, useState } from 'react';
import { browserApi } from '@/features/auth/browser-api';
import type { components } from '@/lib/api/schema';
import { describeError, unwrap } from './admin-api';

export type AdminCity = components['schemas']['AdminCityDto'];
export type AdminDistrict = components['schemas']['AdminDistrictDto'];

interface PageMeta {
  page: number;
  totalPages: number;
  total: number;
}

/**
 * A paginated admin list. `fetchPage` must be stable for a given filter (wrap it in useCallback
 * with the filters as dependencies): a new function reloads from page 1.
 */
export function useAdminList<T>(
  fetchPage: (page: number) => Promise<{ data: T[]; meta: PageMeta }>,
) {
  const [state, setState] = useState<{ items: T[]; meta: PageMeta } | null>(null);
  const [page, setPage] = useState(1);
  const [failure, setFailure] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    fetchPage(page)
      .then((result) => {
        if (!active) return;
        setFailure(null);
        setState({ items: result.data, meta: result.meta });
      })
      .catch((error: unknown) => {
        if (active) setFailure(describeError(error));
      });
    return () => {
      active = false;
    };
  }, [fetchPage, page, version]);

  // A new filter starts again at page 1.
  const [lastFetch, setLastFetch] = useState(() => fetchPage);
  if (lastFetch !== fetchPage) {
    setLastFetch(() => fetchPage);
    setPage(1);
  }

  return {
    items: state?.items ?? null,
    meta: state?.meta ?? null,
    page,
    setPage,
    failure,
    setFailure,
    reload: () => setVersion((v) => v + 1),
  };
}

let citiesPromise: Promise<AdminCity[]> | null = null;

/** Every city (for selects), loaded once per page view. */
export function useAdminCities() {
  const [cities, setCities] = useState<AdminCity[] | null>(null);
  useEffect(() => {
    citiesPromise ??= unwrap(
      browserApi().GET('/api/v1/admin/cities', { params: { query: { limit: 100 } } }),
    ).then((page) => page.data);
    citiesPromise.then(setCities).catch(() => {
      citiesPromise = null;
      setCities([]);
    });
  }, []);
  return cities;
}

/** Districts of one city (for the dependent select); null while loading. */
export function useAdminDistricts(cityId: string | undefined) {
  const [districts, setDistricts] = useState<{ cityId: string; items: AdminDistrict[] } | null>(
    null,
  );
  useEffect(() => {
    if (!cityId) return;
    let active = true;
    unwrap(
      browserApi().GET('/api/v1/admin/districts', { params: { query: { cityId, limit: 100 } } }),
    )
      .then((page) => page.data)
      .catch(() => [])
      .then((items) => {
        if (active) setDistricts({ cityId, items });
      });
    return () => {
      active = false;
    };
  }, [cityId]);
  return districts && districts.cityId === cityId ? districts.items : null;
}

/** Test hook. */
export function resetAdminDataForTests() {
  citiesPromise = null;
}
