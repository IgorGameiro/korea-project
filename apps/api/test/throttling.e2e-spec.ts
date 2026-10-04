import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './helpers';

// setup-env.ts disables the limits for the other suites; this one restores a tiny auth limit.
// The config factories read process.env when the app is created, i.e. after this line runs.
process.env.THROTTLE_AUTH_LIMIT = '3';
process.env.THROTTLE_SEARCH_LIMIT = '3';
const INTERNAL_TOKEN = 'e2e-internal-token-0123456789abcdef';
process.env.INTERNAL_API_TOKEN = INTERNAL_TOKEN;

describe('Rate limiting (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('applies the stricter auth limit to /auth/* only', async () => {
    const login = () =>
      request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'wrong-password' });

    for (let i = 0; i < 3; i++) await login().expect(401);

    const limited = await login().expect(429);
    expect(limited.body.error.code).toBe('TOO_MANY_REQUESTS');

    // Other routes keep the (much higher) default limit.
    await request(app.getHttpServer()).get('/api/v1/exchange-rates').expect(200);
  });

  it('applies the search limit to /search only', async () => {
    const search = () => request(app.getHttpServer()).get('/api/v1/search?q=palace');

    for (let i = 0; i < 3; i++) await search().expect(200);

    const limited = await search().expect(429);
    expect(limited.body.error.code).toBe('TOO_MANY_REQUESTS');
    await request(app.getHttpServer()).get('/api/v1/cities/seoul/places?search=palace').expect(200);
  });

  it('ignores X-Forwarded-For when no proxy is trusted (it cannot dodge the limit)', async () => {
    const login = (ip: string) =>
      request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .set('X-Forwarded-For', ip)
        .send({ email: 'nobody@example.com', password: 'wrong-password' });
    // The auth bucket of this socket is already exhausted by the first test.
    await login('198.51.100.7').expect(429);
    await login('198.51.100.8').expect(429);
  });

  it('does not limit the web server (internal token), and only with the exact token', async () => {
    // The auth bucket of this socket is exhausted by the tests above.
    const login = () =>
      request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@example.com', password: 'wrong-password' });

    await login().set('X-Internal-Token', INTERNAL_TOKEN).expect(401);
    await login().set('X-Internal-Token', INTERNAL_TOKEN).expect(401);
    await login().set('X-Internal-Token', 'e2e-internal-token-0123456789abcdeX').expect(429);
    await login().expect(429);
  });
});
