import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { allPlaceSlugs } from '@/features/places/data';
import { ApiUnavailableError, load, serverApi } from '@/lib/api/server';
import { SECTIONS } from '@/lib/sections';
import { absolute, languageUrls } from '@/lib/seo';

// Regenerated at most hourly (and right after admin changes, which revalidate every route).
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/** One entry per page and locale, each listing every language version (hreflang + x-default). */
function entries(
  href: string,
  priority: number,
  changeFrequency: Entry['changeFrequency'],
): Entry[] {
  const languages = languageUrls(href);
  return routing.locales.map((locale) => ({
    url: absolute(locale, href),
    alternates: { languages },
    changeFrequency,
    priority,
  }));
}

/**
 * Indexable pages only: home, /plan, cities, their sections and places. Not listed: search results,
 * filtered sections (noindex), login/register/account and the admin.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: Entry[] = [...entries('/', 1, 'weekly'), ...entries('/plan', 0.6, 'monthly')];
  try {
    const cities = await load(
      serverApi(3600).GET('/api/v1/cities', { params: { query: { limit: 100 } } }),
    );
    for (const city of cities.data) {
      pages.push(...entries(`/cities/${city.slug}`, 0.9, 'weekly'));
      for (const section of SECTIONS) {
        pages.push(...entries(`/cities/${city.slug}/${section}`, 0.7, 'weekly'));
      }
    }
    for (const slug of await allPlaceSlugs()) {
      pages.push(...entries(`/places/${slug}`, 0.8, 'weekly'));
    }
  } catch (error) {
    // Without the API (e.g. the Docker image build) the sitemap starts with the fixed pages; ISR
    // fills it in on a later request.
    if (!(error instanceof ApiUnavailableError)) throw error;
  }
  return pages;
}
