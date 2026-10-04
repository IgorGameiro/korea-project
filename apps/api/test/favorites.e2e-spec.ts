import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp, registerUser } from './helpers';

const API = '/api/v1';

describe('Favorites (e2e)', () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const placeId = async (slug: string) =>
    ((await http().get(`${API}/places/${slug}`).expect(200)).body as { id: string }).id;

  it('favorites idempotently, reports the status and lists favorites localized', async () => {
    const user = await registerUser(app);
    const auth = { Authorization: `Bearer ${user.token}` };
    const udo = await placeId('udo-island');
    const museum = await placeId('national-museum-of-korea');

    await http().post(`${API}/places/${udo}/favorite`).set(auth).expect(204);
    await http().post(`${API}/places/${udo}/favorite`).set(auth).expect(204);
    await http().post(`${API}/places/${museum}/favorite`).set(auth).expect(204);

    const status = await http().get(`${API}/places/${udo}/favorite`).set(auth).expect(200);
    expect(status.body).toEqual({ favorited: true });

    const list = await http().get(`${API}/users/me/favorites?locale=pt-BR`).set(auth).expect(200);
    expect(list.body.meta.total).toBe(2);
    // Most recently favorited first, names in Portuguese.
    expect((list.body.data as { name: string }[]).map((p) => p.name)).toEqual([
      'Museu Nacional da Coreia',
      'Ilha Udo',
    ]);

    // Just the ids, to mark the hearts on every card of a page with one request.
    const ids = await http().get(`${API}/users/me/favorites/ids`).set(auth).expect(200);
    expect(ids.body).toEqual({ placeIds: [museum, udo] });

    await http().delete(`${API}/places/${udo}/favorite`).set(auth).expect(204);
    await http().delete(`${API}/places/${udo}/favorite`).set(auth).expect(204);
    const after = await http().get(`${API}/places/${udo}/favorite`).set(auth).expect(200);
    expect(after.body).toEqual({ favorited: false });
  });

  it("does not see other users' favorites", async () => {
    const [a, b] = await Promise.all([registerUser(app), registerUser(app)]);
    const udo = await placeId('udo-island');

    await http()
      .post(`${API}/places/${udo}/favorite`)
      .set({ Authorization: `Bearer ${a.token}` })
      .expect(204);

    const res = await http()
      .get(`${API}/users/me/favorites`)
      .set({ Authorization: `Bearer ${b.token}` })
      .expect(200);
    expect(res.body.meta.total).toBe(0);
    const ids = await http()
      .get(`${API}/users/me/favorites/ids`)
      .set({ Authorization: `Bearer ${b.token}` })
      .expect(200);
    expect(ids.body).toEqual({ placeIds: [] });
  });

  it('requires authentication and an existing place', async () => {
    const user = await registerUser(app);
    const udo = await placeId('udo-island');

    await http().post(`${API}/places/${udo}/favorite`).expect(401);
    await http().get(`${API}/users/me/favorites`).expect(401);
    await http().get(`${API}/users/me/favorites/ids`).expect(401);
    const res = await http()
      .post(`${API}/places/00000000-0000-7000-8000-000000000000/favorite`)
      .set({ Authorization: `Bearer ${user.token}` })
      .expect(404);
    expect(res.body.error.code).toBe('PLACE_NOT_FOUND');
  });
});
