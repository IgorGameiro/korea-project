import 'server-only';
import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCityOverview } from '@/features/cities/data';
import { isSection } from '@/lib/sections';
import { alternatesFor } from '@/lib/seo';

/** Metadata of a city section; the canonical always points to the unfiltered page. */
export async function sectionMetadata(
  params: Promise<{ locale: string; slug: string; section: string }>,
): Promise<Metadata> {
  const { locale, slug, section } = await params;
  if (!isSection(section)) notFound();
  const city = await getCityOverview(slug, locale as Locale);
  const t = await getTranslations({ locale, namespace: 'city' });
  const values = { section: t(`sections.${section}`), city: city.name };
  return {
    title: t('sectionTitle', values),
    description: t('sectionMetaDescription', values),
    alternates: alternatesFor(`/cities/${slug}/${section}`, locale as Locale),
    openGraph: { images: [city.heroImageUrl] },
  };
}
