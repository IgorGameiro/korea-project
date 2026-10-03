import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createTestApp } from './helpers';

describe('Locale resolution and exchange rates (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (path: string) => request(app.getHttpServer()).get(path);

  describe('Content-Language / Vary', () => {
    it('defaults to en and varies on Accept-Language when no ?locale is given', async () => {
      const res = await get('/api/v1/exchange-rates').expect(200);

      expect(res.headers['content-language']).toBe('en');
      expect(res.headers.vary).toMatch(/Accept-Language/i);
    });

    it('honors Accept-Language', async () => {
      const res = await get('/api/v1/exchange-rates')
        .set('Accept-Language', 'pt-BR,pt;q=0.9,en;q=0.8')
        .expect(200);

      expect(res.headers['content-language']).toBe('pt-BR');
      expect(res.headers.vary).toMatch(/Accept-Language/i);
    });

    it('?locale wins over the header and does not vary on it', async () => {
      const res = await get('/api/v1/exchange-rates?locale=pt-BR')
        .set('Accept-Language', 'en')
        .expect(200);

      expect(res.headers['content-language']).toBe('pt-BR');
      expect(res.headers.vary ?? '').not.toMatch(/Accept-Language/i);
    });

    it('an unsupported ?locale falls back to en (never 400)', async () => {
      const res = await get('/api/v1/exchange-rates?locale=xx-YY')
        .set('Accept-Language', 'pt-BR')
        .expect(200);

      expect(res.headers['content-language']).toBe('en');
    });
  });

  describe('GET /api/v1/exchange-rates', () => {
    it('returns KRW rates for USD and BRL with updatedAt', async () => {
      const res = await get('/api/v1/exchange-rates').expect(200);

      expect(res.body).toEqual({
        base: 'KRW',
        rates: expect.arrayContaining([
          expect.objectContaining({ currency: 'USD', rate: expect.any(Number) }),
          expect.objectContaining({ currency: 'BRL', rate: expect.any(Number) }),
        ]),
      });
      for (const rate of res.body.rates as { rate: number; updatedAt: string }[]) {
        expect(rate.rate).toBeGreaterThan(0);
        expect(Number.isNaN(Date.parse(rate.updatedAt))).toBe(false);
      }
    });
  });
});
