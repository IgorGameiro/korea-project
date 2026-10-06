import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
const load = vi.fn();
const allPlaceSlugs = vi.fn();
vi.mock('@/lib/api/server', async () => {
  class ApiUnavailableError extends Error {}
  return { ApiUnavailableError, load, serverApi: () => ({ GET: () => Promise.resolve({}) }) };
});
vi.mock('@/features/places/data', () => ({ allPlaceSlugs }));

const { default: sitemap } = await import('./sitemap');
const { default: robots } = await import('./robots');
const { ApiUnavailableError } = await import('@/lib/api/server');
const { openGraphFor } = await import('@/lib/seo');

afterEach(() => {
  load.mockReset();
  allPlaceSlugs.mockReset();
});

describe('sitemap.xml', () => {
  it('lists every indexable page in both languages, each with its alternates', async () => {
    load.mockResolvedValue({ data: [{ slug: 'seoul' }] });
    allPlaceSlugs.mockResolvedValue(['gyeongbokgung-palace']);
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    // home + plan + credits + 1 city + 9 sections + 1 place = 14 pages, in 2 languages
    expect(urls).toHaveLength(28);
    expect(urls).toContain('http://localhost:3000/cities/seoul/hiking');
    expect(urls).toContain('http://localhost:3000/pt/places/gyeongbokgung-palace');
    expect(urls.some((url) => /\/(admin|account|login|register|search)/.test(url))).toBe(false);

    const place = entries.find(
      (e) => e.url === 'http://localhost:3000/places/gyeongbokgung-palace',
    );
    expect(place?.alternates?.languages).toEqual({
      en: 'http://localhost:3000/places/gyeongbokgung-palace',
      'pt-BR': 'http://localhost:3000/pt/places/gyeongbokgung-palace',
      'x-default': 'http://localhost:3000/places/gyeongbokgung-palace',
    });
  });

  it('still answers with the fixed pages when the API is down', async () => {
    load.mockRejectedValue(new ApiUnavailableError('down'));
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toEqual([
      'http://localhost:3000/',
      'http://localhost:3000/pt',
      'http://localhost:3000/plan',
      'http://localhost:3000/pt/plan',
      'http://localhost:3000/credits',
      'http://localhost:3000/pt/credits',
    ]);
  });
});

describe('robots.txt', () => {
  it('blocks only the admin and the API, and points to the sitemap', () => {
    const result = robots();
    expect(result.rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/pt/admin', '/api/'],
    });
    expect(result.sitemap).toBe('http://localhost:3000/sitemap.xml');
  });
});

describe('openGraphFor', () => {
  it('uses the public default image URL and Open Graph locale codes', () => {
    expect(openGraphFor({ locale: 'pt-BR', siteName: 'Guia' })).toEqual({
      siteName: 'Guia',
      type: 'website',
      locale: 'pt_BR',
      alternateLocale: ['en'],
      images: [{ url: 'http://localhost:3000/pt/og', width: 1200, height: 630, alt: 'Guia' }],
    });
  });

  it("keeps a page's own photo", () => {
    expect(
      openGraphFor({ locale: 'en', siteName: 'Guide', images: ['https://picsum.photos/x'] })
        ?.images,
    ).toEqual(['https://picsum.photos/x']);
  });
});
