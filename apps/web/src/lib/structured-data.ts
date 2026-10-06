import {
  type Locale,
  type OpeningHours,
  type PlaceCategory,
  type TimeRange,
  WEEKDAYS,
} from '@korea-project/shared';
import type { CityOverviewDto, PlaceOverviewDto } from './api/types';
import { CATEGORY_META } from './categories';
import { absolute } from './seo';

/** A schema.org JSON-LD object. */
export type JsonLdObject = { '@context'?: string; '@type': string; [key: string]: unknown };

/**
 * Serializes JSON-LD for an inline <script>. JSON.stringify alone is not enough: a value containing
 * "</script>" would close the element and let the rest run as HTML. Escaping <, > and & as \uXXXX
 * keeps the JSON identical for parsers while making it inert as HTML; U+2028/2029 are escaped too
 * (line terminators in old JavaScript parsers).
 */
export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

const CONTEXT = 'https://schema.org';

const SCHEMA_TYPE: Record<PlaceCategory, string> = {
  RESTAURANT: 'Restaurant',
  CAFE: 'CafeOrCoffeeShop',
  NIGHTLIFE: 'BarOrPub',
  SHOPPING: 'Store',
  ATTRACTION: 'TouristAttraction',
  CULTURE: 'TouristAttraction',
  NATURE: 'TouristAttraction',
  HIKING: 'TouristAttraction',
};

const DAY: Record<(typeof WEEKDAYS)[number], string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/**
 * schema.org opening hours. "24:00" becomes 23:59 (schema.org times stop there), and a period past
 * midnight (18:00–02:00) is split into the evening and the early morning of the next day.
 */
export function openingHoursSpecification(hours: OpeningHours) {
  const spec: { '@type': string; dayOfWeek: string; opens: string; closes: string }[] = [];
  const add = (day: (typeof WEEKDAYS)[number], range: TimeRange) =>
    spec.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `${CONTEXT}/${DAY[day]}`,
      opens: range.open,
      closes: range.close === '24:00' ? '23:59' : range.close,
    });
  WEEKDAYS.forEach((day, index) => {
    for (const range of hours.days[day]) {
      if (minutes(range.close) < minutes(range.open)) {
        add(day, { open: range.open, close: '24:00' });
        if (range.close !== '00:00') {
          add(WEEKDAYS[(index + 1) % 7]!, { open: '00:00', close: range.close });
        }
      } else {
        add(day, range);
      }
    }
  });
  return spec;
}

function breadcrumb(locale: Locale, items: { name: string; href: string }[]): JsonLdObject {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(locale, item.href),
    })),
  };
}

/** Home: the site, with the cross-city search as a SearchAction. */
export function websiteJsonLd(locale: Locale, siteName: string): JsonLdObject {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    name: siteName,
    url: absolute(locale, '/'),
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absolute(locale, '/search')}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function cityJsonLd(
  city: CityOverviewDto,
  locale: Locale,
  homeName: string,
): JsonLdObject[] {
  return [
    {
      '@context': CONTEXT,
      '@type': 'TouristDestination',
      name: city.name,
      alternateName: city.nameKo,
      description: city.description,
      url: absolute(locale, `/cities/${city.slug}`),
      image: city.heroImageUrl,
      geo: { '@type': 'GeoCoordinates', latitude: city.latitude, longitude: city.longitude },
      containedInPlace: { '@type': 'Country', name: 'South Korea' },
    },
    {
      '@context': CONTEXT,
      ...breadcrumb(locale, [
        { name: homeName, href: '/' },
        { name: city.name, href: `/cities/${city.slug}` },
      ]),
    },
  ];
}

export function placeJsonLd(
  place: PlaceOverviewDto,
  locale: Locale,
  labels: { home: string; section: string },
): JsonLdObject[] {
  const hours = place.openingHours as OpeningHours | null | undefined;
  const section = CATEGORY_META[place.category].section;
  return [
    {
      '@context': CONTEXT,
      '@type': SCHEMA_TYPE[place.category],
      name: place.name,
      alternateName: place.nameKo,
      description: place.description,
      url: absolute(locale, `/places/${place.slug}`),
      ...(place.images.length > 0 ? { image: place.images.map((photo) => photo.url) } : {}),
      address: {
        '@type': 'PostalAddress',
        streetAddress: place.address,
        addressLocality: place.city.name,
        addressCountry: 'KR',
      },
      geo: { '@type': 'GeoCoordinates', latitude: place.latitude, longitude: place.longitude },
      ...(place.website ? { sameAs: place.website } : {}),
      priceRange: '₩'.repeat(place.priceLevel),
      ...(hours ? { openingHoursSpecification: openingHoursSpecification(hours) } : {}),
      ...(place.ratingCount > 0
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: place.ratingAvg,
              reviewCount: place.ratingCount,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
    },
    {
      '@context': CONTEXT,
      ...breadcrumb(locale, [
        { name: labels.home, href: '/' },
        { name: place.city.name, href: `/cities/${place.city.slug}` },
        { name: labels.section, href: `/cities/${place.city.slug}/${section}` },
        { name: place.name, href: `/places/${place.slug}` },
      ]),
    },
  ];
}
