import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import type { Locale } from '@korea-project/shared';
import { Public } from '../../common/decorators';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import { CitiesService } from '../cities/cities.service';
import { DistrictsService } from '../districts/districts.service';
import { PlaceDetailDto } from '../places/dto/place.response';
import { PlacesService } from '../places/places.service';

/** Just enough to render a breadcrumb and link back. */
export class PlaceAreaDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
}

export class PlaceOverviewDto extends PlaceDetailDto {
  @ApiProperty({ type: PlaceAreaDto }) city: PlaceAreaDto;
  @ApiPropertyOptional({ type: PlaceAreaDto, nullable: true }) district: PlaceAreaDto | null;
}

/** Composition endpoint for the place page (reviews are added by the reviews module later). */
@ApiTags('places')
@Public()
@Controller('places')
export class PlaceOverviewController {
  constructor(
    private readonly places: PlacesService,
    private readonly cities: CitiesService,
    private readonly districts: DistrictsService,
  ) {}

  @Get(':slug')
  @ApiLocale()
  @ApiOperation({ summary: 'A place with its city and district' })
  @ApiOkResponse({ type: PlaceOverviewDto })
  @ApiNotFoundResponse({ description: 'PLACE_NOT_FOUND' })
  async findOne(
    @Param('slug') slug: string,
    @RequestLocale() locale: Locale,
  ): Promise<PlaceOverviewDto> {
    const place = await this.places.findBySlug(slug, locale);
    const [city, district] = await Promise.all([
      this.cities.findById(place.cityId, locale),
      place.districtId ? this.districts.findById(place.districtId, locale) : null,
    ]);
    const area = (a: { id: string; slug: string; name: string }) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
    });
    return { ...place, city: area(city), district: district ? area(district) : null };
  }
}
