import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FavoritesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Idempotent: favoriting twice is a no-op. */
  add(userId: string, placeId: string) {
    return this.prisma.favorite.upsert({
      where: { userId_placeId: { userId, placeId } },
      create: { userId, placeId },
      update: {},
    });
  }

  /** Idempotent: removing a missing favorite is a no-op. */
  remove(userId: string, placeId: string) {
    return this.prisma.favorite.deleteMany({ where: { userId, placeId } });
  }

  exists(userId: string, placeId: string) {
    return this.prisma.favorite.count({ where: { userId, placeId } }).then((count) => count > 0);
  }

  async listPlaceIds(userId: string, page: { skip: number; take: number }) {
    const where = { userId };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.favorite.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { placeId: 'asc' }],
        skip: page.skip,
        take: page.take,
        select: { placeId: true },
      }),
      this.prisma.favorite.count({ where }),
    ]);
    return { placeIds: rows.map((r) => r.placeId), total };
  }

  /** Every favorite place id of a user (capped: enough for any real user, bounded for the DB). */
  async allPlaceIds(userId: string, max: number): Promise<string[]> {
    const rows = await this.prisma.favorite.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { placeId: 'asc' }],
      take: max,
      select: { placeId: true },
    });
    return rows.map((r) => r.placeId);
  }
}
