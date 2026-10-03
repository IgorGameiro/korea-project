import { Injectable } from '@nestjs/common';
import type { CostTier } from '@korea-project/shared';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type CostEstimateData = Omit<Prisma.CostEstimateUncheckedCreateInput, 'id'>;
export type CostEstimateRow = NonNullable<Awaited<ReturnType<CostEstimatesRepository['findById']>>>;

@Injectable()
export class CostEstimatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCityAndTier(cityId: string, tier: CostTier) {
    return this.prisma.costEstimate.findUnique({ where: { cityId_tier: { cityId, tier } } });
  }

  findById(id: string) {
    return this.prisma.costEstimate.findUnique({ where: { id } });
  }

  async list(filter: { cityId?: string }, page: { skip: number; take: number }) {
    const where: Prisma.CostEstimateWhereInput = filter.cityId ? { cityId: filter.cityId } : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.costEstimate.findMany({
        where,
        orderBy: [{ cityId: 'asc' }, { tier: 'asc' }],
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.costEstimate.count({ where }),
    ]);
    return { rows, total };
  }

  /** Duplicate (city, tier) -> P2002 (409). */
  create(data: CostEstimateData) {
    return this.prisma.costEstimate.create({ data });
  }

  /** Missing id -> P2025 (404). */
  update(id: string, data: Partial<CostEstimateData>) {
    return this.prisma.costEstimate.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.costEstimate.delete({ where: { id } });
  }
}
