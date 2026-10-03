import { Injectable, NotFoundException } from '@nestjs/common';
import type { Paginated } from '@korea-project/shared';
import { paginate } from '../../common/dto';
import { CitiesService } from '../cities/cities.service';
import { DistrictsService } from '../districts/districts.service';
import { AccommodationsRepository } from './accommodations.repository';
import type {
  AccommodationDto,
  AdminAccommodationDto,
  CreateAccommodationDto,
  ListAccommodationsAdminQueryDto,
  ListAccommodationsQueryDto,
  UpdateAccommodationDto,
} from './dto/accommodation.dto';

type AccommodationRow = NonNullable<Awaited<ReturnType<AccommodationsRepository['findById']>>>;

const accommodationNotFound = () =>
  new NotFoundException({ code: 'ACCOMMODATION_NOT_FOUND', message: 'Accommodation not found' });

const toDto = (row: AccommodationRow): AccommodationDto => ({
  id: row.id,
  cityId: row.cityId,
  districtId: row.districtId,
  slug: row.slug,
  name: row.name,
  type: row.type,
  tier: row.tier,
  pricePerNightKRW: row.pricePerNightKRW,
  latitude: row.latitude,
  longitude: row.longitude,
  bookingUrl: row.bookingUrl,
  imageUrls: row.imageUrls,
});

const toAdminDto = (row: AccommodationRow): AdminAccommodationDto => ({
  ...toDto(row),
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

@Injectable()
export class AccommodationsService {
  constructor(
    private readonly repository: AccommodationsRepository,
    private readonly cities: CitiesService,
    private readonly districts: DistrictsService,
  ) {}

  async listByCity(
    citySlug: string,
    query: ListAccommodationsQueryDto,
  ): Promise<Paginated<AccommodationDto>> {
    const cityId = await this.cities.getIdBySlug(citySlug);
    const { rows, total } = await this.repository.list(
      { cityId, tier: query.tier, type: query.type, districtId: query.districtId },
      query.sort,
      { skip: query.skip, take: query.limit },
    );
    return paginate(rows.map(toDto), total, query);
  }

  // ----- Admin -----

  async listAdmin(
    query: ListAccommodationsAdminQueryDto,
  ): Promise<Paginated<AdminAccommodationDto>> {
    const { rows, total } = await this.repository.list({ cityId: query.cityId }, 'price', {
      skip: query.skip,
      take: query.limit,
    });
    return paginate(rows.map(toAdminDto), total, query);
  }

  async findByIdAdmin(id: string): Promise<AdminAccommodationDto> {
    const row = await this.repository.findById(id);
    if (!row) throw accommodationNotFound();
    return toAdminDto(row);
  }

  async create(dto: CreateAccommodationDto): Promise<AdminAccommodationDto> {
    await this.cities.assertExists(dto.cityId);
    if (dto.districtId) await this.districts.assertInCity(dto.cityId, dto.districtId);
    return toAdminDto(await this.repository.create(dto));
  }

  async update(id: string, dto: UpdateAccommodationDto): Promise<AdminAccommodationDto> {
    const current = await this.repository.findById(id);
    if (!current) throw accommodationNotFound();
    if (dto.districtId) await this.districts.assertInCity(current.cityId, dto.districtId);
    return toAdminDto(await this.repository.update(id, dto));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
