import { Injectable } from '@nestjs/common';
import type { Locale, PlaceCategory, TrailDifficulty } from '@korea-project/shared';
import { localesToLoad, translationsFor, type TranslationPlan } from '../../common/i18n';
import { escapeLike } from '../../common/validation';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { PlaceSort } from './dto/list-places.query';

export interface PlaceFilters {
  category?: PlaceCategory;
  districtId?: string;
  priceLevel?: number[];
  tags?: string[];
  difficulty?: TrailDifficulty;
  minRating?: number;
  search?: string;
}

/** Translation fields kept in the PlaceTranslation table. */
export interface PlaceTranslationFields {
  name: string;
  description: string;
  openingHoursNote: string | null;
}

export type PlaceBase = Omit<Prisma.PlaceUncheckedCreateInput, 'id' | 'translations'>;

const ORDER_BY: Record<PlaceSort, Prisma.PlaceOrderByWithRelationInput[]> = {
  rating: [{ ratingAvg: 'desc' }, { ratingCount: 'desc' }, { slug: 'asc' }],
  price: [{ priceLevel: 'asc' }, { averageSpendKRW: 'asc' }, { slug: 'asc' }],
};

function buildWhere(cityId: string, f: PlaceFilters, locale: Locale): Prisma.PlaceWhereInput {
  const where: Prisma.PlaceWhereInput = { cityId };
  if (f.category) where.category = f.category;
  if (f.districtId) where.districtId = f.districtId;
  if (f.priceLevel?.length) where.priceLevel = { in: f.priceLevel };
  if (f.tags?.length) where.tags = { hasEvery: f.tags };
  if (f.difficulty) where.difficulty = f.difficulty;
  if (f.minRating !== undefined) where.ratingAvg = { gte: f.minRating };

  if (f.search) {
    // Wildcards are escaped so "%" or "_" in the term are matched literally.
    const contains = { contains: escapeLike(f.search), mode: Prisma.QueryMode.insensitive };
    where.OR = [
      {
        translations: {
          some: {
            locale: { in: localesToLoad(locale) },
            OR: [{ name: contains }, { description: contains }],
          },
        },
      },
      { nameKo: contains },
      { tags: { has: f.search.toLowerCase() } },
    ];
  }
  return where;
}

const adminInclude = { translations: true } as const;

@Injectable()
export class PlacesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listLocalized(
    cityId: string,
    filters: PlaceFilters,
    sort: PlaceSort,
    page: { skip: number; take: number },
    locale: Locale,
  ) {
    const where = buildWhere(cityId, filters, locale);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.place.findMany({
        where,
        orderBy: ORDER_BY[sort],
        skip: page.skip,
        take: page.take,
        include: { translations: translationsFor(locale) },
      }),
      this.prisma.place.count({ where }),
    ]);
    return { rows, total };
  }

  findBySlugLocalized(slug: string, locale: Locale) {
    return this.prisma.place.findUnique({
      where: { slug },
      include: { translations: translationsFor(locale) },
    });
  }

  findIdBySlug(slug: string) {
    return this.prisma.place.findUnique({ where: { slug }, select: { id: true } });
  }

  existsById(id: string) {
    return this.prisma.place.count({ where: { id } }).then((n) => n > 0);
  }

  mapPoints(cityId: string, category: PlaceCategory | undefined, locale: Locale) {
    return this.prisma.place.findMany({
      where: { cityId, ...(category ? { category } : {}) },
      orderBy: { slug: 'asc' },
      select: {
        id: true,
        slug: true,
        category: true,
        latitude: true,
        longitude: true,
        translations: { ...translationsFor(locale), select: { locale: true, name: true } },
      },
    });
  }

  countByCategory(cityId: string) {
    return this.prisma.place.groupBy({
      by: ['category'],
      where: { cityId },
      _count: { _all: true },
    });
  }

  // ----- Admin -----

  async listAdmin(
    filter: { cityId?: string; category?: PlaceCategory },
    page: { skip: number; take: number },
  ) {
    const where: Prisma.PlaceWhereInput = {
      ...(filter.cityId ? { cityId: filter.cityId } : {}),
      ...(filter.category ? { category: filter.category } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.place.findMany({
        where,
        orderBy: [{ cityId: 'asc' }, { slug: 'asc' }],
        skip: page.skip,
        take: page.take,
        include: adminInclude,
      }),
      this.prisma.place.count({ where }),
    ]);
    return { rows, total };
  }

  findByIdAdmin(id: string) {
    return this.prisma.place.findUnique({ where: { id }, include: adminInclude });
  }

  create(base: PlaceBase, translations: { locale: Locale; text: PlaceTranslationFields }[]) {
    return this.prisma.place.create({
      data: {
        ...base,
        translations: { create: translations.map(({ locale, text }) => ({ locale, ...text })) },
      },
      include: adminInclude,
    });
  }

  update(id: string, base: Partial<PlaceBase>, plan: TranslationPlan<PlaceTranslationFields>) {
    return this.prisma.$transaction(async (tx) => {
      await tx.place.update({ where: { id }, data: base });
      for (const { locale, create, update } of plan.upserts) {
        await tx.placeTranslation.upsert({
          where: { placeId_locale: { placeId: id, locale } },
          create: { ...create, placeId: id, locale },
          update,
        });
      }
      if (plan.deletes.length > 0) {
        await tx.placeTranslation.deleteMany({
          where: { placeId: id, locale: { in: plan.deletes } },
        });
      }
      return tx.place.findUniqueOrThrow({ where: { id }, include: adminInclude });
    });
  }

  /** Fails with P2003 (409) while the place still has reviews; favorites are removed with it. */
  delete(id: string) {
    return this.prisma.place.delete({ where: { id }, select: { cityId: true } });
  }
}
