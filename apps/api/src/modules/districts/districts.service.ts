import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { type Locale, LOCALES, type Paginated } from '@korea-project/shared';
import { paginate } from '../../common/dto';
import { pickTranslation, planTranslationChanges, translationsByLocale } from '../../common/i18n';
import { CitiesService } from '../cities/cities.service';
import { DistrictsRepository } from './districts.repository';
import type {
  AdminDistrictDto,
  CreateDistrictDto,
  DistrictDto,
  DistrictTextDto,
  UpdateDistrictDto,
} from './dto/district.dto';

const TEXT_FIELDS = ['name', 'description'] as const;

type DistrictRow = NonNullable<Awaited<ReturnType<DistrictsRepository['findByIdAdmin']>>>;

const districtNotFound = () =>
  new NotFoundException({ code: 'DISTRICT_NOT_FOUND', message: 'District not found' });

function toDistrictDto(row: DistrictRow, locale: Locale): DistrictDto {
  const t = pickTranslation(row.translations, locale);
  if (!t) throw new InternalServerErrorException(`District ${row.slug} has no translations`);
  return {
    id: row.id,
    slug: row.slug,
    locale: t.locale as Locale,
    name: t.name,
    nameKo: row.nameKo,
    description: t.description,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}

function toAdminDistrictDto(row: DistrictRow): AdminDistrictDto {
  return {
    id: row.id,
    cityId: row.cityId,
    slug: row.slug,
    nameKo: row.nameKo,
    latitude: row.latitude,
    longitude: row.longitude,
    translations: translationsByLocale(row.translations, TEXT_FIELDS),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class DistrictsService {
  constructor(
    private readonly repository: DistrictsRepository,
    private readonly cities: CitiesService,
  ) {}

  async listByCity(cityId: string, locale: Locale): Promise<DistrictDto[]> {
    const rows = await this.repository.listByCityLocalized(cityId, locale);
    return rows.map((row) => toDistrictDto(row, locale));
  }

  async findById(id: string, locale: Locale): Promise<DistrictDto> {
    const row = await this.repository.findByIdLocalized(id, locale);
    if (!row) throw districtNotFound();
    return toDistrictDto(row, locale);
  }

  /** For places/accommodations: a district must belong to the same city. */
  async assertInCity(cityId: string, districtId: string): Promise<void> {
    if (!(await this.repository.findInCity(cityId, districtId))) {
      throw new NotFoundException({
        code: 'DISTRICT_NOT_IN_CITY',
        message: 'District not found in this city',
      });
    }
  }

  // ----- Admin -----

  async listAdmin(query: {
    cityId?: string;
    page: number;
    limit: number;
    skip: number;
  }): Promise<Paginated<AdminDistrictDto>> {
    const { rows, total } = await this.repository.listAdmin(
      { cityId: query.cityId },
      { skip: query.skip, take: query.limit },
    );
    return paginate(rows.map(toAdminDistrictDto), total, query);
  }

  async findByIdAdmin(id: string): Promise<AdminDistrictDto> {
    const row = await this.repository.findByIdAdmin(id);
    if (!row) throw districtNotFound();
    return toAdminDistrictDto(row);
  }

  async create(dto: CreateDistrictDto): Promise<AdminDistrictDto> {
    const { translations, ...base } = dto;
    await this.cities.assertExists(base.cityId);
    const rows = LOCALES.flatMap((locale) => {
      const text = translations[locale];
      return text ? [{ locale, text }] : [];
    });
    return toAdminDistrictDto(await this.repository.create(base, rows));
  }

  async update(id: string, dto: UpdateDistrictDto): Promise<AdminDistrictDto> {
    const { translations, ...base } = dto;
    const current = await this.repository.findByIdAdmin(id);
    if (!current) throw districtNotFound();

    const existing = new Map(
      current.translations.map((t) => [
        t.locale as Locale,
        { name: t.name, description: t.description },
      ]),
    );
    const plan = planTranslationChanges<DistrictTextDto>(existing, translations ?? {}, TEXT_FIELDS);
    return toAdminDistrictDto(await this.repository.update(id, base, plan));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
