import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ReviewWrite {
  rating: number;
  title: string;
  comment: string;
  locale: string;
  visitedAt: Date | null;
}

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Runs `work` in one transaction (review write + rating recompute must commit together). */
  transaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(work);
  }

  findById(id: string) {
    return this.prisma.review.findUnique({ where: { id } });
  }

  findByUserAndPlace(tx: Prisma.TransactionClient, userId: string, placeId: string) {
    return tx.review.findUnique({
      where: { userId_placeId: { userId, placeId } },
      select: { id: true },
    });
  }

  async listByPlace(placeId: string, page: { skip: number; take: number }) {
    const where = { placeId };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { rows, total };
  }

  async listByUser(userId: string, page: { skip: number; take: number }) {
    const where = { userId };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: page.skip,
        take: page.take,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { rows, total };
  }

  create(tx: Prisma.TransactionClient, data: ReviewWrite & { userId: string; placeId: string }) {
    return tx.review.create({ data });
  }

  update(tx: Prisma.TransactionClient, id: string, data: Partial<ReviewWrite>) {
    return tx.review.update({ where: { id }, data });
  }

  delete(tx: Prisma.TransactionClient, id: string) {
    return tx.review.delete({ where: { id } });
  }

  /** Average (rounded to 2 decimals) and count of a place's reviews, read inside `tx`. */
  async ratingOf(tx: Prisma.TransactionClient, placeId: string) {
    const { _avg, _count } = await tx.review.aggregate({
      where: { placeId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    return {
      ratingAvg: Math.round((_avg.rating ?? 0) * 100) / 100,
      ratingCount: _count._all,
    };
  }
}
