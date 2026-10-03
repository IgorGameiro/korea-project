import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp, loginAs, testSlug } from './helpers';

const API = '/api/v1';

const cityPayload = (slug: string, translations: Record<string, unknown>) => ({
  slug,
  nameKo: '테스트',
  heroImageUrl: 'https://picsum.photos/seed/test/1600/900',
  latitude: 37.5,
  longitude: 127,
  translations,
});
type CityItem = { slug: string; name: string; locale: string };
const items = (res: request.Response) => (res.body as { data: CityItem[] }).data;
const slugs = (res: request.Response) => items(res).map((c) => c.slug);

const enText = { name: 'Test City', description: 'A city for tests', bestTimeToVisit: 'Always' };
const ptText = {
  name: 'Cidade Teste',
  description: 'Uma cidade de teste',
  bestTimeToVisit: 'Sempre',
};

describe('Cities and districts (e2e)', () => {
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

  describe('public', () => {
    it('lists cities in English by default, ordered and paginated', async () => {
      const res = await http().get(`${API}/cities?limit=2`).expect(200);

      expect(res.body.meta).toEqual({ page: 1, limit: 2, total: 4, totalPages: 2 });
      expect(slugs(res)).toEqual(['seoul', 'busan']);
      expect(res.body.data[0]).toMatchObject({ name: 'Seoul', nameKo: '서울', locale: 'en' });
    });

    it('localizes with ?locale=pt-BR', async () => {
      const res = await http().get(`${API}/cities?locale=pt-BR`).expect(200);

      const seoul = items(res).find((c) => c.slug === 'seoul');
      expect(seoul).toMatchObject({ name: 'Seul', locale: 'pt-BR' });
    });

    it('filters featured cities', async () => {
      const res = await http().get(`${API}/cities?featured=false`).expect(200);

      expect(slugs(res)).toEqual(['incheon']);
    });

    it('rejects an invalid filter value', async () => {
      await http().get(`${API}/cities?featured=maybe`).expect(400);
    });

    it('returns a city with its localized districts', async () => {
      const res = await http()
        .get(`${API}/cities/seoul`)
        .set('Accept-Language', 'pt-BR')
        .expect(200);

      expect(res.body).toMatchObject({ slug: 'seoul', name: 'Seul', locale: 'pt-BR' });
      expect(res.body.districts).toHaveLength(5);
      expect(res.body.districts[0]).toEqual(
        expect.objectContaining({
          slug: expect.any(String),
          name: expect.any(String),
          locale: 'pt-BR',
        }),
      );
      expect(res.headers.vary).toMatch(/Accept-Language/i);
    });

    it('404s an unknown city', async () => {
      const res = await http().get(`${API}/cities/atlantis`).expect(404);
      expect(res.body.error.code).toBe('CITY_NOT_FOUND');
    });
  });

  describe('admin access control', () => {
    it.each([
      ['GET', '/admin/cities'],
      ['POST', '/admin/cities'],
      ['GET', '/admin/districts'],
    ])('%s %s: 401 without a token, 403 for a USER', async (method, path) => {
      const call = () =>
        method === 'GET' ? http().get(`${API}${path}`) : http().post(`${API}${path}`).send({});

      await call().expect(401);
      const res = await call().set('Authorization', `Bearer ${userToken}`).expect(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('admin CRUD', () => {
    it('creates a city with only English, falling back to it for pt-BR readers', async () => {
      const slug = testSlug('only-en');
      const created = await asAdmin(http().post(`${API}/admin/cities`))
        .send(cityPayload(slug, { en: enText }))
        .expect(201);

      expect(created.body.translations).toEqual({ en: enText });

      const res = await http().get(`${API}/cities/${slug}?locale=pt-BR`).expect(200);
      expect(res.body).toMatchObject({ name: 'Test City', locale: 'en' });
    });

    it('requires the English translation on create', async () => {
      const res = await asAdmin(http().post(`${API}/admin/cities`))
        .send(cityPayload(testSlug('no-en'), { 'pt-BR': ptText }))
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects unsupported locales and bad slugs', async () => {
      await asAdmin(http().post(`${API}/admin/cities`))
        .send(cityPayload(testSlug('fr'), { en: enText, fr: enText }))
        .expect(400);
      await asAdmin(http().post(`${API}/admin/cities`))
        .send(cityPayload('Not A Slug', { en: enText }))
        .expect(400);
    });

    it('409s a duplicate slug', async () => {
      await asAdmin(http().post(`${API}/admin/cities`))
        .send(cityPayload('seoul', { en: enText }))
        .expect(409);
    });

    it('updating only pt-BR keeps en, partial en updates keep the other fields', async () => {
      const slug = testSlug('partial');
      const { body: city } = await asAdmin(http().post(`${API}/admin/cities`))
        .send(cityPayload(slug, { en: enText }))
        .expect(201);

      // Add pt-BR without sending en.
      const added = await asAdmin(http().patch(`${API}/admin/cities/${city.id}`))
        .send({ translations: { 'pt-BR': ptText } })
        .expect(200);
      expect(added.body.translations).toEqual({ en: enText, 'pt-BR': ptText });

      // Change one en field: the other en fields and pt-BR stay.
      const renamed = await asAdmin(http().patch(`${API}/admin/cities/${city.id}`))
        .send({ translations: { en: { name: 'Renamed City' } }, isFeatured: true })
        .expect(200);
      expect(renamed.body.translations).toEqual({
        en: { ...enText, name: 'Renamed City' },
        'pt-BR': ptText,
      });
      expect(renamed.body.isFeatured).toBe(true);
    });

    it('a new translation must be complete; null removes pt-BR but never en', async () => {
      const { body: city } = await asAdmin(http().post(`${API}/admin/cities`))
        .send(cityPayload(testSlug('nulls'), { en: enText, 'pt-BR': ptText }))
        .expect(201);

      const removed = await asAdmin(http().patch(`${API}/admin/cities/${city.id}`))
        .send({ translations: { 'pt-BR': null } })
        .expect(200);
      expect(removed.body.translations).toEqual({ en: enText });

      const incomplete = await asAdmin(http().patch(`${API}/admin/cities/${city.id}`))
        .send({ translations: { 'pt-BR': { name: 'Só o nome' } } })
        .expect(400);
      expect(incomplete.body.error.code).toBe('TRANSLATION_INCOMPLETE');

      const noEn = await asAdmin(http().patch(`${API}/admin/cities/${city.id}`))
        .send({ translations: { en: null } })
        .expect(400);
      expect(noEn.body.error.code).toBe('DEFAULT_TRANSLATION_REQUIRED');
    });

    it('deletes an empty city but refuses one with related records', async () => {
      const { body: city } = await asAdmin(http().post(`${API}/admin/cities`))
        .send(cityPayload(testSlug('delete-me'), { en: enText }))
        .expect(201);
      await asAdmin(http().delete(`${API}/admin/cities/${city.id}`)).expect(204);
      await asAdmin(http().get(`${API}/admin/cities/${city.id}`)).expect(404);

      const { body: seoul } = await http().get(`${API}/cities/seoul`).expect(200);
      const res = await asAdmin(http().delete(`${API}/admin/cities/${seoul.id}`)).expect(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('404s unknown ids and 400s malformed ones', async () => {
      await asAdmin(http().get(`${API}/admin/cities/00000000-0000-7000-8000-000000000000`)).expect(
        404,
      );
      await asAdmin(http().get(`${API}/admin/cities/not-a-uuid`)).expect(400);
    });

    it('manages districts: unique slug per city, partial translations', async () => {
      const { body: city } = await asAdmin(http().post(`${API}/admin/cities`))
        .send(cityPayload(testSlug('with-district'), { en: enText }))
        .expect(201);
      const district = {
        cityId: city.id,
        slug: 'old-town',
        nameKo: '구시가지',
        latitude: 37.5,
        longitude: 127,
        translations: { en: { name: 'Old Town', description: 'Historic center' } },
      };

      const { body: created } = await asAdmin(http().post(`${API}/admin/districts`))
        .send(district)
        .expect(201);
      await asAdmin(http().post(`${API}/admin/districts`))
        .send(district)
        .expect(409);

      // The same slug is fine in another city.
      const { body: seoul } = await http().get(`${API}/cities/seoul`).expect(200);
      await asAdmin(http().post(`${API}/admin/districts`))
        .send({ ...district, cityId: seoul.id })
        .expect(201);

      const updated = await asAdmin(http().patch(`${API}/admin/districts/${created.id}`))
        .send({
          translations: { 'pt-BR': { name: 'Cidade Velha', description: 'Centro histórico' } },
        })
        .expect(200);
      expect(updated.body.translations).toEqual({
        en: { name: 'Old Town', description: 'Historic center' },
        'pt-BR': { name: 'Cidade Velha', description: 'Centro histórico' },
      });

      const overview = await http().get(`${API}/cities/${city.slug}?locale=pt-BR`).expect(200);
      expect(overview.body.districts).toEqual([
        expect.objectContaining({ slug: 'old-town', name: 'Cidade Velha', locale: 'pt-BR' }),
      ]);

      // A city with districts cannot be deleted; once they are gone it can.
      await asAdmin(http().delete(`${API}/admin/cities/${city.id}`)).expect(409);
      await asAdmin(http().delete(`${API}/admin/districts/${created.id}`)).expect(204);
      await asAdmin(http().delete(`${API}/admin/cities/${city.id}`)).expect(204);
    });

    it('rejects a district for an unknown city', async () => {
      const res = await asAdmin(http().post(`${API}/admin/districts`))
        .send({
          cityId: '00000000-0000-7000-8000-000000000000',
          slug: 'nowhere',
          nameKo: '없음',
          latitude: 37,
          longitude: 127,
          translations: { en: { name: 'Nowhere', description: 'None' } },
        })
        .expect(404);
      expect(res.body.error.code).toBe('CITY_NOT_FOUND');
    });
  });
});
