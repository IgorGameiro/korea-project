import type { Locale, OpeningHours } from '@korea-project/shared';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Badge, CategoryBadge } from '@/components/ui/badge';
import { JsonLd } from '@/components/seo/json-ld';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { PriceLevel, PriceTag } from '@/components/ui/price-tag';
import { FavoriteButton } from '@/features/favorites/favorite-button';
import { MapView } from '@/features/map/map-view';
import { allPlaceSlugs, getPlace } from '@/features/places/data';
import { Gallery } from '@/features/places/gallery';
import { HoursTable } from '@/features/places/hours-table';
import { OpenNow } from '@/features/places/open-now';
import { tagLabel } from '@/features/places/tags';
import { LiveRating } from '@/features/reviews/live-rating';
import { ReviewsSection } from '@/features/reviews/reviews-section';
import { Link } from '@/i18n/navigation';
import { CATEGORY_META } from '@/lib/categories';
import { alternatesFor, openGraphFor } from '@/lib/seo';
import { placeJsonLd } from '@/lib/structured-data';
import { staticParamsOrOnDemand } from '@/lib/static-params';

// Same value as PLACE_REVALIDATE (route segment config must be a literal).
export const revalidate = 60;

type Props = PageProps<'/[locale]/places/[slug]'>;

// Every place is prebuilt when the API is reachable at build time (on-demand ISR otherwise).
export const generateStaticParams = () =>
  staticParamsOrOnDemand(async () => {
    const slugs = await allPlaceSlugs();
    return slugs.map((slug) => ({ slug }));
  });

const DESCRIPTION_LENGTH = 160;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const place = await getPlace(slug, locale as Locale);
  const description =
    place.description.length > DESCRIPTION_LENGTH
      ? `${place.description.slice(0, DESCRIPTION_LENGTH - 1).trimEnd()}…`
      : place.description;
  return {
    title: `${place.name} · ${place.city.name}`,
    description,
    alternates: alternatesFor(`/places/${slug}`, locale as Locale),
    openGraph: openGraphFor({
      locale: locale as Locale,
      siteName: (await getTranslations({ locale, namespace: 'meta' }))('siteName'),
      title: place.name,
      description,
      images: place.imageUrls.slice(0, 1),
      type: 'article',
    }),
  };
}

export default async function PlacePage({ params }: Props) {
  const { locale: rawLocale, slug } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  const place = await getPlace(slug, locale);
  const t = await getTranslations('place');
  const tc = await getTranslations('city.sections');
  const tags = await getTranslations('tags');
  const td = await getTranslations('difficulty');
  const section = CATEGORY_META[place.category].section;
  const hours = place.openingHours as OpeningHours | null | undefined;

  return (
    <Container className="flex flex-col gap-8 py-8">
      <JsonLd data={placeJsonLd(place, locale, { home: t('home'), section: tc(section) })} />
      <nav aria-label={t('breadcrumb')}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-navy-700">
          <li>
            <Link href="/" className="hover:underline">
              {t('home')}
            </Link>
          </li>
          <Separator />
          <li>
            <Link href={`/cities/${place.city.slug}`} className="hover:underline">
              {place.city.name}
            </Link>
          </li>
          <Separator />
          <li>
            <Link href={`/cities/${place.city.slug}/${section}`} className="hover:underline">
              {tc(section)}
            </Link>
          </li>
          <Separator />
          <li aria-current="page" className="font-semibold text-navy-900">
            {place.name}
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={place.category} />
            {place.district ? <Badge>{place.district.name}</Badge> : null}
          </div>
          <FavoriteButton placeId={place.id} placeName={place.name} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {place.name}{' '}
          <span lang="ko" className="text-2xl font-normal text-navy-700 sm:text-3xl">
            {place.nameKo}
          </span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <LiveRating
            placeId={place.id}
            initial={{ ratingAvg: place.ratingAvg, ratingCount: place.ratingCount }}
          />
          <PriceLevel level={place.priceLevel} />
          <span className="flex items-baseline gap-2 text-sm">
            <span className="text-navy-700">{t('averageSpend')}:</span>
            <PriceTag krw={place.averageSpendKRW} />
          </span>
        </div>
      </header>

      <Gallery name={place.name} images={place.imageUrls} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="about-title">
            <h2 id="about-title" className="text-xl font-bold">
              {t('about')}
            </h2>
            <p className="mt-2 text-lg leading-relaxed text-navy-800">{place.description}</p>
            {place.tags.length > 0 ? (
              <ul aria-label={t('tags')} className="mt-4 flex flex-wrap gap-2">
                {place.tags.map((tag) => (
                  <li key={tag}>
                    <Badge>{tagLabel(tag, tags)}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          {place.trail ? (
            <section aria-labelledby="trail-title">
              <h2 id="trail-title" className="text-xl font-bold">
                {t('trailFacts')}
              </h2>
              <dl className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Fact label={t('difficulty')} value={td(place.trail.difficulty)} />
                <Fact
                  label={t('distance')}
                  value={t('distanceValue', { value: place.trail.distanceKm })}
                />
                <Fact
                  label={t('duration')}
                  value={t('durationValue', {
                    hours: Math.round(place.trail.durationMinutes / 30) / 2,
                  })}
                />
                <Fact
                  label={t('elevation')}
                  value={t('elevationValue', { value: place.trail.elevationGainM })}
                />
              </dl>
            </section>
          ) : null}

          <ReviewsSection
            placeId={place.id}
            placeSlug={place.slug}
            initialReviews={place.recentReviews}
            initialTotal={place.ratingCount}
          />
        </div>

        <aside aria-labelledby="details-title" className="flex flex-col gap-6">
          <h2 id="details-title" className="sr-only">
            {t('details')}
          </h2>
          {hours ? (
            <section
              aria-labelledby="hours-title"
              className="rounded-[var(--radius-card)] p-5 ring-1 ring-navy-100"
            >
              <h3 id="hours-title" className="mb-2 font-bold">
                {t('hours')}
              </h3>
              <OpenNow hours={hours} />
              <div className="mt-3">
                <HoursTable hours={hours} />
              </div>
              {place.openingHoursNote ? (
                <p className="mt-3 text-sm text-navy-700">{place.openingHoursNote}</p>
              ) : null}
              <p className="mt-2 text-xs text-navy-700">{t('seoulTime')}</p>
            </section>
          ) : null}

          <section aria-labelledby="location-title" className="flex flex-col gap-3">
            <h3 id="location-title" className="font-bold">
              {t('location')}
            </h3>
            <MapView
              compact
              label={t('location')}
              points={[
                {
                  id: place.id,
                  name: place.name,
                  kind: place.category,
                  latitude: place.latitude,
                  longitude: place.longitude,
                },
              ]}
            />
            <dl className="flex flex-col gap-2 text-sm">
              <div>
                <dt className="font-semibold">{t('address')}</dt>
                <dd>{place.address}</dd>
              </div>
              {place.website ? (
                <div>
                  <dt className="font-semibold">{t('website')}</dt>
                  <dd>
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t('websiteLabel', { name: place.name })}
                      className="break-all text-coral-600 underline underline-offset-4"
                    >
                      {new URL(place.website).hostname}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </aside>
      </div>
    </Container>
  );
}

function Separator() {
  return (
    <li aria-hidden="true">
      <Icon name="chevron-right" className="size-4" />
    </li>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-navy-50 p-3">
      <dt className="text-xs font-semibold text-navy-700">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
