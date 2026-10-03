import { Injectable } from '@nestjs/common';
import type { Locale } from '@korea-project/shared';
import { translationsFor, type TranslationPlan } from '../../common/i18n';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CityTextDto } from './dto/city-input.dto';

export type CityBase = Omit<Prisma.CityUncheckedCreateInput, 'id' | 'translations'>;

@Injectable()
export class CitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listLocalized(
    filter: { featured?: boolean },
    page: { skip: number; take: number },
    locale: Locale,
  ) {
    const where: Prisma.CityWhereInput =
      filter.featured === undefined ? {} : { isFeatured: filter.featured };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.city.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
        skip: page.skip,
        take: page.take,
        include: { translations: translationsFor(locale) },
      }),
      this.prisma.city.count({ where }),
    ]);
    return { rows, total };
  }

  findBySlugLocalized(slug: string, locale: Locale) {
    return this.prisma.city.findUnique({
      where: { slug },
      include: { translations: translationsFor(locale) },
    });
  }

  findIdBySlug(slug: string) {
    return this.prisma.city.findUnique({ where: { slug }, select: { id: true } });
  }

  existsById(id: string) {
    return this.prisma.city.count({ where: { id } }).then((count) => count > 0);
  }

  async listAdmin(page: { skip: number; take: number }) {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.city.findMany({
        orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
        skip: page.skip,
        take: page.take,
        include: { translations: true },
      }),
      this.prisma.city.count(),
    ]);
    return { rows, total };
  }

  findByIdAdmin(id: string) {
    return this.prisma.city.findUnique({ where: { id }, include: { translations: true } });
  }

  create(base: CityBase, translations: { locale: Locale; text: CityTextDto }[]) {
    return this.prisma.city.create({
      data: {
        ...base,
        translations: { create: translations.map(({ locale, text }) => ({ locale, ...text })) },
      },
      include: { translations: true },
    });
  }

  /** Base fields and translation changes in one transaction. Missing id -> P2025 (404). */
  update(id: string, base: Partial<CityBase>, plan: TranslationPlan<CityTextDto>) {
    return this.prisma.$transaction(async (tx) => {
      await tx.city.update({ where: { id }, data: base });
      for (const { locale, create, update } of plan.upserts) {
        await tx.cityTranslation.upsert({
          where: { cityId_locale: { cityId: id, locale } },
          create: { ...create, cityId: id, locale },
          update,
        });
      }
      if (plan.deletes.length > 0) {
        await tx.cityTranslation.deleteMany({
          where: { cityId: id, locale: { in: plan.deletes } },
        });
      }
      return tx.city.findUniqueOrThrow({ where: { id }, include: { translations: true } });
    });
  }

  /** Fails with P2003 (409) while the city still has districts, places, accommodations or costs. */
  delete(id: string) {
    return this.prisma.city.delete({ where: { id } });
  }
}
