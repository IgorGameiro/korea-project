import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Locale, Paginated } from '@korea-project/shared';
import { Public } from '../../common/decorators';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import { CitiesService } from './cities.service';
import { CityDto } from './dto/city.response';
import { ListCitiesQueryDto } from './dto/list-cities.query';

@ApiTags('cities')
@Public()
@Controller('cities')
export class CitiesController {
  constructor(private readonly cities: CitiesService) {}

  @Get()
  @ApiLocale()
  @ApiOperation({ summary: 'Cities, ordered for display (sortOrder)' })
  @ApiPaginatedResponse(CityDto)
  list(
    @Query() query: ListCitiesQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<Paginated<CityDto>> {
    return this.cities.list(query, locale);
  }
}
