import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp, loginAs, registerUser } from './helpers';

const API = '/api/v1';

interface PlaceView {
  id: string;
  slug: string;
  ratingAvg: number;
  ratingCount: number;
  recentReviews: { id: string; title: string; author: { name: string } }[];
}

describe('Reviews (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  const http = () => request(app.getHttpServer());
  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
  const place = async (slug: string) =>
    (await http().get(`${API}/places/${slug}`).expect(200)).body as PlaceView;
  const review = (overrides: Record<string, unknown> = {}) => ({
    rating: 4,
    title: 'Worth it',
    comment: 'Great place, would go again.',
    visitedAt: '2026-05-01',
    ...overrides,
  });

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await loginAs(app, 'admin');
  });

  afterAll(async () => {
    await app.close();
  });

  it('a review updates the place rating and appears on the place page', async () => {
    // Places without seeded reviews start at 0/0.
    const target = await place('inwangsan');
    expect([target.ratingAvg, target.ratingCount]).toEqual([0, 0]);

    const alice = await registerUser(app, 'Alice Reviewer');
    const res = await http()
      .post(`${API}/places/${target.id}/reviews`)
      .set(bearer(alice.token))
      .send(review({ rating: 5 }))
      .expect(201);

    expect(res.body).toMatchObject({
      placeId: target.id,
      rating: 5,
      locale: 'en',
      visitedAt: '2026-05-01',
      author: { id: alice.id, name: 'Alice Reviewer' },
    });
    expect(JSON.stringify(res.body)).not.toMatch(/email|passwordHash/);

    const after = await place('inwangsan');
    expect([after.ratingAvg, after.ratingCount]).toEqual([5, 1]);
    expect(after.recentReviews[0]).toMatchObject({
      title: 'Worth it',
      author: { name: 'Alice Reviewer' },
    });
  });

  it('409s a second review of the same place by the same user', async () => {
    const target = await place('achasan');
    const bob = await registerUser(app);
    const post = () =>
      http().post(`${API}/places/${target.id}/reviews`).set(bearer(bob.token)).send(review());

    await post().expect(201);
    const res = await post().expect(409);
    expect(res.body.error.code).toBe('REVIEW_ALREADY_EXISTS');
    expect((await place('achasan')).ratingCount).toBe(1);
  });

  it('records the language: explicit, or the request locale by default', async () => {
    const target = await place('gwanaksan');
    const carol = await registerUser(app);
    const dave = await registerUser(app);

    const explicit = await http()
      .post(`${API}/places/${target.id}/reviews`)
      .set(bearer(carol.token))
      .send(review({ locale: 'pt-BR', title: 'Muito bom' }))
      .expect(201);
    expect(explicit.body.locale).toBe('pt-BR');

    const fromRequest = await http()
      .post(`${API}/places/${target.id}/reviews?locale=pt-BR`)
      .set(bearer(dave.token))
      .send(review())
      .expect(201);
    expect(fromRequest.body.locale).toBe('pt-BR');
  });

  it('validates the review', async () => {
    const target = await place('namsan-trail');
    const erin = await registerUser(app);
    const post = (body: unknown, id = target.id) =>
      http()
        .post(`${API}/places/${id}/reviews`)
        .set(bearer(erin.token))
        .send(body as object);

    await post(review({ rating: 6 })).expect(400);
    await post(review({ title: '   ' })).expect(400);
    await post(review({ locale: 'fr' })).expect(400);
    await post(review({ userId: 'someone-else' })).expect(400);
    const future = await post(review({ visitedAt: '2099-01-01' })).expect(400);
    expect(future.body.error.code).toBe('VISITED_AT_IN_FUTURE');

    await post(review(), '00000000-0000-7000-8000-000000000000').expect(404);
    await post(review(), 'not-a-uuid').expect(400);
    await http().post(`${API}/places/${target.id}/reviews`).send(review()).expect(401);
  });

  it('only the author or an admin can edit or delete; the rating follows', async () => {
    const target = await place('cheonggyecheon-stream');
    const author = await registerUser(app);
    const stranger = await registerUser(app);

    const { body: created } = await http()
      .post(`${API}/places/${target.id}/reviews`)
      .set(bearer(author.token))
      .send(review({ rating: 2 }))
      .expect(201);

    const forbidden = await http()
      .patch(`${API}/reviews/${created.id}`)
      .set(bearer(stranger.token))
      .send({ rating: 1 })
      .expect(403);
    expect(forbidden.body.error.code).toBe('FORBIDDEN');
    await http().delete(`${API}/reviews/${created.id}`).set(bearer(stranger.token)).expect(403);

    const edited = await http()
      .patch(`${API}/reviews/${created.id}`)
      .set(bearer(author.token))
      .send({ rating: 4 })
      .expect(200);
    expect(edited.body).toMatchObject({ rating: 4, title: 'Worth it' });
    expect((await place('cheonggyecheon-stream')).ratingAvg).toBe(4);

    // An admin can moderate.
    await http()
      .patch(`${API}/reviews/${created.id}`)
      .set(bearer(adminToken))
      .send({ comment: 'Edited by a moderator.' })
      .expect(200);

    await http().delete(`${API}/reviews/${created.id}`).set(bearer(author.token)).expect(204);
    const after = await place('cheonggyecheon-stream');
    expect([after.ratingAvg, after.ratingCount]).toEqual([0, 0]);
    await http().delete(`${API}/reviews/${created.id}`).set(bearer(author.token)).expect(404);
  });

  it('keeps the rating consistent under concurrent reviews (row lock)', async () => {
    const target = await place('seoul-forest');
    const users = await Promise.all([1, 2, 3, 4, 5].map(() => registerUser(app)));

    await Promise.all(
      users.map((u, i) =>
        http()
          .post(`${API}/places/${target.id}/reviews`)
          .set(bearer(u.token))
          .send(review({ rating: i + 1 }))
          .expect(201),
      ),
    );

    const after = await place('seoul-forest');
    expect([after.ratingAvg, after.ratingCount]).toEqual([3, 5]);
  });

  it('lists a place reviews (all languages, newest first) and my reviews', async () => {
    const res = await http().get(`${API}/places/gyeongbokgung-palace/reviews?limit=10`).expect(200);
    const reviews = res.body.data as { locale: string; createdAt: string }[];

    expect(res.body.meta.total).toBe(4);
    expect(new Set(reviews.map((r) => r.locale))).toEqual(new Set(['en', 'pt-BR']));
    const dates = reviews.map((r) => r.createdAt);
    expect(dates).toEqual([...dates].sort().reverse());

    const ana = await loginAs(app, 'user');
    const mine = await http()
      .get(`${API}/users/me/reviews?locale=pt-BR&limit=50`)
      .set(bearer(ana))
      .expect(200);
    const palace = (mine.body.data as { place: { slug: string; name: string } }[]).find(
      (r) => r.place.slug === 'gyeongbokgung-palace',
    );
    expect(palace?.place.name).toBe('Palácio Gyeongbokgung');
    await http().get(`${API}/users/me/reviews`).expect(401);
  });
});
