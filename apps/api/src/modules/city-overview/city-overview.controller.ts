import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import type { Locale } from '@korea-project/shared';
import { Public } from '../../common/decorators';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import { CitiesService } from '../cities/cities.service';
import { CityDto } from '../cities/dto/city.response';
import { DistrictsService } from '../districts/districts.service';
import { DistrictDto } from '../districts/dto/district.dto';

export class CityOverviewDto extends CityDto {
  @ApiProperty({ type: [DistrictDto] })
  districts: DistrictDto[];
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
  ) {}

  @Get(':slug')
  @ApiLocale()
  @ApiOperation({ summary: 'A city with its districts' })
  @ApiOkResponse({ type: CityOverviewDto })
  @ApiNotFoundResponse({ description: 'CITY_NOT_FOUND' })
  async findOne(
    @Param('slug') slug: string,
    @RequestLocale() locale: Locale,
  ): Promise<CityOverviewDto> {
    const city = await this.cities.findBySlug(slug, locale);
    return { ...city, districts: await this.districts.listByCity(city.id, locale) };
  }
}
