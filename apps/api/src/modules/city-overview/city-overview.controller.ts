import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { type Locale, PlaceCategory } from '@korea-project/shared';
import { Public } from '../../common/decorators';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import { CitiesService } from '../cities/cities.service';
import { CityDto } from '../cities/dto/city.response';
import { DistrictsService } from '../districts/districts.service';
import { DistrictDto } from '../districts/dto/district.dto';
import { PlacesService } from '../places/places.service';

export class CityOverviewDto extends CityDto {
  @ApiProperty({ type: [DistrictDto] })
  districts: DistrictDto[];

  @ApiProperty({
    description: 'Number of places per category (every category present, 0 when empty).',
    example: Object.fromEntries(Object.values(PlaceCategory).map((c) => [c, 5])),
  })
  placeCounts: Record<PlaceCategory, number>;
}

/**
 * Composition endpoint: reads from several domain modules through their services, so the domain
 * modules themselves never depend on each other in a cycle (cities <- districts <- places).
 */
@ApiTags('cities')
@Public()
@Controller('cities')
export class CityOverviewController {
  constructor(
    private readonly cities: CitiesService,
    private readonly districts: DistrictsService,
    private readonly places: PlacesService,
  ) {}

  @Get(':slug')
  @ApiLocale()
  @ApiOperation({ summary: 'A city with its districts and the number of places per category' })
  @ApiOkResponse({ type: CityOverviewDto })
  @ApiNotFoundResponse({ description: 'CITY_NOT_FOUND' })
  async findOne(
    @Param('slug') slug: string,
    @RequestLocale() locale: Locale,
  ): Promise<CityOverviewDto> {
    const city = await this.cities.findBySlug(slug, locale);
    const [districts, placeCounts] = await Promise.all([
      this.districts.listByCity(city.id, locale),
      this.places.countByCategory(city.id),
    ]);
    return { ...city, districts, placeCounts };
  }
}
