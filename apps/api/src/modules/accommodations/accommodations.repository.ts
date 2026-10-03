import { Injectable } from '@nestjs/common';
import type { AccommodationType, CostTier } from '@korea-project/shared';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AccommodationSort } from './dto/accommodation.dto';

export type AccommodationBase = Omit<Prisma.AccommodationUncheckedCreateInput, 'id'>;

const ORDER_BY: Record<AccommodationSort, Prisma.AccommodationOrderByWithRelationInput[]> = {
  price: [{ pricePerNightKRW: 'asc' }, { slug: 'asc' }],
  '-price': [{ pricePerNightKRW: 'desc' }, { slug: 'asc' }],
};

@Injectable()
export class AccommodationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    filter: { cityId?: string; tier?: CostTier; type?: AccommodationType; districtId?: string },
    sort: AccommodationSort,
    page: { skip: number; take: number },
  ) {
    const where: Prisma.AccommodationWhereInput = {};
    if (filter.cityId) where.cityId = filter.cityId;
    if (filter.tier) where.tier = filter.tier;
    if (filter.type) where.type = filter.type;
    if (filter.districtId) where.districtId = filter.districtId;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.accommodation.findMany({
        where,
        orderBy: ORDER_BY[sort],
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.accommodation.count({ where }),
    ]);
    return { rows, total };
  }

  findById(id: string) {
    return this.prisma.accommodation.findUnique({ where: { id } });
  }

  create(data: AccommodationBase) {
    return this.prisma.accommodation.create({ data });
  }

  /** Missing id -> P2025 (404). */
  update(id: string, data: Partial<AccommodationBase>) {
    return this.prisma.accommodation.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.accommodation.delete({ where: { id } });
  }
}
