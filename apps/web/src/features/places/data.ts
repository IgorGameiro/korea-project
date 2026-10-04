import 'server-only';
import type { Locale } from '@korea-project/shared';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { load, serverApi } from '@/lib/api/server';

/** Place pages are ISR with a short window, so new ratings show up within a minute. */
export const PLACE_REVALIDATE = 60;

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Place + recent reviews; shared by the page and generateMetadata (React cache). */
export const getPlace = cache(async (slug: string, locale: Locale) => {
  if (!SLUG.test(slug)) notFound();
  return load(
    serverApi(PLACE_REVALIDATE).GET('/api/v1/places/{slug}', {
      params: { path: { slug }, query: { locale } },
    }),
  );
});

/** Every place slug, for prebuilding the pages (walks each city's paginated list). */
export async function allPlaceSlugs(): Promise<string[]> {
  const api = serverApi();
  const cities = await load(api.GET('/api/v1/cities', { params: { query: { limit: 100 } } }));
  const slugs: string[] = [];
  for (const city of cities.data) {
    for (let page = 1, totalPages = 1; page <= totalPages; page++) {
      const result = await load(
        api.GET('/api/v1/cities/{citySlug}/places', {
          params: { path: { citySlug: city.slug }, query: { page, limit: 100 } },
        }),
      );
      totalPages = result.meta.totalPages;
      slugs.push(...result.data.map((place) => place.slug));
    }
  }
  return slugs;
}
