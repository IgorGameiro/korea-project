import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './helpers';

// Behind the web app's proxy (TRUST_PROXY=1) each visitor must get its own rate-limit bucket.
process.env.TRUST_PROXY = '1';
process.env.THROTTLE_SEARCH_LIMIT = '2';

describe('Trusted proxy (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('limits each forwarded client separately', async () => {
    const search = (ip: string) =>
      request(app.getHttpServer()).get('/api/v1/search?q=palace').set('X-Forwarded-For', ip);

    await search('203.0.113.1').expect(200);
    await search('203.0.113.1').expect(200);
    await search('203.0.113.1').expect(429);

    // Another visitor through the same proxy is not affected.
    await search('203.0.113.2').expect(200);
  });
});
