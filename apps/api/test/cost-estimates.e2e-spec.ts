import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp, loginAs, testSlug } from './helpers';

const API = '/api/v1';

describe('Cost estimates (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;
  const http = () => request(app.getHttpServer());
  const asAdmin = (req: request.Test) => req.set('Authorization', `Bearer ${adminToken}`);
  const calculate = (body: Record<string, unknown>, query = '') =>
    http().post(`${API}/cost-estimates/calculate${query}`).send(body);
  const trip = { citySlug: 'seoul', people: 2, days: 7, tier: 'MID' };

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await loginAs(app, 'admin');
    userToken = await loginAs(app, 'user');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /cost-estimates/calculate', () => {
    it('applies the formula to the seeded Seoul MID costs (public, no login)', async () => {
      const res = await calculate({ ...trip, currency: 'USD' }).expect(200);

      // Seoul MID: 180,000/room/night; 70,000 food, 15,000 transport, 40,000 activities per person/day.
      // 2 people -> 1 room; 7 days -> 6 nights.
      expect(res.body).toMatchObject({
        city: { slug: 'seoul', name: 'Seoul', locale: 'en' },
        people: 2,
        days: 7,
        rooms: 1,
        nights: 6,
        tier: 'MID',
        currency: 'USD',
        exchangeRate: { base: 'KRW', currency: 'USD', rate: 0.00072 },
        breakdown: {
          lodging: { krw: 1_080_000, amount: 777.6 },
          food: { krw: 980_000, amount: 705.6 },
          transport: { krw: 210_000, amount: 151.2 },
          activities: { krw: 560_000, amount: 403.2 },
        },
        total: { krw: 2_830_000, amount: 2037.6 },
        perDay: { krw: 404_286, amount: 291.09 },
        perPerson: { krw: 1_415_000, amount: 1018.8 },
      });
      expect(Number.isNaN(Date.parse(res.body.exchangeRate.updatedAt as string))).toBe(false);
    });

    it('converts to BRL on request', async () => {
      const res = await calculate({ ...trip, currency: 'BRL' }).expect(200);

      expect(res.body.total).toEqual({ krw: 2_830_000, amount: 11_037 });
    });

    it('defaults the currency and city name from the locale', async () => {
      const pt = await calculate(trip, '?locale=pt-BR').expect(200);
      expect(pt.body).toMatchObject({ currency: 'BRL', city: { name: 'Seul', locale: 'pt-BR' } });

      const en = await calculate(trip).expect(200);
      expect(en.body.currency).toBe('USD');
    });

    it('handles the edge cases from the spec: 1 person, odd groups, 1 day', async () => {
      const solo = await calculate({ ...trip, people: 1, days: 1 }).expect(200);
      expect(solo.body).toMatchObject({ rooms: 1, nights: 1 });
      expect(solo.body.breakdown.lodging.krw).toBe(180_000);

      const odd = await calculate({ ...trip, people: 5 }).expect(200);
      expect(odd.body.rooms).toBe(3);
    });

    it.each([
      [{ people: 0 }],
      [{ people: 21 }],
      [{ days: 0 }],
      [{ days: 31 }],
      [{ people: 2.5 }],
      [{ tier: 'PREMIUM' }],
      [{ currency: 'EUR' }],
      [{ citySlug: 'Seoul City' }],
      [{ discount: 10 }],
    ])('rejects %p with 400', async (override) => {
      const res = await calculate({ ...trip, ...override }).expect(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('404s an unknown city', async () => {
      const res = await calculate({ ...trip, citySlug: 'atlantis' }).expect(404);
      expect(res.body.error.code).toBe('CITY_NOT_FOUND');
    });
  });

  describe('admin', () => {
    it('requires ADMIN', async () => {
      await http().get(`${API}/admin/cost-estimates`).expect(401);
      await http()
        .get(`${API}/admin/cost-estimates`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('lists the 12 seeded estimates and refuses a duplicate city + tier', async () => {
      const list = await asAdmin(http().get(`${API}/admin/cost-estimates`)).expect(200);
      expect(list.body.meta.total).toBe(12);

      const seoul = (await http().get(`${API}/cities/seoul`).expect(200)).body as { id: string };
      await asAdmin(http().post(`${API}/admin/cost-estimates`))
        .send({
          cityId: seoul.id,
          tier: 'MID',
          lodgingPerRoomPerNightKRW: 1,
          foodPerPersonPerDayKRW: 1,
          transportPerPersonPerDayKRW: 1,
          activitiesPerPersonPerDayKRW: 1,
        })
        .expect(409);
    });

    it('a city without an estimate 404s until one is created; updates change the result', async () => {
      const { body: city } = await asAdmin(http().post(`${API}/admin/cities`))
        .send({
          slug: testSlug('costless'),
          nameKo: '테스트',
          heroImageUrl: 'https://picsum.photos/seed/x/1600/900',
          latitude: 37,
          longitude: 127,
          translations: {
            en: { name: 'Costless', description: 'No estimates', bestTimeToVisit: 'Any' },
          },
        })
        .expect(201);
      const body = { citySlug: city.slug, people: 2, days: 2, tier: 'BUDGET' };

      const missing = await calculate(body).expect(404);
      expect(missing.body.error.code).toBe('COST_ESTIMATE_NOT_FOUND');

      const { body: estimate } = await asAdmin(http().post(`${API}/admin/cost-estimates`))
        .send({
          cityId: city.id,
          tier: 'BUDGET',
          lodgingPerRoomPerNightKRW: 50_000,
          foodPerPersonPerDayKRW: 20_000,
          transportPerPersonPerDayKRW: 5_000,
          activitiesPerPersonPerDayKRW: 5_000,
        })
        .expect(201);

      // 2 people, 2 days: 1 room x 1 night + 2 x (20k + 5k + 5k) x 2 days
      expect((await calculate(body).expect(200)).body.total.krw).toBe(50_000 + 120_000);

      await asAdmin(http().patch(`${API}/admin/cost-estimates/${estimate.id}`))
        .send({ lodgingPerRoomPerNightKRW: 80_000 })
        .expect(200);
      expect((await calculate(body).expect(200)).body.total.krw).toBe(80_000 + 120_000);

      await asAdmin(http().patch(`${API}/admin/cost-estimates/${estimate.id}`))
        .send({ tier: 'LUXURY' })
        .expect(400);
      await asAdmin(http().delete(`${API}/admin/cost-estimates/${estimate.id}`)).expect(204);
      await asAdmin(http().delete(`${API}/admin/cities/${city.id}`)).expect(204);
    });
  });
});
