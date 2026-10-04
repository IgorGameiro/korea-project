import { CostTier, AccommodationType, type Locale, TrailDifficulty } from '@korea-project/shared';
import { getTranslations } from 'next-intl/server';
import { buttonClasses } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Pagination } from '@/components/ui/pagination';
import { CityHeader } from '@/features/cities/city-header';
import { CITY_REVALIDATE, getStayTotal } from '@/features/cities/data';
import { SectionNav } from '@/features/cities/section-nav';
import { MapView } from '@/features/map/map-view';
import type { MapPoint } from '@/features/map/types';
import { PlaceCard } from '@/features/places/place-card';
import { StayCard } from '@/features/stays/stay-card';
import { getPathname, Link } from '@/i18n/navigation';
import { load, serverApi } from '@/lib/api/server';
import type { CityOverviewDto } from '@/lib/api/types';
import { categoryForSection } from '@/lib/sections';
import { CheckboxGroup, SelectField } from './filter-fields';
import { FilterForm } from './filter-form';
import {
  parsePlaceFilters,
  parseStayFilters,
  PRICE_LEVELS,
  placeFiltersQuery,
  RATING_STEPS,
  stayFiltersQuery,
} from './filters';

const PAGE_SIZE = 12;

type RawParams = Record<string, string | string[] | undefined>;

interface SectionViewProps {
  city: CityOverviewDto;
  section: string;
  locale: Locale;
  /** URL query; empty on the static (unfiltered) page. */
  params: RawParams;
}

/** One city section (a place category or stays): header, nav, filters, map and results. */
export async function SectionView(props: SectionViewProps) {
  const { city, section } = props;
  const t = await getTranslations('city');
  const stayCount = await getStayTotal(city.slug);
  const sectionName = t(`sections.${section}`);
  return (
    <>
      <CityHeader
        city={city}
        compact
        title={t('sectionTitle', { section: sectionName, city: city.name })}
      />
      <SectionNav citySlug={city.slug} counts={city.placeCounts} stayCount={stayCount} />
      <Container className="flex flex-col gap-8 py-8">
        {categoryForSection(section) ? <PlaceResults {...props} /> : <StayResults {...props} />}
      </Container>
    </>
  );
}

async function PlaceResults({ city, section, locale, params }: SectionViewProps) {
  const category = categoryForSection(section)!;
  const t = await getTranslations('city');
  const tf = await getTranslations('filters');
  const td = await getTranslations('difficulty');
  const tp = await getTranslations('price');
  const filters = parsePlaceFilters(params, { districts: city.districts, category });
  const sectionPath = `/cities/${city.slug}/${section}`;

  const result = await load(
    serverApi(CITY_REVALIDATE).GET('/api/v1/cities/{citySlug}/places', {
      params: {
        path: { citySlug: city.slug },
        query: {
          category,
          districtId: filters.district?.id,
          priceLevel: filters.price.length > 0 ? filters.price.map(String) : undefined,
          minRating: filters.rating,
          difficulty: filters.difficulty,
          sort: filters.sort,
          page: filters.page,
          limit: PAGE_SIZE,
          locale,
        },
      },
    }),
  );
  const query = placeFiltersQuery(filters);
  const filtered = Object.keys(query).some((key) => key !== 'page');
  const points: MapPoint[] = result.data.map((place) => ({
    id: place.id,
    name: place.name,
    kind: place.category,
    latitude: place.latitude,
    longitude: place.longitude,
    href: `/places/${place.slug}`,
  }));

  return (
    <>
      <FilterForm
        key={new URLSearchParams(query).toString()}
        action={getPathname({ href: sectionPath, locale })}
        label={tf('title')}
      >
        <DistrictSelect
          city={city}
          value={filters.district?.slug}
          label={tf('district')}
          any={tf('anyDistrict')}
        />
        <CheckboxGroup
          name="price"
          legend={tf('price')}
          checked={filters.price.map(String)}
          options={PRICE_LEVELS.map((level) => ({
            value: String(level),
            label: (
              <>
                <span aria-hidden="true">{'₩'.repeat(level)}</span>
                <span className="sr-only">{tp('level', { level })}</span>
              </>
            ),
          }))}
        />
        <SelectField
          name="rating"
          label={tf('rating')}
          value={filters.rating?.toString()}
          options={[
            { value: '', label: tf('anyRating') },
            ...RATING_STEPS.map((value) => ({
              value: String(value),
              label: tf('ratingAtLeast', { value }),
            })),
          ]}
        />
        {category === 'HIKING' ? (
          <SelectField
            name="difficulty"
            label={tf('difficulty')}
            value={filters.difficulty?.toLowerCase()}
            options={[
              { value: '', label: tf('anyDifficulty') },
              ...Object.values(TrailDifficulty).map((value) => ({
                value: value.toLowerCase(),
                label: td(value),
              })),
            ]}
          />
        ) : null}
        <SelectField
          name="sort"
          label={tf('sort')}
          value={filters.sort === 'rating' ? '' : filters.sort}
          options={[
            { value: '', label: tf('sortRating') },
            { value: 'price', label: tf('sortPrice') },
          ]}
        />
        <FormActions filtered={filtered} clearHref={sectionPath} />
      </FilterForm>

      <Results
        heading={t('placesFound', { count: result.meta.total })}
        empty={filtered ? t('empty') : t('emptySection')}
        count={result.data.length}
      >
        {result.data.map((place) => (
          <li key={place.id} className="flex">
            <PlaceCard place={place} headingLevel={3} />
          </li>
        ))}
      </Results>
      <Pagination
        page={filters.page}
        totalPages={result.meta.totalPages}
        hrefFor={(page) => ({ pathname: sectionPath, query: placeFiltersQuery(filters, page) })}
      />
      {points.length > 0 ? (
        <section aria-labelledby="map-title">
          <h2 id="map-title" className="mb-4 text-2xl font-bold">
            {t('mapTitle')}
          </h2>
          <MapView
            points={points}
            label={t('sectionTitle', { section: t(`sections.${section}`), city: city.name })}
          />
        </section>
      ) : null}
    </>
  );
}

