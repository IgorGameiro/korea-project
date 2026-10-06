import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp, loginAs, testSlug } from './helpers';

const API = '/api/v1';

interface PlaceItem {
  slug: string;
  name: string;
  locale: string;
  category: string;
  districtId: string | null;
  priceLevel: number;
  ratingAvg: number;
  tags: string[];
  trail: { difficulty: string } | null;
}
const page = (res: request.Response) =>
  res.body as {
    data: PlaceItem[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  };
const slugsOf = (res: request.Response) => page(res).data.map((p) => p.slug);

describe('Places (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;
  const http = () => request(app.getHttpServer());
  const asAdmin = (req: request.Test) => req.set('Authorization', `Bearer ${adminToken}`);
  const list = (city: string, query = '') =>
    http().get(`${API}/cities/${city}/places?limit=100&${query}`);

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await loginAs(app, 'admin');
    userToken = await loginAs(app, 'user');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /cities/:slug/places', () => {
    it('lists every place of the city, best rated first', async () => {
      const res = await list('seoul').expect(200);
      const { data, meta } = page(res);

      expect(meta.total).toBe(37);
      const ratings = data.map((p) => p.ratingAvg);
      expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
      // Ties on the average are broken by the number of reviews (5.0 x2 before 5.0 x1).
      expect(data.slice(0, 2).map((p) => p.slug)).toEqual([
        'national-museum-of-korea',
        'bukhansan-baegundae-peak',
      ]);
      expect(data[0]).toMatchObject({ locale: 'en', name: 'National Museum of Korea' });
    });

    it('paginates', async () => {
      const res = await http().get(`${API}/cities/seoul/places?limit=5&page=2`).expect(200);

      expect(page(res).meta).toEqual({ page: 2, limit: 5, total: 37, totalPages: 8 });
      expect(page(res).data).toHaveLength(5);
    });

    it('localizes names and descriptions', async () => {
      const res = await list('seoul', 'locale=pt-BR').expect(200);

      expect(page(res).data.find((p) => p.slug === 'gyeongbokgung-palace')).toMatchObject({
        name: 'Palácio Gyeongbokgung',
        locale: 'pt-BR',
      });
    });

    it('filters by category (hiking places carry trail metrics)', async () => {
      const { data } = page(await list('seoul', 'category=HIKING').expect(200));

      expect(data).toHaveLength(5);
      expect(data.every((p) => p.category === 'HIKING' && p.trail !== null)).toBe(true);
    });

    it('filters by difficulty, price levels, tags and minimum rating', async () => {
      expect(slugsOf(await list('seoul', 'difficulty=HARD').expect(200))).toEqual([
        'bukhansan-baegundae-peak',
      ]);
      expect(slugsOf(await list('seoul', 'priceLevel=4').expect(200))).toEqual(['jungsik']);

      const cheap = page(await list('seoul', 'priceLevel=1,2').expect(200)).data;
      expect(cheap.length).toBeGreaterThan(0);
      expect(cheap.every((p) => p.priceLevel <= 2)).toBe(true);

      const tagged = page(await list('seoul', 'tags=free,night').expect(200)).data;
      expect(tagged.length).toBeGreaterThan(0);
      expect(tagged.every((p) => p.tags.includes('free') && p.tags.includes('night'))).toBe(true);

      const topRated = page(await list('seoul', 'minRating=4.5').expect(200)).data;
      expect(topRated.length).toBeGreaterThan(0);
      expect(topRated.every((p) => p.ratingAvg >= 4.5)).toBe(true);
    });

    it('filters by district', async () => {
      const { body: city } = await http().get(`${API}/cities/seoul`).expect(200);
      const hongdae = (city.districts as { id: string; slug: string }[]).find(
        (d) => d.slug === 'hongdae',
      )!;

      const { data } = page(await list('seoul', `districtId=${hongdae.id}`).expect(200));
      expect(data.length).toBeGreaterThan(0);
      expect(data.every((p) => p.districtId === hongdae.id)).toBe(true);
    });

    it('sorts by price', async () => {
      const levels = page(await list('busan', 'sort=price').expect(200)).data.map(
        (p) => p.priceLevel,
      );
      expect(levels).toEqual([...levels].sort((a, b) => a - b));
    });

    describe('search', () => {
      it('matches the name in the requested language, falling back to English', async () => {
        expect(slugsOf(await list('seoul', 'search=palace').expect(200))).toEqual(
          expect.arrayContaining(['gyeongbokgung-palace', 'changdeokgung-palace']),
        );
        expect(
          slugsOf(await list('seoul', 'locale=pt-BR&search=pal%C3%A1cio').expect(200)),
        ).toEqual(expect.arrayContaining(['gyeongbokgung-palace']));
        // English text is searchable for pt-BR readers too (fallback locale).
        expect(slugsOf(await list('seoul', 'locale=pt-BR&search=palace').expect(200))).toContain(
          'gyeongbokgung-palace',
        );
      });

      it('matches the Korean name and exact tags, case-insensitively', async () => {
        expect(
          slugsOf(await list('seoul', `search=${encodeURIComponent('경복궁')}`).expect(200)),
        ).toEqual(['gyeongbokgung-palace']);
        expect(slugsOf(await list('seoul', 'search=HANBOK').expect(200))).toContain(
          'gyeongbokgung-palace',
        );
      });

      it('treats % and _ literally instead of as wildcards', async () => {
        expect(page(await list('seoul', 'search=%25').expect(200)).meta.total).toBe(0);
        expect(page(await list('seoul', 'search=_').expect(200)).meta.total).toBe(0);
      });
    });

    it.each([
      ['priceLevel=5'],
      ['category=SPA'],
      ['sort=name'],
      ['minRating=6'],
      ['tags=Not%20A%20Tag'],
      ['unknown=1'],
      [`search=${'x'.repeat(101)}`],
    ])('rejects %s with 400', async (query) => {
      const res = await http().get(`${API}/cities/seoul/places?${query}`).expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('404s an unknown city', async () => {
      const res = await http().get(`${API}/cities/atlantis/places`).expect(404);
      expect(res.body.error.code).toBe('CITY_NOT_FOUND');
    });
  });

  describe('GET /places/:slug', () => {
    it('returns the place with schedule, note, city and district', async () => {
      const res = await http().get(`${API}/places/gyeongbokgung-palace`).expect(200);

      expect(res.body).toMatchObject({
        slug: 'gyeongbokgung-palace',
        name: 'Gyeongbokgung Palace',
        address: '161 Sajik-ro, Jongno-gu, Seoul',
        openingHoursNote: 'Closed on Tuesdays. Closing time varies by season.',
        city: { slug: 'seoul', name: 'Seoul' },
        district: null,
      });
      expect(res.body.openingHours.days.tue).toEqual([]);
      // A reviewed real photo, with the credit its license requires.
      expect(res.body.images).toEqual([
        {
          url: expect.stringMatching(/^https:\/\/(upload|thumb)\.wikimedia\.org\//),
          credit: {
            author: expect.any(String),
            license: expect.any(String),
            licenseUrl: expect.any(String),
            sourceUrl: expect.stringMatching(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/),
          },
        },
      ]);
      expect(res.body.imageUrl).toBe(res.body.images[0].url);
      expect(res.body.imageCredit).toEqual(res.body.images[0].credit);
    });

    it('localizes the place and its breadcrumb', async () => {
      const res = await http().get(`${API}/places/myeongdong-kyoja?locale=pt-BR`).expect(200);

      expect(res.body).toMatchObject({
        locale: 'pt-BR',
        city: { slug: 'seoul', name: 'Seul' },
        district: { slug: 'myeongdong', name: 'Myeongdong' },
      });
    });

    it('404s an unknown place', async () => {
      const res = await http().get(`${API}/places/nowhere`).expect(404);
      expect(res.body.error.code).toBe('PLACE_NOT_FOUND');
    });
  });

  describe('GET /cities/:slug/map and counts', () => {
    it('returns light markers only', async () => {
      const res = await http().get(`${API}/cities/jeju/map`).expect(200);
      const points = res.body as Record<string, unknown>[];

      expect(points).toHaveLength(32);
      expect(Object.keys(points[0]).sort()).toEqual([
        'category',
        'id',
        'latitude',
        'longitude',
        'name',
        'slug',
      ]);
    });

    it('filters markers by category', async () => {
      const res = await http().get(`${API}/cities/jeju/map?category=NATURE`).expect(200);
      expect((res.body as { category: string }[]).every((p) => p.category === 'NATURE')).toBe(true);
    });

    it('city overview counts places per category', async () => {
      const { body } = await http().get(`${API}/cities/seoul`).expect(200);
      const counts = body.placeCounts as Record<string, number>;

      expect(Object.keys(counts).sort()).toEqual([
        'ATTRACTION',
        'CAFE',
        'CULTURE',
        'HIKING',
        'NATURE',
        'NIGHTLIFE',
        'RESTAURANT',
        'SHOPPING',
      ]);
      expect(counts.CULTURE).toBe(4);
      expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(37);
    });
  });

  describe('admin', () => {
    const placePayload = (cityId: string, overrides: Record<string, unknown> = {}) => ({
      cityId,
      category: 'CAFE',
      slug: testSlug('test-cafe'),
      nameKo: '테스트 카페',
      address: '1 Test-ro, Jeju-si, Jeju',
      latitude: 33.5,
      longitude: 126.53,
      priceLevel: 2,
      averageSpendKRW: 9000,
      openingHours: {
        days: Object.fromEntries(
          ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [
            d,
            [{ open: '09:00', close: '18:00' }],
          ]),
        ),
      },
      tags: ['test'],
      translations: { en: { name: 'Test Café', description: 'A café created by a test' } },
      ...overrides,
    });
    let jejuId: string;

    beforeAll(async () => {
      jejuId = ((await http().get(`${API}/cities/jeju`).expect(200)).body as { id: string }).id;
    });

    it('requires ADMIN', async () => {
      await http().post(`${API}/admin/places`).send({}).expect(401);
      await http()
        .post(`${API}/admin/places`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
    });

    it('creates a place, shows it on the (cached) map, then deletes it', async () => {
      // Warm the cache, then make sure the write invalidates it.
      await http().get(`${API}/cities/jeju/map`).expect(200);

      const payload = placePayload(jejuId);
      const { body: created } = await asAdmin(http().post(`${API}/admin/places`))
        .send(payload)
        .expect(201);
      expect(created).toMatchObject({
        slug: payload.slug,
        ratingAvg: 0,
        ratingCount: 0,
        trail: null,
      });

      const after = await http().get(`${API}/cities/jeju/map`).expect(200);
      expect((after.body as { slug: string }[]).map((p) => p.slug)).toContain(payload.slug);

      await asAdmin(http().post(`${API}/admin/places`))
        .send(payload)
        .expect(409);
      await asAdmin(http().delete(`${API}/admin/places/${created.id}`)).expect(204);
      await http().get(`${API}/places/${payload.slug}`).expect(404);
    });

    it('validates trail metrics, districts and opening hours', async () => {
      const trail = { difficulty: 'EASY', distanceKm: 2, durationMinutes: 60, elevationGainM: 50 };
      const noHiking = await asAdmin(http().post(`${API}/admin/places`))
        .send(placePayload(jejuId, { trail }))
        .expect(400);
      expect(noHiking.body.error.code).toBe('TRAIL_ONLY_FOR_HIKING');

      const { body: seoul } = await http().get(`${API}/cities/seoul`).expect(200);
      const otherCityDistrict = (seoul.districts as { id: string }[])[0].id;
      const wrongDistrict = await asAdmin(http().post(`${API}/admin/places`))
        .send(placePayload(jejuId, { districtId: otherCityDistrict }))
        .expect(404);
      expect(wrongDistrict.body.error.code).toBe('DISTRICT_NOT_IN_CITY');

      await asAdmin(http().post(`${API}/admin/places`))
        .send(
          placePayload(jejuId, {
            openingHours: { days: { mon: [{ open: '9', close: '25:00' }] } },
          }),
        )
        .expect(400);
      await asAdmin(http().post(`${API}/admin/places`))
        .send(placePayload(jejuId, { ratingAvg: 5 }))
        .expect(400);
    });

    it('updates one locale without touching the other; leaving HIKING clears the trail', async () => {
      const trail = {
        difficulty: 'MODERATE',
        distanceKm: 5,
        durationMinutes: 120,
        elevationGainM: 300,
      };
      const { body: hike } = await asAdmin(http().post(`${API}/admin/places`))
        .send(placePayload(jejuId, { category: 'HIKING', trail }))
        .expect(201);
      expect(hike.trail).toEqual(trail);

      const withPt = await asAdmin(http().patch(`${API}/admin/places/${hike.id}`))
        .send({
          translations: { 'pt-BR': { name: 'Trilha Teste', description: 'Criada por um teste' } },
        })
        .expect(200);
      expect(withPt.body.translations.en).toMatchObject({ name: 'Test Café' });
      expect(withPt.body.translations['pt-BR']).toMatchObject({ name: 'Trilha Teste' });

      const nowCafe = await asAdmin(http().patch(`${API}/admin/places/${hike.id}`))
        .send({ category: 'CAFE' })
        .expect(200);
      expect(nowCafe.body.trail).toBeNull();

      await asAdmin(http().delete(`${API}/admin/places/${hike.id}`)).expect(204);
    });

    it('refuses to delete a place that has reviews', async () => {
      const { body } = await asAdmin(http().get(`${API}/admin/places?limit=100`)).expect(200);
      const reviewed = (body.data as { id: string; slug: string }[]).find(
        (p) => p.slug === 'gyeongbokgung-palace',
      )!;

      const res = await asAdmin(http().delete(`${API}/admin/places/${reviewed.id}`)).expect(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });
  });
});
