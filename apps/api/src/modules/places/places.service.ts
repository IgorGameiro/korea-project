import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  type Locale,
  LOCALES,
  type OpeningHours,
  type Paginated,
  PlaceCategory,
} from '@korea-project/shared';
import type { Cache } from 'cache-manager';
import { paginate } from '../../common/dto';
import { pickTranslation, planTranslationChanges, translationsByLocale } from '../../common/i18n';
import { Prisma } from '../../generated/prisma/client';
import { CitiesService } from '../cities/cities.service';
import { DistrictsService } from '../districts/districts.service';
import type { ListPlacesAdminQueryDto, ListPlacesQueryDto } from './dto/list-places.query';
import type { CreatePlaceDto, TrailDto, UpdatePlaceDto } from './dto/place-input.dto';
import type {
  AdminPlaceDto,
  MapPointDto,
  PlaceDetailDto,
  PlaceSummaryDto,
} from './dto/place.response';
import { type PlaceBase, PlacesRepository, type PlaceTranslationFields } from './places.repository';

const TEXT_FIELDS = ['name', 'description', 'openingHoursNote'] as const;
const REQUIRED_TEXT = ['name', 'description'] as const;
const CATEGORIES = Object.values(PlaceCategory);

type PlaceRow = NonNullable<Awaited<ReturnType<PlacesRepository['findByIdAdmin']>>>;

export const placeNotFound = () =>
  new NotFoundException({ code: 'PLACE_NOT_FOUND', message: 'Place not found' });

const mapCacheKey = (cityId: string, locale: Locale, category?: PlaceCategory) =>
  `places:map:${cityId}:${locale}:${category ?? 'all'}`;

function trailOf(row: PlaceRow): TrailDto | null {
  if (!row.difficulty || row.distanceKm == null || row.durationMinutes == null) return null;
  return {
    difficulty: row.difficulty,
    distanceKm: row.distanceKm,
    durationMinutes: row.durationMinutes,
    elevationGainM: row.elevationGainM ?? 0,
  };
}

function localizedText(row: PlaceRow, locale: Locale) {
  const t = pickTranslation(row.translations, locale);
  if (!t) throw new InternalServerErrorException(`Place ${row.slug} has no translations`);
  return t;
}

function toSummary(row: PlaceRow, locale: Locale): PlaceSummaryDto {
  const t = localizedText(row, locale);
  return {
    id: row.id,
    slug: row.slug,
    locale: t.locale as Locale,
    category: row.category,
    name: t.name,
    nameKo: row.nameKo,
    description: t.description,
    districtId: row.districtId,
    latitude: row.latitude,
    longitude: row.longitude,
    priceLevel: row.priceLevel,
    averageSpendKRW: row.averageSpendKRW,
    ratingAvg: row.ratingAvg,
    ratingCount: row.ratingCount,
    tags: row.tags,
    imageUrl: row.imageUrls[0] ?? null,
    trail: trailOf(row),
  };
}

function toDetail(row: PlaceRow, locale: Locale): PlaceDetailDto {
  return {
    ...toSummary(row, locale),
    cityId: row.cityId,
    address: row.address,
    openingHours: (row.openingHours as OpeningHours | null) ?? null,
    openingHoursNote: localizedText(row, locale).openingHoursNote,
    website: row.website,
    imageUrls: row.imageUrls,
  };
}