async function StayResults({ city, section, locale, params }: SectionViewProps) {
  const t = await getTranslations('city');
  const tf = await getTranslations('filters');
  const tTier = await getTranslations('tiers');
  const tType = await getTranslations('stayTypes');
  const filters = parseStayFilters(params, { districts: city.districts });
  const sectionPath = `/cities/${city.slug}/${section}`;

  const result = await load(
    serverApi(CITY_REVALIDATE).GET('/api/v1/cities/{citySlug}/accommodations', {
      params: {
        path: { citySlug: city.slug },
        query: {
          districtId: filters.district?.id,
          tier: filters.tier,
          type: filters.type,
          sort: filters.sort,
          page: filters.page,
          limit: PAGE_SIZE,
        },
      },
    }),
  );
  const query = stayFiltersQuery(filters);
  const filtered = Object.keys(query).some((key) => key !== 'page');
  const districtName = (id?: string | null) => city.districts.find((d) => d.id === id)?.name;
  const points: MapPoint[] = result.data.map((stay) => ({
    id: stay.id,
    name: stay.name,
    kind: 'STAY',
    latitude: stay.latitude,
    longitude: stay.longitude,
  }));

  return (
    <>
      <FilterForm
        key={new URLSearchParams(query).toString()}
        action={getPathname({ href: sectionPath, locale })}
        label={tf('title')}
      >
        <DistrictSelect
          city={city}
          value={filters.district?.slug}
          label={tf('district')}
          any={tf('anyDistrict')}
        />
        <SelectField
          name="tier"
          label={tf('tier')}
          value={filters.tier?.toLowerCase()}
          options={[
            { value: '', label: tf('anyTier') },
            ...Object.values(CostTier).map((value) => ({
              value: value.toLowerCase(),
              label: tTier(value),
            })),
          ]}
        />
        <SelectField
          name="type"
          label={tf('type')}
          value={filters.type?.toLowerCase()}
          options={[
            { value: '', label: tf('anyType') },
            ...Object.values(AccommodationType).map((value) => ({
              value: value.toLowerCase(),
              label: tType(value),
            })),
          ]}
        />
        <SelectField
          name="sort"
          label={tf('sort')}
          value={filters.sort === '-price' ? 'price-desc' : ''}
          options={[
            { value: '', label: tf('sortPrice') },
            { value: 'price-desc', label: tf('sortPriceDesc') },
          ]}
        />
        <FormActions filtered={filtered} clearHref={sectionPath} />
      </FilterForm>

      <Results
        heading={t('staysFound', { count: result.meta.total })}
        empty={filtered ? t('empty') : t('emptySection')}
        count={result.data.length}
      >
        {result.data.map((stay) => (
          <li key={stay.id} className="flex">
            <StayCard stay={stay} districtName={districtName(stay.districtId)} />
          </li>
        ))}
      </Results>
      <Pagination
        page={filters.page}
        totalPages={result.meta.totalPages}
        hrefFor={(page) => ({ pathname: sectionPath, query: stayFiltersQuery(filters, page) })}
      />
      {points.length > 0 ? (
        <section aria-labelledby="map-title">
          <h2 id="map-title" className="mb-4 text-2xl font-bold">
            {t('mapTitle')}
          </h2>
          <MapView
            points={points}
            label={t('sectionTitle', { section: t('sections.stays'), city: city.name })}
          />
        </section>
      ) : null}
    </>
  );
}

function DistrictSelect({
  city,
  value,
  label,
  any,
}: {
  city: CityOverviewDto;
  value?: string;
  label: string;
  any: string;
}) {
  if (city.districts.length === 0) return null;
  return (
    <SelectField
      name="district"
      label={label}
      value={value}
      options={[
        { value: '', label: any },
        ...city.districts.map((district) => ({ value: district.slug, label: district.name })),
      ]}
    />
  );
}

async function FormActions({ filtered, clearHref }: { filtered: boolean; clearHref: string }) {
  const tf = await getTranslations('filters');
  return (
    <div className="flex items-center gap-3">
      <button type="submit" className={buttonClasses('primary')}>
        {tf('apply')}
      </button>
      {filtered ? (
        <Link
          href={clearHref}
          scroll={false}
          className="text-sm font-semibold underline underline-offset-4"
        >
          {tf('clear')}
        </Link>
      ) : null}
    </div>
  );
}

function Results({
  heading,
  empty,
  count,
  children,
}: {
  heading: string;
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby="results-title" aria-live="polite">
      <h2 id="results-title" className="text-xl font-bold">
        {heading}
      </h2>
      {count === 0 ? (
        <p className="mt-4 text-navy-700">{empty}</p>
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</ul>
      )}
    </section>
  );
}
