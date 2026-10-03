import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp, loginAs, testSlug } from './helpers';

const API = '/api/v1';

interface AccommodationItem {
  slug: string;
  name: string;
  tier: string;
  type: string;
  districtId: string | null;
  pricePerNightKRW: number;
}
const items = (res: request.Response) =>
  (res.body as { data: AccommodationItem[]; meta: { total: number } }).data;

describe('Accommodations (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let userToken: string;
  const http = () => request(app.getHttpServer());
  const asAdmin = (req: request.Test) => req.set('Authorization', `Bearer ${adminToken}`);

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await loginAs(app, 'admin');
    userToken = await loginAs(app, 'user');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /cities/:slug/accommodations', () => {
    it('lists the 9 accommodations of a city, cheapest first', async () => {
      const res = await http().get(`${API}/cities/seoul/accommodations`).expect(200);
      const prices = items(res).map((a) => a.pricePerNightKRW);

      expect(res.body.meta.total).toBe(9);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('filters by tier and type, and sorts most expensive first', async () => {
      const luxury = items(
        await http().get(`${API}/cities/seoul/accommodations?tier=LUXURY&sort=-price`).expect(200),
      );
      expect(luxury.map((a) => a.slug)).toEqual([
        'signiel-seoul',
        'the-shilla-seoul',
        'rakkojae-seoul',
      ]);

      const hanoks = items(
        await http().get(`${API}/cities/seoul/accommodations?type=HANOK`).expect(200),
      );
      expect(hanoks.map((a) => a.name)).toEqual(['Rakkojae Seoul']);
    });

    it('accepts ?locale (the front sends it everywhere) and rejects bad filters', async () => {
      await http().get(`${API}/cities/seoul/accommodations?locale=pt-BR`).expect(200);
      await http().get(`${API}/cities/seoul/accommodations?tier=CHEAP`).expect(400);
      await http().get(`${API}/cities/atlantis/accommodations`).expect(404);
    });
  });

  describe('admin', () => {
    let busan: { id: string; districts: { id: string; slug: string }[] };

    beforeAll(async () => {
      busan = (await http().get(`${API}/cities/busan`).expect(200)).body as typeof busan;
    });

    const payload = (overrides: Record<string, unknown> = {}) => ({
      cityId: busan.id,
      slug: testSlug('test-hotel'),
      name: 'Test Hotel',
      type: 'HOTEL',
      tier: 'MID',
      pricePerNightKRW: 150000,
      latitude: 35.16,
      longitude: 129.16,
      ...overrides,
    });

    it('requires ADMIN', async () => {
      await http().post(`${API}/admin/accommodations`).send({}).expect(401);
      await http()
        .post(`${API}/admin/accommodations`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
    });

    it('creates, updates and deletes an accommodation', async () => {
      const haeundae = busan.districts.find((d) => d.slug === 'haeundae')!;
      const data = payload({ districtId: haeundae.id });

      const { body: created } = await asAdmin(http().post(`${API}/admin/accommodations`))
        .send(data)
        .expect(201);
      expect(created).toMatchObject({ slug: data.slug, districtId: haeundae.id, imageUrls: [] });

      await asAdmin(http().post(`${API}/admin/accommodations`))
        .send(data)
        .expect(409);

      const { body: updated } = await asAdmin(
        http().patch(`${API}/admin/accommodations/${created.id}`),
      )
        .send({ pricePerNightKRW: 120000, tier: 'BUDGET' })
        .expect(200);
      expect(updated).toMatchObject({
        pricePerNightKRW: 120000,
        tier: 'BUDGET',
        name: 'Test Hotel',
      });

      const budget = items(
        await http().get(`${API}/cities/busan/accommodations?tier=BUDGET&limit=100`).expect(200),
      );
      expect(budget.map((a) => a.slug)).toContain(data.slug);

      await asAdmin(http().delete(`${API}/admin/accommodations/${created.id}`)).expect(204);
      await asAdmin(http().get(`${API}/admin/accommodations/${created.id}`)).expect(404);
    });

    it('rejects a district from another city, unknown fields and invalid values', async () => {
      const { body: seoul } = await http().get(`${API}/cities/seoul`).expect(200);
      const seoulDistrict = (seoul.districts as { id: string }[])[0].id;

      const wrong = await asAdmin(http().post(`${API}/admin/accommodations`))
        .send(payload({ districtId: seoulDistrict }))
        .expect(404);
      expect(wrong.body.error.code).toBe('DISTRICT_NOT_IN_CITY');

      await asAdmin(http().post(`${API}/admin/accommodations`))
        .send(payload({ pricePerNightKRW: -1 }))
        .expect(400);
      await asAdmin(http().post(`${API}/admin/accommodations`))
        .send(payload({ bookingUrl: 'http://insecure.example.com' }))
        .expect(400);
      await asAdmin(
        http().patch(`${API}/admin/accommodations/00000000-0000-7000-8000-000000000000`),
      )
        .send({ cityId: busan.id })
        .expect(400);
    });
  });
});
