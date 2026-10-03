import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { type Locale, LOCALES, type Paginated } from '@korea-project/shared';
import { paginate } from '../../common/dto';
import { pickTranslation, planTranslationChanges, translationsByLocale } from '../../common/i18n';
import { CitiesRepository, type CityBase } from './cities.repository';
import type { CityTextDto, CreateCityDto, UpdateCityDto } from './dto/city-input.dto';
import type { AdminCityDto, CityDto } from './dto/city.response';

const TEXT_FIELDS = ['name', 'description', 'bestTimeToVisit'] as const;

type CityRow = NonNullable<Awaited<ReturnType<CitiesRepository['findByIdAdmin']>>>;

export const cityNotFound = () =>
  new NotFoundException({ code: 'CITY_NOT_FOUND', message: 'City not found' });

function toCityDto(row: CityRow, locale: Locale): CityDto {
  const t = pickTranslation(row.translations, locale);
  if (!t) throw new InternalServerErrorException(`City ${row.slug} has no translations`);
  return {
    id: row.id,
    slug: row.slug,
    locale: t.locale as Locale,
    name: t.name,
    nameKo: row.nameKo,
    description: t.description,
    bestTimeToVisit: t.bestTimeToVisit,
    heroImageUrl: row.heroImageUrl,
    latitude: row.latitude,
    longitude: row.longitude,
    population: row.population,
    isFeatured: row.isFeatured,
  };
}

function toAdminCityDto(row: CityRow): AdminCityDto {
  return {
    id: row.id,
    slug: row.slug,
    nameKo: row.nameKo,
    heroImageUrl: row.heroImageUrl,
    latitude: row.latitude,
    longitude: row.longitude,
    population: row.population,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    translations: translationsByLocale(row.translations, TEXT_FIELDS),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class CitiesService {
  constructor(private readonly repository: CitiesRepository) {}

  // ----- Public -----

  async list(
    query: { featured?: boolean; page: number; limit: number; skip: number },
    locale: Locale,
  ): Promise<Paginated<CityDto>> {
    const { rows, total } = await this.repository.listLocalized(
      { featured: query.featured },
      { skip: query.skip, take: query.limit },
      locale,
    );
    return paginate(
      rows.map((row) => toCityDto(row, locale)),
      total,
      query,
    );
  }

  async findBySlug(slug: string, locale: Locale): Promise<CityDto> {
    const row = await this.repository.findBySlugLocalized(slug, locale);
    if (!row) throw cityNotFound();
    return toCityDto(row, locale);
  }

  /** Localized cities keyed by id (unknown ids are skipped). */
  async findManyByIds(ids: string[], locale: Locale): Promise<Map<string, CityDto>> {
    if (ids.length === 0) return new Map();
    const rows = await this.repository.findManyByIdsLocalized([...new Set(ids)], locale);
    return new Map(rows.map((row) => [row.id, toCityDto(row, locale)]));
  }

  async findById(id: string, locale: Locale): Promise<CityDto> {
    const row = await this.repository.findByIdLocalized(id, locale);
    if (!row) throw cityNotFound();
    return toCityDto(row, locale);
  }

  /** For other modules that address cities by slug in their routes. */
  async getIdBySlug(slug: string): Promise<string> {
    const row = await this.repository.findIdBySlug(slug);
    if (!row) throw cityNotFound();
    return row.id;
  }

  async assertExists(id: string): Promise<void> {
    if (!(await this.repository.existsById(id))) throw cityNotFound();
  }

  // ----- Admin -----

  async listAdmin(query: {
    page: number;
    limit: number;
    skip: number;
  }): Promise<Paginated<AdminCityDto>> {
    const { rows, total } = await this.repository.listAdmin({
      skip: query.skip,
      take: query.limit,
    });
    return paginate(rows.map(toAdminCityDto), total, query);
  }

  async findByIdAdmin(id: string): Promise<AdminCityDto> {
    const row = await this.repository.findByIdAdmin(id);
    if (!row) throw cityNotFound();
    return toAdminCityDto(row);
  }

  async create(dto: CreateCityDto): Promise<AdminCityDto> {
    const { translations, ...base } = dto;
    const rows = LOCALES.flatMap((locale) => {
      const text = translations[locale];
      return text ? [{ locale, text }] : [];
    });
    return toAdminCityDto(await this.repository.create(base satisfies CityBase, rows));
  }

  async update(id: string, dto: UpdateCityDto): Promise<AdminCityDto> {
    const { translations, ...base } = dto;
    const current = await this.repository.findByIdAdmin(id);
    if (!current) throw cityNotFound();

    const existing = new Map(
      current.translations.map((t) => [
        t.locale as Locale,
        { name: t.name, description: t.description, bestTimeToVisit: t.bestTimeToVisit },
      ]),
    );
    const plan = planTranslationChanges<CityTextDto>(existing, translations ?? {}, TEXT_FIELDS);
    return toAdminCityDto(await this.repository.update(id, base, plan));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
