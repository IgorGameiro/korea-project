import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Locale, Paginated } from '@korea-project/shared';
import { Public } from '../../common/decorators';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import { ListPlacesQueryDto, MapQueryDto } from './dto/list-places.query';
import { MapPointDto, PlaceSummaryDto } from './dto/place.response';
import { PlacesService } from './places.service';

@ApiTags('places')
@Public()
@Controller('cities/:citySlug')
export class PlacesController {
  constructor(private readonly places: PlacesService) {}

  @Get('places')
  @ApiLocale()
  @ApiOperation({ summary: 'Places of a city with filters, search, sorting and pagination' })
  @ApiPaginatedResponse(PlaceSummaryDto)
  @ApiNotFoundResponse({ description: 'CITY_NOT_FOUND' })
  list(
    @Param('citySlug') citySlug: string,
    @Query() query: ListPlacesQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<Paginated<PlaceSummaryDto>> {
    return this.places.listByCity(citySlug, query, locale);
  }

  @Get('map')
  @ApiLocale()
  @ApiOperation({ summary: 'Lightweight map markers for every place of a city (cached)' })
  @ApiOkResponse({ type: [MapPointDto] })
  @ApiNotFoundResponse({ description: 'CITY_NOT_FOUND' })
  map(
    @Param('citySlug') citySlug: string,
    @Query() query: MapQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<MapPointDto[]> {
    return this.places.mapPoints(citySlug, query.category, locale);
  }
}
