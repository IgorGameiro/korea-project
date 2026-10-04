import 'server-only';
import type { Locale } from '@korea-project/shared';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { load, loadOr, serverApi } from '@/lib/api/server';

/** City pages are ISR: regenerated in the background at most every 5 minutes. */
export const CITY_REVALIDATE = 300;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * City + districts + place counts. Wrapped in React cache() so the page and generateMetadata share
 * one request. A malformed slug is a 404 here (the API would answer 400 instead).
 */
export const getCityOverview = cache(async (slug: string, locale: Locale) => {
  if (!SLUG.test(slug)) notFound();
  return load(
    serverApi(CITY_REVALIDATE).GET('/api/v1/cities/{slug}', {
      params: { path: { slug }, query: { locale } },
    }),
  );
});

/** Number of stays for the section nav; non-essential, so null when the API cannot tell. */
export const getStayTotal = cache(async (slug: string) => {
  const result = await loadOr(
    serverApi(CITY_REVALIDATE).GET('/api/v1/cities/{citySlug}/accommodations', {
      params: { path: { citySlug: slug }, query: { limit: 1 } },
    }),
    null,
  );
  return result?.meta.total ?? null;
});
