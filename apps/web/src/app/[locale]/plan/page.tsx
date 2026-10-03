import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { alternatesFor } from '@/lib/seo';
import { localeParams } from '@/lib/static-params';

export const generateStaticParams = localeParams;

export async function generateMetadata({ params }: PageProps<'/[locale]/plan'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'plan' });
  return { title: t('metaTitle'), alternates: alternatesFor('/plan', locale as Locale) };
}

// Placeholder until the cost calculator lands (Phase 5), so the Home call-to-action never 404s.
export default async function PlanPage({ params }: PageProps<'/[locale]/plan'>) {
  setRequestLocale((await params).locale as Locale);
  const t = await getTranslations('plan');
  return (
    <Container className="flex min-h-[50vh] flex-col items-start justify-center gap-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="max-w-xl text-navy-700">{t('comingSoon')}</p>
      <ButtonLink href={{ pathname: '/', hash: 'cities' }}>{t('browseCities')}</ButtonLink>
    </Container>
  );
}
