import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { type Locale, type Paginated, PlaceCategory } from '@korea-project/shared';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { Public } from '../../common/decorators';
import { LocalizedPaginationQueryDto } from '../../common/dto';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import { CitiesService } from '../cities/cities.service';
import { PlaceSummaryDto } from '../places/dto/place.response';
import { PlacesService } from '../places/places.service';

export class SearchQueryDto extends LocalizedPaginationQueryDto {
  @ApiPropertyOptional({
    minLength: 2,
    maxLength: 100,
    description:
      'Term matched against names and descriptions (requested language + English), Korean names and tags. ' +
      '% and _ are matched literally. Required unless `category` is given.',
  })
  // Required when no category is given; when present it must be 2–100 characters (after trimming).
  @ValidateIf((dto: SearchQueryDto) => dto.category === undefined || dto.q !== undefined)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ enum: Object.values(PlaceCategory) })
  @IsOptional()
  @IsEnum(PlaceCategory)
  category?: PlaceCategory;
}

export class SearchCityDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
}

export class SearchResultDto extends PlaceSummaryDto {
  @ApiProperty({ type: SearchCityDto }) city: SearchCityDto;
}

/** Cross-city place search (composition of places + cities, like the overview modules). */
@ApiTags('search')
@Public()
@Controller('search')
export class SearchController {
  constructor(
    private readonly places: PlacesService,
    private readonly cities: CitiesService,
  ) {}

  @Get()
  @ApiLocale()
  @ApiOperation({ summary: 'Search places in every city, best rated first (rate limited)' })
  @ApiPaginatedResponse(SearchResultDto)
  @ApiTooManyRequestsResponse({ description: 'TOO_MANY_REQUESTS' })
  async search(
    @Query() query: SearchQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<Paginated<SearchResultDto>> {
    const results = await this.places.search(query, locale);
    const cities = await this.cities.findManyByIds(
      results.data.map((place) => place.cityId),
      locale,
    );
    return {
      ...results,
      data: results.data.flatMap((place) => {
        const city = cities.get(place.cityId);
        return city ? [{ ...place, city: { id: city.id, slug: city.slug, name: city.name } }] : [];
      }),
    };
  }
}