function toAdmin(row: PlaceRow): AdminPlaceDto {
  return {
    id: row.id,
    cityId: row.cityId,
    districtId: row.districtId,
    category: row.category,
    slug: row.slug,
    nameKo: row.nameKo,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    priceLevel: row.priceLevel,
    averageSpendKRW: row.averageSpendKRW,
    openingHours: (row.openingHours as OpeningHours | null) ?? null,
    website: row.website,
    imageUrls: row.imageUrls,
    tags: row.tags,
    trail: trailOf(row),
    ratingAvg: row.ratingAvg,
    ratingCount: row.ratingCount,
    translations: translationsByLocale(row.translations, TEXT_FIELDS),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Trail columns from the nested DTO (`null` clears them). */
const trailColumns = (trail: TrailDto | null) => ({
  difficulty: trail?.difficulty ?? null,
  distanceKm: trail?.distanceKm ?? null,
  durationMinutes: trail?.durationMinutes ?? null,
  elevationGainM: trail?.elevationGainM ?? null,
});

const trailOnlyForHiking = () =>
  new BadRequestException({
    code: 'TRAIL_ONLY_FOR_HIKING',
    message: 'Trail metrics can only be set on HIKING places',
  });

@Injectable()
export class PlacesService {
  constructor(
    private readonly repository: PlacesRepository,
    private readonly cities: CitiesService,
    private readonly districts: DistrictsService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  // ----- Public -----

  async listByCity(
    citySlug: string,
    query: ListPlacesQueryDto,
    locale: Locale,
  ): Promise<Paginated<PlaceSummaryDto>> {
    const cityId = await this.cities.getIdBySlug(citySlug);
    const { page, limit, skip, sort, ...filters } = query;
    const { rows, total } = await this.repository.listLocalized(
      cityId,
      filters,
      sort,
      { skip, take: limit },
      locale,
    );
    return paginate(
      rows.map((row) => toSummary(row, locale)),
      total,
      { page, limit },
    );
  }

  async findBySlug(slug: string, locale: Locale): Promise<PlaceDetailDto> {
    const row = await this.repository.findBySlugLocalized(slug, locale);
    if (!row) throw placeNotFound();
    return toDetail(row, locale);
  }

  /** Light markers for the city map; cached per city, locale and category. */
  async mapPoints(
    citySlug: string,
    category: PlaceCategory | undefined,
    locale: Locale,
  ): Promise<MapPointDto[]> {
    const cityId = await this.cities.getIdBySlug(citySlug);
    const key = mapCacheKey(cityId, locale, category);
    const cached = await this.cache.get<MapPointDto[]>(key);
    if (cached) return cached;

    const rows = await this.repository.mapPoints(cityId, category, locale);
    const points = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: pickTranslation(row.translations, locale)?.name ?? row.slug,
      category: row.category,
      latitude: row.latitude,
      longitude: row.longitude,
    }));
    await this.cache.set(key, points);
    return points;
  }

  /** Number of places per category; every category is present (0 when empty). */
  async countByCategory(cityId: string): Promise<Record<PlaceCategory, number>> {
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<
      PlaceCategory,
      number
    >;
    for (const row of await this.repository.countByCategory(cityId)) {
      counts[row.category] = row._count._all;
    }
    return counts;
  }

  /** For other modules (reviews, favorites): place id from its slug, 404 when unknown. */
  async getIdBySlug(slug: string): Promise<string> {
    const row = await this.repository.findIdBySlug(slug);
    if (!row) throw placeNotFound();
    return row.id;
  }

  async assertExists(id: string): Promise<void> {
    if (!(await this.repository.existsById(id))) throw placeNotFound();
  }

  // ----- Admin -----

  async listAdmin(query: ListPlacesAdminQueryDto): Promise<Paginated<AdminPlaceDto>> {
    const { rows, total } = await this.repository.listAdmin(
      { cityId: query.cityId, category: query.category },
      { skip: query.skip, take: query.limit },
    );
    return paginate(rows.map(toAdmin), total, query);
  }

  async findByIdAdmin(id: string): Promise<AdminPlaceDto> {
    const row = await this.repository.findByIdAdmin(id);
    if (!row) throw placeNotFound();
    return toAdmin(row);
  }

  async create(dto: CreatePlaceDto): Promise<AdminPlaceDto> {
    const { translations, trail, openingHours, ...rest } = dto;
    await this.cities.assertExists(rest.cityId);
    if (rest.districtId) await this.districts.assertInCity(rest.cityId, rest.districtId);
    if (trail && rest.category !== PlaceCategory.HIKING) throw trailOnlyForHiking();

    const base: PlaceBase = {
      ...rest,
      openingHours: openingHours ?? Prisma.JsonNull,
      ...trailColumns(trail ?? null),
    };
    const rows = LOCALES.flatMap((locale) => {
      const text = translations[locale];
      return text
        ? [{ locale, text: { ...text, openingHoursNote: text.openingHoursNote ?? null } }]
        : [];
    });
    const created = await this.repository.create(base, rows);
    await this.invalidateMap(created.cityId);
    return toAdmin(created);
  }

  async update(id: string, dto: UpdatePlaceDto): Promise<AdminPlaceDto> {
    const { translations, trail, openingHours, ...rest } = dto;
    const current = await this.repository.findByIdAdmin(id);
    if (!current) throw placeNotFound();

    if (rest.districtId) await this.districts.assertInCity(current.cityId, rest.districtId);

    const category = rest.category ?? current.category;
    if (trail && category !== PlaceCategory.HIKING) throw trailOnlyForHiking();

    const base: Partial<PlaceBase> = { ...rest };
    if (openingHours !== undefined) base.openingHours = openingHours ?? Prisma.JsonNull;
    if (trail !== undefined) Object.assign(base, trailColumns(trail));
    // Leaving HIKING drops the trail metrics, which would no longer make sense.
    if (category !== PlaceCategory.HIKING) Object.assign(base, trailColumns(null));

    const existing = new Map(
      current.translations.map((t) => [
        t.locale as Locale,
        { name: t.name, description: t.description, openingHoursNote: t.openingHoursNote },
      ]),
    );
    const plan = planTranslationChanges<PlaceTranslationFields>(
      existing,
      translations ?? {},
      REQUIRED_TEXT,
    );
    const updated = await this.repository.update(id, base, plan);
    await this.invalidateMap(updated.cityId);
    return toAdmin(updated);
  }

  async delete(id: string): Promise<void> {
    const { cityId } = await this.repository.delete(id);
    await this.invalidateMap(cityId);
  }

  private async invalidateMap(cityId: string): Promise<void> {
    const keys = LOCALES.flatMap((locale) =>
      [undefined, ...CATEGORIES].map((category) => mapCacheKey(cityId, locale, category)),
    );
    await this.cache.mdel(keys);
  }
}
