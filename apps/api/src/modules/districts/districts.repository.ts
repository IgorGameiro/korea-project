import { Injectable } from '@nestjs/common';
import type { Locale } from '@korea-project/shared';
import { translationsFor, type TranslationPlan } from '../../common/i18n';
import type { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { DistrictTextDto } from './dto/district.dto';

export type DistrictBase = Omit<Prisma.DistrictUncheckedCreateInput, 'id' | 'translations'>;

@Injectable()
export class DistrictsRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByCityLocalized(cityId: string, locale: Locale) {
    return this.prisma.district.findMany({
      where: { cityId },
      orderBy: { slug: 'asc' },
      include: { translations: translationsFor(locale) },
    });
  }

  findInCity(cityId: string, id: string) {
    return this.prisma.district.findFirst({ where: { id, cityId }, select: { id: true } });
  }

  async listAdmin(filter: { cityId?: string }, page: { skip: number; take: number }) {
    const where: Prisma.DistrictWhereInput = filter.cityId ? { cityId: filter.cityId } : {};
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.district.findMany({
        where,
        orderBy: [{ cityId: 'asc' }, { slug: 'asc' }],
        skip: page.skip,
        take: page.take,
        include: { translations: true },
      }),
      this.prisma.district.count({ where }),
    ]);
    return { rows, total };
  }

  findByIdAdmin(id: string) {
    return this.prisma.district.findUnique({ where: { id }, include: { translations: true } });
  }

  create(base: DistrictBase, translations: { locale: Locale; text: DistrictTextDto }[]) {
    return this.prisma.district.create({
      data: {
        ...base,
        translations: { create: translations.map(({ locale, text }) => ({ locale, ...text })) },
      },
      include: { translations: true },
    });
  }

  update(id: string, base: Partial<DistrictBase>, plan: TranslationPlan<DistrictTextDto>) {
    return this.prisma.$transaction(async (tx) => {
      await tx.district.update({ where: { id }, data: base });
      for (const { locale, create, update } of plan.upserts) {
        await tx.districtTranslation.upsert({
          where: { districtId_locale: { districtId: id, locale } },
          create: { ...create, districtId: id, locale },
          update,
        });
      }
      if (plan.deletes.length > 0) {
        await tx.districtTranslation.deleteMany({
          where: { districtId: id, locale: { in: plan.deletes } },
        });
      }
      return tx.district.findUniqueOrThrow({ where: { id }, include: { translations: true } });
    });
  }

  /** Fails with P2003 (409) while places or accommodations still reference the district. */
  delete(id: string) {
    return this.prisma.district.delete({ where: { id } });
  }
}
