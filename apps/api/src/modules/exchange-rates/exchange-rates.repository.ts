import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExchangeRatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByBase(base: string) {
    return this.prisma.exchangeRate.findMany({ where: { base }, orderBy: { target: 'asc' } });
  }

  /** Creates or replaces the rate identified by (base, target). */
  upsert(base: string, target: string, rate: number, source: string) {
    const data = { rate: String(rate), source };
    return this.prisma.exchangeRate.upsert({
      where: { base_target: { base, target } },
      create: { ...data, base, target },
      update: data,
    });
  }
}
