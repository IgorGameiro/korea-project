import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { CityCalculator } from '@/features/calculator/city-calculator';
import { CityHeader } from '@/features/cities/city-header';
import { CITY_REVALIDATE, getCityOverview, getStayTotal } from '@/features/cities/data';
import { SectionNav } from '@/features/cities/section-nav';
import { MapView } from '@/features/map/map-view';
import { type MapPoint, markerStyle } from '@/features/map/types';
import { PlaceCard } from '@/features/places/place-card';
import { Link } from '@/i18n/navigation';
import { load, serverApi } from '@/lib/api/server';
import { CATEGORIES, CATEGORY_META } from '@/lib/categories';
import { STAYS_SECTION } from '@/lib/sections';
import { alternatesFor } from '@/lib/seo';

export const revalidate = 300;

type Props = PageProps<'/[locale]/cities/[slug]'>;

const DESCRIPTION_LENGTH = 160;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const city = await getCityOverview(slug, locale as Locale);
  const description =
    city.description.length > DESCRIPTION_LENGTH
      ? `${city.description.slice(0, DESCRIPTION_LENGTH - 1).trimEnd()}…`
      : city.description;
  return {
    title: city.name,
    description,
    alternates: alternatesFor(`/cities/${slug}`, locale as Locale),
    openGraph: { title: city.name, description, images: [city.heroImageUrl] },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug, locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('city');
  const tc = await getTranslations('calculator');
  const format = await getFormatter();
  const api = serverApi(CITY_REVALIDATE);

  const [city, stayCount, mapPoints, topRated] = await Promise.all([
    getCityOverview(slug, locale),
    getStayTotal(slug),
    load(
      api.GET('/api/v1/cities/{citySlug}/map', {
        params: { path: { citySlug: slug }, query: { locale } },
      }),
    ),
    load(
      api.GET('/api/v1/cities/{citySlug}/places', {
        params: { path: { citySlug: slug }, query: { sort: 'rating', limit: 6, locale } },
      }),
    ),
  ]);

  const points: MapPoint[] = mapPoints.map((point) => ({
    id: point.id,
    name: point.name,
    kind: point.category,
    latitude: point.latitude,
    longitude: point.longitude,
    href: `/places/${point.slug}`,
  }));
  const sections = [
    ...CATEGORIES.map((category) => ({
      section: CATEGORY_META[category].section,
      icon: CATEGORY_META[category].icon,
      color: CATEGORY_META[category].color,
      count: t('placeCount', { count: city.placeCounts[category] }),
    })),
    {
      section: STAYS_SECTION,
      icon: 'bed' as const,
      color: markerStyle('STAY').color,
      count: stayCount === null ? null : t('stayCount', { count: stayCount }),
    },
  ];

  return (
    <>
      <CityHeader
        city={city}
        title={
          <>
            {city.name}{' '}
            <span lang="ko" className="text-3xl font-normal text-navy-100 sm:text-4xl">
              {city.nameKo}
            </span>
          </>
        }
      />
      <SectionNav citySlug={city.slug} counts={city.placeCounts} stayCount={stayCount} />

      <Container className="flex flex-col gap-14 py-10">
        <section aria-labelledby="about-title" className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 id="about-title" className="text-2xl font-bold">
              {t('about', { city: city.name })}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-navy-800">{city.description}</p>
          </div>
          <dl className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-navy-50 p-5">
            <div>
              <dt className="text-sm font-semibold text-navy-700">{t('bestTime')}</dt>
              <dd className="mt-1">{city.bestTimeToVisit}</dd>
            </div>
            {city.population ? (
              <div>
                <dt className="text-sm font-semibold text-navy-700">{t('population')}</dt>
                <dd className="mt-1">{format.number(city.population)}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section aria-labelledby="explore-title">
          <h2 id="explore-title" className="text-2xl font-bold">
            {t('explore', { city: city.name })}
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {sections.map((item) => (
              <li key={item.section}>
                <Link
                  href={`/cities/${city.slug}/${item.section}`}
                  className="flex h-full items-center gap-3 rounded-[var(--radius-card)] p-4 ring-1 ring-navy-100 hover:bg-navy-50"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-full text-white"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon name={item.icon} />
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold">{t(`sections.${item.section}`)}</span>
                    {item.count ? (
                      <span className="text-sm text-navy-700">{item.count}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="calculator-title">
          <h2 id="calculator-title" className="mb-4 text-2xl font-bold">
            {tc('titleIn', { city: city.name })}
          </h2>
          <CityCalculator citySlug={city.slug} />
        </section>

        <section aria-labelledby="map-title">
          <h2 id="map-title" className="mb-4 text-2xl font-bold">
            {t('mapTitle')}
          </h2>
          <MapView points={points} label={t('about', { city: city.name })} />
        </section>

        {topRated.data.length > 0 ? (
          <section aria-labelledby="top-title">
            <h2 id="top-title" className="text-2xl font-bold">
              {t('topRated')}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topRated.data.map((place) => (
                <li key={place.id} className="flex">
                  <PlaceCard place={place} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {city.districts.length > 0 ? (
          <section aria-labelledby="districts-title">
            <h2 id="districts-title" className="text-2xl font-bold">
              {t('districts')}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {city.districts.map((district) => (
                <li
                  key={district.id}
                  className="rounded-[var(--radius-card)] p-5 ring-1 ring-navy-100"
                >
                  <h3 className="font-bold">
                    {district.name}{' '}
                    <span lang="ko" className="font-normal text-navy-700">
                      {district.nameKo}
                    </span>
                  </h3>
                  <p className="mt-2 text-sm text-navy-700">{district.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
    </>
  );
}
