import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getCityOverview } from '@/features/cities/data';
import { sectionMetadata } from '@/features/sections/metadata';
import { SectionView } from '@/features/sections/section-view';
import { FILTERED_HEADER } from '@/lib/filtered-route';
import { isSection } from '@/lib/sections';

// Internal, dynamic route for filtered section URLs. The proxy rewrites
// /cities/seoul/hiking?difficulty=easy here (the address bar keeps the public URL).

type Props = PageProps<'/[locale]/cities/[slug]/[section]/filtered'>;

async function assertRewritten() {
  if ((await headers()).get(FILTERED_HEADER) !== '1') notFound();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await assertRewritten();
  // Same title and canonical as the unfiltered page; filter combinations stay out of the index.
  return { ...(await sectionMetadata(params)), robots: { index: false, follow: true } };
}

export default async function FilteredSectionPage({ params, searchParams }: Props) {
  await assertRewritten();
  const { locale, slug, section } = await params;
  if (!isSection(section)) notFound();
  setRequestLocale(locale as Locale);
  const city = await getCityOverview(slug, locale as Locale);
  return (
    <SectionView
      city={city}
      section={section}
      locale={locale as Locale}
      params={await searchParams}
    />
  );
}
