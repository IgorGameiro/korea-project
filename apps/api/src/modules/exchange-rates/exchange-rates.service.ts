import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DISPLAY_CURRENCIES, type DisplayCurrency } from '@korea-project/shared';
import type { Cache } from 'cache-manager';
import { ExchangeRatesRepository } from './exchange-rates.repository';

export const BASE_CURRENCY = 'KRW';
const CACHE_KEY = `exchange-rates:${BASE_CURRENCY}`;

export interface ExchangeRate {
  currency: DisplayCurrency;
  /** How many `currency` units one KRW buys. */
  rate: number;
  source: string;
  updatedAt: Date;
}

/**
 * Single source of exchange rates for the API. Reads the ExchangeRate table, which is filled by the
 * seed in development and by admins (PUT /admin/exchange-rates/:currency) in production.
 * Extension point: an external provider would call `upsert` from a scheduled job; nothing else changes.
 */
@Injectable()
export class ExchangeRatesService {
  constructor(
    private readonly repository: ExchangeRatesRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  async findAll(): Promise<ExchangeRate[]> {
    const cached = await this.cache.get<ExchangeRate[]>(CACHE_KEY);
    if (cached) return cached.map((r) => ({ ...r, updatedAt: new Date(r.updatedAt) }));

    const rows = await this.repository.findByBase(BASE_CURRENCY);
    const rates = rows
      .filter((row): row is typeof row & { target: DisplayCurrency } =>
        (DISPLAY_CURRENCIES as readonly string[]).includes(row.target),
      )
      .map((row) => ({
        currency: row.target,
        rate: row.rate.toNumber(),
        source: row.source,
        updatedAt: row.updatedAt,
      }))
      // Never hand out a rate that would turn prices into 0, negative numbers or NaN.
      .filter((rate) => Number.isFinite(rate.rate) && rate.rate > 0);

    await this.cache.set(CACHE_KEY, rates);
    return rates;
  }

  async getRate(currency: DisplayCurrency): Promise<ExchangeRate> {
    const rate = (await this.findAll()).find((r) => r.currency === currency);
    if (!rate) {
      throw new ServiceUnavailableException({
        code: 'EXCHANGE_RATE_UNAVAILABLE',
        message: `No exchange rate configured for ${BASE_CURRENCY} -> ${currency}`,
      });
    }
    return rate;
  }

  /** Sets the KRW -> currency rate and drops the cached rates, so readers see it immediately. */
  async upsert(currency: DisplayCurrency, rate: number, source = 'admin'): Promise<ExchangeRate> {
    const row = await this.repository.upsert(BASE_CURRENCY, currency, rate, source);
    await this.cache.del(CACHE_KEY);
    return { currency, rate: row.rate.toNumber(), source: row.source, updatedAt: row.updatedAt };
  }

  /** KRW amount in the target currency, rounded to cents. */
  static convert(amountKRW: number, rate: number): number {
    return Math.round(amountKRW * rate * 100) / 100;
  }
}
