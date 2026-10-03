import { isLocale, type Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { PlaceCard } from '@/features/places/place-card';
import { SearchForm } from '@/features/search/search-form';
import { parseSearchParams } from '@/features/search/search-params';
import { Link } from '@/i18n/navigation';
import { load, serverApi } from '@/lib/api/server';

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/search'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'search' });
  // Result pages are endless combinations: keep them out of search engines.
  return { title: t('metaTitle'), robots: { index: false, follow: true } };
}

export default async function SearchPage({ params, searchParams }: PageProps<'/[locale]/search'>) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : 'en';
  setRequestLocale(locale);
  const t = await getTranslations('search');
  const tc = await getTranslations('categoryShortcuts');
  const { q, category, page, problem, searchable } = parseSearchParams(await searchParams);

  const results = searchable
    ? await load(
        serverApi(60).GET('/api/v1/search', {
          params: {
            query: { q: q || undefined, category, page, limit: PAGE_SIZE, locale },
          },
        }),
      )
    : null;

  const heading = q
    ? t('resultsFor', { q })
    : category
      ? t('resultsInCategory', { category: tc(category) })
      : t('label');
  const pageHref = (target: number) => ({
    pathname: '/search' as const,
    query: { ...(q ? { q } : {}), ...(category ? { category } : {}), page: target },
  });

  return (
    <Container className="flex flex-col gap-8 py-10">
      <div className="max-w-2xl">
        <SearchForm locale={locale} defaultValue={q} />
      </div>

      <section aria-labelledby="results-title" aria-live="polite">
        <h1 id="results-title" className="text-2xl font-bold">
          {heading}
        </h1>

        {problem ? <p className="mt-2 text-navy-700">{t(problem)}</p> : null}

        {results ? (
          <>
            <p className="mt-1 text-navy-700">{t('resultsCount', { count: results.meta.total })}</p>
            {results.data.length === 0 ? (
              <p className="mt-6">{t('empty')}</p>
            ) : (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.data.map((place) => (
                  <li key={place.id} className="flex">
                    <PlaceCard place={place} cityName={place.city.name} headingLevel={2} />
                  </li>
                ))}
              </ul>
            )}

            {results.meta.totalPages > 1 ? (
              <nav aria-label={t('pagination')} className="mt-8 flex items-center gap-4">
                {page > 1 ? (
                  <Link
                    href={pageHref(page - 1)}
                    className="font-semibold underline underline-offset-4"
                  >
                    {t('previous')}
                  </Link>
                ) : null}
                <span className="text-sm text-navy-700">
                  {t('pageOf', { page, total: results.meta.totalPages })}
                </span>
                {page < results.meta.totalPages ? (
                  <Link
                    href={pageHref(page + 1)}
                    className="font-semibold underline underline-offset-4"
                  >
                    {t('next')}
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : null}
      </section>
    </Container>
  );
}
