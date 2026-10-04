import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getCityOverview } from '@/features/cities/data';
import { sectionMetadata } from '@/features/sections/metadata';
import { SectionView } from '@/features/sections/section-view';
import { isSection, SECTIONS } from '@/lib/sections';

// The unfiltered section is static (ISR). Filtered URLs (?district=…) are rewritten by the proxy to
// the dynamic ./filtered route, so this page never reads the query string.
export const revalidate = 300;

export const generateStaticParams = () => SECTIONS.map((section) => ({ section }));

type Props = PageProps<'/[locale]/cities/[slug]/[section]'>;

export const generateMetadata = ({ params }: Props): Promise<Metadata> => sectionMetadata(params);

export default async function SectionPage({ params }: Props) {
  const { locale, slug, section } = await params;
  if (!isSection(section)) notFound();
  setRequestLocale(locale as Locale);
  const city = await getCityOverview(slug, locale as Locale);
  return <SectionView city={city} section={section} locale={locale as Locale} params={{}} />;
}
