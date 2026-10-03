import { NotFoundException } from '@nestjs/common';
import type { CitiesService } from '../cities/cities.service';
import type { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import type { CostEstimatesRepository } from './cost-estimates.repository';
import { CostEstimatesService } from './cost-estimates.service';

const updatedAt = new Date('2026-10-01T00:00:00Z');
const estimate = {
  id: 'e1',
  cityId: 'c1',
  tier: 'MID' as const,
  lodgingPerRoomPerNightKRW: 180_000,
  foodPerPersonPerDayKRW: 70_000,
  transportPerPersonPerDayKRW: 15_000,
  activitiesPerPersonPerDayKRW: 40_000,
  createdAt: updatedAt,
  updatedAt,
};

function setup(found = true) {
  const repository = { findByCityAndTier: jest.fn().mockResolvedValue(found ? estimate : null) };
  const cities = {
    findBySlug: jest
      .fn()
      .mockResolvedValue({ id: 'c1', slug: 'seoul', name: 'Seoul', locale: 'en' }),
  };
  const rates = {
    getRate: jest.fn((currency: string) =>
      Promise.resolve({
        currency,
        rate: currency === 'USD' ? 0.00072 : 0.0039,
        source: 'env',
        updatedAt,
      }),
    ),
  };
  const service = new CostEstimatesService(
    repository as unknown as CostEstimatesRepository,
    cities as unknown as CitiesService,
    rates as unknown as ExchangeRatesService,
  );
  return { service, rates };
}

describe('CostEstimatesService.calculate', () => {
  const input = { citySlug: 'seoul', people: 3, days: 4, tier: 'MID' as const };

  it('computes the spec formula and converts every amount', async () => {
    const { service } = setup();

    const result = await service.calculate({ ...input, currency: 'BRL' }, 'en');

    // 3 people -> 2 rooms; 4 days -> 3 nights.
    expect([result.rooms, result.nights]).toEqual([2, 3]);
    expect(result.breakdown.lodging).toEqual({ krw: 1_080_000, amount: 4212 });
    expect(result.breakdown.food).toEqual({ krw: 840_000, amount: 3276 });
    expect(result.total.krw).toBe(1_080_000 + 840_000 + 180_000 + 480_000);
    expect(result.perDay.krw).toBe(Math.round(result.total.krw / 4));
    expect(result.perPerson.krw).toBe(Math.round(result.total.krw / 3));
    expect(result.exchangeRate).toEqual({ base: 'KRW', currency: 'BRL', rate: 0.0039, updatedAt });
  });

  it('defaults the currency from the locale (en -> USD, pt-BR -> BRL)', async () => {
    const { service, rates } = setup();

    expect((await service.calculate(input, 'en')).currency).toBe('USD');
    expect((await service.calculate(input, 'pt-BR')).currency).toBe('BRL');
    expect(rates.getRate).toHaveBeenNthCalledWith(1, 'USD');
  });

  it('404s when the city has no estimate for the tier', async () => {
    const { service } = setup(false);

    await expect(service.calculate(input, 'en')).rejects.toBeInstanceOf(NotFoundException);
  });
});
