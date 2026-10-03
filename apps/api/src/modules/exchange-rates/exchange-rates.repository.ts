import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExchangeRatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByBase(base: string) {
    return this.prisma.exchangeRate.findMany({ where: { base }, orderBy: { target: 'asc' } });
  }
}
