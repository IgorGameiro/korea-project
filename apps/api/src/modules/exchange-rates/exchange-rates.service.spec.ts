import { ServiceUnavailableException } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { Prisma } from '../../generated/prisma/client';
import type { ExchangeRatesRepository } from './exchange-rates.repository';
import { ExchangeRatesService } from './exchange-rates.service';

const updatedAt = new Date('2026-10-01T00:00:00Z');
const row = (target: string, rate: string) => ({
  id: target,
  base: 'KRW',
  target,
  rate: new Prisma.Decimal(rate),
  source: 'env',
  createdAt: updatedAt,
  updatedAt,
});

function setup(rows = [row('BRL', '0.0039'), row('USD', '0.00072'), row('EUR', '0.00066')]) {
  const store = new Map<string, unknown>();
  const cache = {
    get: jest.fn((key: string) => Promise.resolve(store.get(key))),
    set: jest.fn((key: string, value: unknown) => Promise.resolve(store.set(key, value))),
    del: jest.fn((key: string) => Promise.resolve(store.delete(key))),
  } as unknown as Cache;
  const repository = {
    findByBase: jest.fn().mockResolvedValue(rows),
    upsert: jest.fn((base: string, target: string, rate: number, source: string) =>
      Promise.resolve({ ...row(target, String(rate)), source }),
    ),
  };
  const service = new ExchangeRatesService(repository as unknown as ExchangeRatesRepository, cache);
  return { service, repository };
}

describe('ExchangeRatesService', () => {
  it('returns display currencies only, as numbers with updatedAt', async () => {
    const { service } = setup();

    await expect(service.findAll()).resolves.toEqual([
      { currency: 'BRL', rate: 0.0039, source: 'env', updatedAt },
      { currency: 'USD', rate: 0.00072, source: 'env', updatedAt },
    ]);
  });

  it('caches the table read', async () => {
    const { service, repository } = setup();

    await service.findAll();
    await service.getRate('USD');

    expect(repository.findByBase).toHaveBeenCalledTimes(1);
  });

  it('fails with 503 when a currency has no rate', async () => {
    const { service } = setup([row('BRL', '0.0039')]);

    await expect(service.getRate('USD')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('never returns a zero, negative or non-finite rate: it is reported as unavailable', async () => {
    const { service } = setup([row('BRL', '0'), row('USD', '-1')]);

    await expect(service.findAll()).resolves.toEqual([]);
    await expect(service.getRate('BRL')).rejects.toMatchObject({
      response: { code: 'EXCHANGE_RATE_UNAVAILABLE' },
    });
  });

  it('upsert writes by base+target and invalidates the cached rates', async () => {
    const { service, repository } = setup();
    await service.findAll(); // warm the cache

    const saved = await service.upsert('USD', 0.0008);

    expect(repository.upsert).toHaveBeenCalledWith('KRW', 'USD', 0.0008, 'admin');
    expect(saved).toMatchObject({ currency: 'USD', rate: 0.0008, source: 'admin' });
    await service.findAll();
    expect(repository.findByBase).toHaveBeenCalledTimes(2); // re-read after invalidation
  });

  it('converts KRW rounding to cents', () => {
    expect(ExchangeRatesService.convert(1_000_000, 0.00072)).toBe(720);
    expect(ExchangeRatesService.convert(12_345, 0.0039)).toBe(48.15);
  });
});
