import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Paginated } from '@korea-project/shared';
import { Public } from '../../common/decorators';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';
import { AccommodationsService } from './accommodations.service';
import { AccommodationDto, ListAccommodationsQueryDto } from './dto/accommodation.dto';

@ApiTags('accommodations')
@Public()
@Controller('cities/:citySlug/accommodations')
export class AccommodationsController {
  constructor(private readonly accommodations: AccommodationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Accommodations of a city, filtered by travel style (tier), cheapest first',
  })
  @ApiPaginatedResponse(AccommodationDto)
  @ApiNotFoundResponse({ description: 'CITY_NOT_FOUND' })
  list(
    @Param('citySlug') citySlug: string,
    @Query() query: ListAccommodationsQueryDto,
  ): Promise<Paginated<AccommodationDto>> {
    return this.accommodations.listByCity(citySlug, query);
  }
}
