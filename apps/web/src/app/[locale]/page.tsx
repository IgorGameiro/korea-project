import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { CityCard } from '@/features/cities/city-card';
import { SearchForm } from '@/features/search/search-form';
import { Link } from '@/i18n/navigation';
import { loadAtBuildOr, serverApi } from '@/lib/api/server';
import { CATEGORIES, CATEGORY_META } from '@/lib/categories';
import { alternatesFor } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  return { title: { absolute: t('metaTitle') }, alternates: alternatesFor('/', locale as Locale) };
}

export default async function Home({ params }: PageProps<'/[locale]'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tc = await getTranslations('categoryShortcuts');

  const featured = await loadAtBuildOr(
    serverApi().GET('/api/v1/cities', { params: { query: { featured: true, locale } } }),
    null,
  );

  return (
    <>
      <section className="bg-navy-900 text-white">
        <Container className="flex flex-col gap-6 py-16 sm:py-24">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="max-w-2xl text-lg text-navy-100">{t('heroSubtitle')}</p>
          <div className="max-w-2xl rounded-[var(--radius-card)] bg-white p-4 text-navy-900 sm:p-5">
            <SearchForm locale={locale} />
          </div>
        </Container>
      </section>

      <Container className="flex flex-col gap-16 py-12">
        <section id="cities" aria-labelledby="featured-title" className="scroll-mt-24">
          <h2 id="featured-title" className="text-2xl font-bold">
            {t('featuredTitle')}
          </h2>
          <p className="mt-1 text-navy-700">{t('featuredSubtitle')}</p>
          {featured ? (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.data.map((city) => (
                <li key={city.id} className="flex">
                  <CityCard city={city} />
                </li>
              ))}
            </ul>
          ) : (
            <p role="status" className="mt-6 rounded-[var(--radius-card)] bg-navy-50 p-4">
              {t('citiesUnavailable')}
            </p>
          )}
        </section>

        <section aria-labelledby="categories-title">
          <h2 id="categories-title" className="text-2xl font-bold">
            {t('categoriesTitle')}
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((category) => {
              const { icon, color } = CATEGORY_META[category];
              return (
                <li key={category}>
                  <Link
                    href={{ pathname: '/search', query: { category } }}
                    className="flex items-center gap-3 rounded-[var(--radius-card)] p-4 font-semibold ring-1 ring-navy-100 hover:bg-navy-50"
                  >
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-full text-white"
                      style={{ backgroundColor: color }}
                    >
                      <Icon name={icon} />
                    </span>
                    {tc(category)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="plan-title"
          className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] bg-coral-50 p-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="max-w-2xl">
            <h2 id="plan-title" className="text-2xl font-bold">
              {t('planTitle')}
            </h2>
            <p className="mt-2 text-navy-700">{t('planBody')}</p>
          </div>
          <ButtonLink href="/plan">{t('planCta')}</ButtonLink>
        </section>
      </Container>
    </>
  );
}
