import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './helpers';

interface Result {
  slug: string;
  name: string;
  category: string;
  locale: string;
  city: { slug: string; name: string };
}
const body = (res: request.Response) =>
  res.body as {
    data: Result[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };

describe('Search (e2e)', () => {
  let app: INestApplication<App>;
  const search = (query: string) => request(app.getHttpServer()).get(`/api/v1/search?${query}`);

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('finds places across cities, each with its localized city', async () => {
    const res = await search('q=market&limit=50').expect(200);
    const cities = new Set(body(res).data.map((r) => r.city.slug));

    expect(cities.size).toBeGreaterThan(1);
    expect(body(res).data.map((r) => r.slug)).toEqual(
      expect.arrayContaining(['gwangjang-market', 'jagalchi-fish-market', 'dongmun-market']),
    );

    const pt = await search('q=mercado&locale=pt-BR&limit=50').expect(200);
    const gwangjang = body(pt).data.find((r) => r.slug === 'gwangjang-market');
    expect(gwangjang).toMatchObject({
      name: 'Mercado Gwangjang',
      locale: 'pt-BR',
      city: { name: 'Seul' },
    });
  });

  it('matches Korean names and tags', async () => {
    expect(
      body(await search(`q=${encodeURIComponent('해운대')}`).expect(200)).data.map(
        (r) => r.city.slug,
      ),
    ).toContain('busan');
    expect(body(await search('q=unesco&limit=50').expect(200)).meta.total).toBeGreaterThan(2);
  });

  it('paginates', async () => {
    const res = await search('q=a&category=HIKING').expect(400); // q too short even with a category
    expect(res.body.error.code).toBe('VALIDATION_ERROR');

    const page = await search('category=CAFE&limit=5&page=2').expect(200);
    expect(body(page).meta).toMatchObject({ page: 2, limit: 5 });
    expect(body(page).data.every((r) => r.category === 'CAFE')).toBe(true);
  });

  it('lists a category across every city without a term', async () => {
    const res = await search('category=HIKING&limit=100').expect(200);

    expect(body(res).meta.total).toBe(19); // 5 + 5 + 5 + 4 seeded trails
    expect(new Set(body(res).data.map((r) => r.city.slug)).size).toBe(4);
  });

  it('treats % and _ literally', async () => {
    expect(body(await search('q=%25%25').expect(200)).meta.total).toBe(0);
    expect(body(await search('q=__').expect(200)).meta.total).toBe(0);
  });

  it.each([
    ['', 'nothing to search for'],
    ['q=a', 'a 1-character term'],
    ['q=%20%20a%20%20', 'a term that is 1 character after trimming'],
    [`q=${'x'.repeat(101)}`, 'a 101-character term'],
    ['category=SPA', 'an unknown category'],
    ['q=palace&sort=price', 'an unknown parameter'],
  ])('rejects %p (%s) with 400', async (query) => {
    const res = await search(query).expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('accepts exactly 2 and 100 characters', async () => {
    await search('q=ab').expect(200);
    await search(`q=${'x'.repeat(100)}`).expect(200);
  });
});
