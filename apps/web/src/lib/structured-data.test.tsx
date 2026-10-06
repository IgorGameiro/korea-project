import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JsonLd } from '@/components/seo/json-ld';
import type { PlaceOverviewDto } from './api/types';
import { openingHoursSpecification, placeJsonLd, serializeJsonLd } from './structured-data';

const ATTACK = '</script><script>alert(1)</script><!--';

const place = (overrides: Partial<PlaceOverviewDto> = {}): PlaceOverviewDto => ({
  id: 'p1',
  slug: 'gwangjang-market',
  locale: 'en',
  category: 'RESTAURANT',
  name: 'Gwangjang Market',
  nameKo: '광장시장',
  description: 'Street food & bindaetteok.',
  cityId: 'c1',
  latitude: 37.57,
  longitude: 127,
  priceLevel: 2,
  averageSpendKRW: 15000,
  ratingAvg: 4.5,
  ratingCount: 12,
  tags: [],
  address: '88 Changgyeonggung-ro, Jongno-gu',
  openingHours: null,
  images: [{ url: 'https://picsum.photos/a' }],
  city: { id: 'c1', slug: 'seoul', name: 'Seoul' },
  recentReviews: [],
  ...overrides,
});

describe('JSON-LD output is safe', () => {
  it('a value cannot close the <script> element or inject markup', () => {
    const data = placeJsonLd(place({ name: ATTACK, description: 'a\u2028b' }), 'en', {
      home: 'Home',
      section: 'Restaurants',
    });
    const html = renderToStaticMarkup(<JsonLd data={data} />);

    // One <script> per object (place + breadcrumb), and nothing else.
    expect(html.match(/<script/gi)).toHaveLength(2);
    expect(html.match(/<\/script>/gi)).toHaveLength(2); // only the real closing tags
    expect(html).not.toContain('<!--');
    expect(html).not.toContain('\u2028');

    // Search engines parse each one back to exactly the same object, with its own @context.
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(
      (match) => JSON.parse(match[1]!) as Record<string, unknown>,
    );
    expect(blocks).toEqual(data);
    for (const block of blocks) expect(block['@context']).toBe('https://schema.org');
  });

  it('escapes <, >, & and the JavaScript line separators', () => {
    expect(serializeJsonLd({ '@type': 'Thing', name: '<a> &   ' })).toBe(
      '{"@type":"Thing","name":"\\u003ca\\u003e \\u0026 \\u2028\\u2029"}',
    );
  });
});

describe('opening hours for schema.org', () => {
  const week = (
    days: Partial<Record<'mon' | 'tue' | 'fri' | 'sat', { open: string; close: string }[]>>,
  ) => ({
    days: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [], ...days },
  });

  it('turns 24:00 into 23:59 and splits a period past midnight', () => {
    expect(
      openingHoursSpecification(
        week({
          mon: [{ open: '09:00', close: '24:00' }],
          fri: [{ open: '18:00', close: '02:00' }],
        }),
      ),
    ).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'https://schema.org/Monday',
        opens: '09:00',
        closes: '23:59',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'https://schema.org/Friday',
        opens: '18:00',
        closes: '23:59',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'https://schema.org/Saturday',
        opens: '00:00',
        closes: '02:00',
      },
    ]);
  });

  it('closed days produce nothing', () => {
    expect(openingHoursSpecification(week({}))).toEqual([]);
  });
});

describe('placeJsonLd', () => {
  const labels = { home: 'Home', section: 'Restaurants' };

  it('describes a restaurant with its rating, address, price and breadcrumb', () => {
    const [business, crumbs] = placeJsonLd(place(), 'pt-BR', labels);
    expect(business).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: 'Gwangjang Market',
      alternateName: '광장시장',
      url: 'http://localhost:3000/pt/places/gwangjang-market',
      priceRange: '₩₩',
      address: { addressLocality: 'Seoul', addressCountry: 'KR' },
      aggregateRating: { ratingValue: 4.5, reviewCount: 12 },
    });
    expect(crumbs).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { position: 1, name: 'Home', item: 'http://localhost:3000/pt' },
        { position: 2, name: 'Seoul', item: 'http://localhost:3000/pt/cities/seoul' },
        {
          position: 3,
          name: 'Restaurants',
          item: 'http://localhost:3000/pt/cities/seoul/restaurants',
        },
        { position: 4, name: 'Gwangjang Market' },
      ],
    });
  });

  it('has no rating block without reviews, and maps categories to schema.org types', () => {
    const [hike] = placeJsonLd(
      place({ category: 'HIKING', ratingCount: 0, ratingAvg: 0 }),
      'en',
      labels,
    );
    expect(hike?.['@type']).toBe('TouristAttraction');
    expect(hike).not.toHaveProperty('aggregateRating');
    expect(placeJsonLd(place({ category: 'CAFE' }), 'en', labels)[0]?.['@type']).toBe(
      'CafeOrCoffeeShop',
    );
  });
});
