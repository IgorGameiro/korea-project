import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { PlanCalculator } from '@/features/calculator/plan-calculator';
import { loadAtBuildOr, serverApi } from '@/lib/api/server';
import { alternatesFor } from '@/lib/seo';
import { localeParams } from '@/lib/static-params';

export const revalidate = 300;
export const generateStaticParams = localeParams;

export async function generateMetadata({ params }: PageProps<'/[locale]/plan'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'plan' });
  return {
    title: t('metaTitle'),
    description: t('intro'),
    alternates: alternatesFor('/plan', locale as Locale),
  };
}

// Static page: the calculator reads its input from the URL on the client (in a Suspense boundary),
// so /plan?city=busan&people=3 is still served from the same prebuilt HTML.
export default async function PlanPage({ params }: PageProps<'/[locale]/plan'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('plan');
  const tc = await getTranslations('calculator');
  const cities = await loadAtBuildOr(
    serverApi().GET('/api/v1/cities', { params: { query: { limit: 100, locale } } }),
    null,
  );

  return (
    <Container className="flex flex-col gap-6 py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-navy-700">{t('intro')}</p>
      </div>
      {cities ? (
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <PlanCalculator
            cities={cities.data.map((city) => ({ slug: city.slug, name: city.name }))}
          />
        </Suspense>
      ) : (
        <p role="status" className="rounded-[var(--radius-card)] bg-navy-50 p-4">
          {tc('citiesUnavailable')}
        </p>
      )}
    </Container>
  );
}
