import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './helpers';

// setup-env.ts disables the limits for the other suites; this one restores a tiny auth limit.
// The config factories read process.env when the app is created, i.e. after this line runs.
process.env.THROTTLE_AUTH_LIMIT = '3';

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
});
