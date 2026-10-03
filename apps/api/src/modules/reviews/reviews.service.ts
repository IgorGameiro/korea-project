import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Locale, Paginated } from '@korea-project/shared';
import { paginate } from '../../common/dto';
import type { AuthUser } from '../../common/types/auth-user';
import { Prisma } from '../../generated/prisma/client';
import { PlacesService } from '../places/places.service';
import { UsersService } from '../users/users.service';
import type { CreateReviewDto, MyReviewDto, ReviewDto, UpdateReviewDto } from './dto/review.dto';
import { type ReviewWrite, ReviewsRepository } from './reviews.repository';

type ReviewRow = NonNullable<Awaited<ReturnType<ReviewsRepository['findById']>>>;

const reviewNotFound = () =>
  new NotFoundException({ code: 'REVIEW_NOT_FOUND', message: 'Review not found' });
const reviewExists = () =>
  new ConflictException({
    code: 'REVIEW_ALREADY_EXISTS',
    message: 'You have already reviewed this place; edit your review instead',
  });

/** "2026-04-12" -> Date at UTC midnight, rejecting days after today (Korea is UTC+9, so allow +1). */
function parseVisitedAt(value: string | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  const latest = new Date();
  latest.setUTCHours(0, 0, 0, 0);
  latest.setUTCDate(latest.getUTCDate() + 1);
  if (Number.isNaN(date.getTime()) || date > latest) {
    throw new BadRequestException({
      code: 'VISITED_AT_IN_FUTURE',
      message: 'visitedAt cannot be in the future',
    });
  }
  return date;
}

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly repository: ReviewsRepository,
    private readonly places: PlacesService,
    private readonly users: UsersService,
  ) {}

  // ----- Reads -----

  async listByPlaceSlug(
    slug: string,
    query: { page: number; limit: number; skip: number },
  ): Promise<Paginated<ReviewDto>> {
    const placeId = await this.places.getIdBySlug(slug);
    const { rows, total } = await this.repository.listByPlace(placeId, {
      skip: query.skip,
      take: query.limit,
    });
    return paginate(await this.withAuthors(rows), total, query);
  }

  /** Newest reviews of a place, for the place page. */
  async recentForPlace(placeId: string, limit = 5): Promise<ReviewDto[]> {
    const { rows } = await this.repository.listByPlace(placeId, { skip: 0, take: limit });
    return this.withAuthors(rows);
  }

  async listMine(
    userId: string,
    query: { page: number; limit: number; skip: number },
    locale: Locale,
  ): Promise<Paginated<MyReviewDto>> {
    const { rows, total } = await this.repository.listByUser(userId, {
      skip: query.skip,
      take: query.limit,
    });
    const [reviews, places] = await Promise.all([
      this.withAuthors(rows),
      this.places.findSummariesByIds([...new Set(rows.map((r) => r.placeId))], locale),
    ]);
    const placeById = new Map(places.map((p) => [p.id, { id: p.id, slug: p.slug, name: p.name }]));
    return paginate(
      reviews.flatMap((review) => {
        const place = placeById.get(review.placeId);
        return place ? [{ ...review, place }] : [];
      }),
      total,
      query,
    );
  }

  // ----- Writes (each one recomputes the place rating in the same transaction) -----

  async create(
    user: AuthUser,
    placeId: string,
    dto: CreateReviewDto,
    requestLocale: Locale,
  ): Promise<ReviewDto> {
    const data: ReviewWrite = {
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      locale: dto.locale ?? requestLocale,
      visitedAt: parseVisitedAt(dto.visitedAt) ?? null,
    };
    try {
      const review = await this.repository.transaction(async (tx) => {
        await this.places.lockForRatingUpdate(tx, placeId);
        if (await this.repository.findByUserAndPlace(tx, user.id, placeId)) throw reviewExists();
        const created = await this.repository.create(tx, { ...data, userId: user.id, placeId });
        await this.recomputeRating(tx, placeId);
        return created;
      });
      return (await this.withAuthors([review]))[0];
    } catch (error) {
      // Two simultaneous first reviews by the same user: the unique index catches the second.
      if (isUniqueViolation(error)) throw reviewExists();
      throw error;
    }
  }

  async update(user: AuthUser, reviewId: string, dto: UpdateReviewDto): Promise<ReviewDto> {
    const current = await this.authorizedReview(user, reviewId);
    const data: Partial<ReviewWrite> = {
      rating: dto.rating,
      title: dto.title,
      comment: dto.comment,
      locale: dto.locale,
      visitedAt: parseVisitedAt(dto.visitedAt),
    };
    const review = await this.repository.transaction(async (tx) => {
      await this.places.lockForRatingUpdate(tx, current.placeId);
      const updated = await this.repository.update(tx, reviewId, data);
      await this.recomputeRating(tx, current.placeId);
      return updated;
    });
    return (await this.withAuthors([review]))[0];
  }

  async delete(user: AuthUser, reviewId: string): Promise<void> {
    const current = await this.authorizedReview(user, reviewId);
    await this.repository.transaction(async (tx) => {
      await this.places.lockForRatingUpdate(tx, current.placeId);
      await this.repository.delete(tx, reviewId);
      await this.recomputeRating(tx, current.placeId);
    });
  }

  // -------------------------------------------------------------------------

  /** Only the author or an ADMIN may change a review. */
  private async authorizedReview(user: AuthUser, reviewId: string): Promise<ReviewRow> {
    const review = await this.repository.findById(reviewId);
    if (!review) throw reviewNotFound();
    if (review.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only the author or an admin can change this review',
      });
    }
    return review;
  }

  private async recomputeRating(tx: Prisma.TransactionClient, placeId: string): Promise<void> {
    const { ratingAvg, ratingCount } = await this.repository.ratingOf(tx, placeId);
    await this.places.setRating(tx, placeId, ratingAvg, ratingCount);
  }

  private async withAuthors(rows: ReviewRow[]): Promise<ReviewDto[]> {
    const authors = await this.users.findPublicProfiles(rows.map((r) => r.userId));
    return rows.map((row) => ({
      id: row.id,
      placeId: row.placeId,
      rating: row.rating,
      title: row.title,
      comment: row.comment,
      locale: row.locale as Locale,
      visitedAt: row.visitedAt ? row.visitedAt.toISOString().slice(0, 10) : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: authors.get(row.userId) ?? { id: row.userId, name: 'Deleted user' },
    }));
  }
}
