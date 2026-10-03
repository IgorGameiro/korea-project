import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, loginAs } from './helpers';

const API = '/api/v1';

type Rate = { currency: string; rate: number; source: string; updatedAt: string };
const rateOf = (res: request.Response, currency: string) =>
  (res.body as { rates: Rate[] }).rates.find((r) => r.currency === currency);

describe('Admin exchange rates (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let userToken: string;
  let original: { target: string; rate: string; source: string }[];
  const http = () => request(app.getHttpServer());
  const put = (currency: string, body: unknown, token = adminToken) =>
    http()
      .put(`${API}/admin/exchange-rates/${currency}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body as object);

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    adminToken = await loginAs(app, 'admin');
    userToken = await loginAs(app, 'user');
    original = (await prisma.exchangeRate.findMany({ where: { base: 'KRW' } })).map((r) => ({
      target: r.target,
      rate: r.rate.toString(),
      source: r.source,
    }));
  });

  afterAll(async () => {
    // Other suites (cost calculator) expect the seeded rates.
    for (const { target, rate, source } of original) {
      await prisma.exchangeRate.upsert({
        where: { base_target: { base: 'KRW', target } },
        create: { base: 'KRW', target, rate, source },
        update: { rate, source },
      });
    }
    await app.close();
  });

  it('401 without a token, 403 for a USER', async () => {
    await http().put(`${API}/admin/exchange-rates/USD`).send({ rate: 0.001 }).expect(401);
    const res = await put('USD', { rate: 0.001 }, userToken).expect(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('ADMIN updates a rate; the public endpoint and the calculator see it at once (cache invalidated)', async () => {
    // Warm both caches with the current value first.
    await http().get(`${API}/exchange-rates`).expect(200);

    const res = await put('usd', { rate: 0.0008 }).expect(200);
    expect(res.body).toMatchObject({ currency: 'USD', rate: 0.0008, source: 'admin' });

    const rates = await http().get(`${API}/exchange-rates`).expect(200);
    expect(rateOf(rates, 'USD')).toMatchObject({ rate: 0.0008, source: 'admin' });

    const trip = await http()
      .post(`${API}/cost-estimates/calculate`)
      .send({ citySlug: 'seoul', people: 1, days: 1, tier: 'BUDGET', currency: 'USD' })
      .expect(200);
    expect(trip.body.exchangeRate.rate).toBe(0.0008);
    expect(trip.body.total.amount).toBe(Math.round(trip.body.total.krw * 0.0008 * 100) / 100);
  });

  it('a missing rate is a clear 503 (never 0 or NaN); PUT creates it again (upsert)', async () => {
    await prisma.exchangeRate.delete({ where: { base_target: { base: 'KRW', target: 'BRL' } } });
    await put('USD', { rate: 0.00072 }).expect(200); // any write drops the cache

    const missing = await http()
      .post(`${API}/cost-estimates/calculate`)
      .send({ citySlug: 'seoul', people: 2, days: 3, tier: 'MID', currency: 'BRL' })
      .expect(503);
    expect(missing.body.error).toEqual({
      code: 'EXCHANGE_RATE_UNAVAILABLE',
      message: 'No exchange rate configured for KRW -> BRL',
    });
    expect(rateOf(await http().get(`${API}/exchange-rates`).expect(200), 'BRL')).toBeUndefined();

    await put('BRL', { rate: 0.0039 }).expect(200);
    const back = await http()
      .post(`${API}/cost-estimates/calculate`)
      .send({ citySlug: 'seoul', people: 2, days: 3, tier: 'MID', currency: 'BRL' })
      .expect(200);
    expect(back.body.exchangeRate.rate).toBe(0.0039);
  });

  it.each([
    ['USD', { rate: 0 }],
    ['USD', { rate: -0.001 }],
    ['USD', { rate: 'abc' }],
    ['USD', { rate: 0.000000001 }],
    ['USD', { rate: 0.123456789 }],
    ['USD', {}],
    ['USD', { rate: 0.001, source: 'hack' }],
    ['EUR', { rate: 0.001 }],
    ['KRW', { rate: 1 }],
  ])('rejects %s %p with 400', async (currency, body) => {
    const res = await put(currency, body).expect(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
