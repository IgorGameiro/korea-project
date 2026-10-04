import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import type { Locale, Paginated } from '@korea-project/shared';
import { CurrentUser } from '../../common/decorators';
import { LocalizedPaginationQueryDto } from '../../common/dto';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import { PlaceSummaryDto } from '../places/dto/place.response';
import { FavoritesService } from './favorites.service';

export class FavoriteStatusDto {
  @ApiProperty() favorited: boolean;
}

export class FavoriteIdsDto {
  @ApiProperty({ type: [String], format: 'uuid', description: 'Most recent first (at most 1000).' })
  placeIds: string[];
}

@ApiTags('favorites')
@ApiBearerAuth()
@Controller()
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get('places/:id/favorite')
  @ApiOperation({ summary: 'Whether the authenticated user favorited this place' })
  @ApiOkResponse({ type: FavoriteStatusDto })
  @ApiNotFoundResponse({ description: 'PLACE_NOT_FOUND' })
  async status(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) placeId: string,
  ): Promise<FavoriteStatusDto> {
    return { favorited: await this.favorites.isFavorite(userId, placeId) };
  }

  @Post('places/:id/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Favorite a place (idempotent)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'PLACE_NOT_FOUND' })
  async add(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) placeId: string,
  ): Promise<void> {
    await this.favorites.add(userId, placeId);
  }

  @Delete('places/:id/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a place from favorites (idempotent)' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'PLACE_NOT_FOUND' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) placeId: string,
  ): Promise<void> {
    await this.favorites.remove(userId, placeId);
  }

  @Get('users/me/favorites/ids')
  @ApiOperation({ summary: 'Ids of every favorite place (to mark hearts on lists)' })
  @ApiOkResponse({ type: FavoriteIdsDto })
  async ids(@CurrentUser('id') userId: string): Promise<FavoriteIdsDto> {
    return { placeIds: await this.favorites.allIds(userId) };
  }

  @Get('users/me/favorites')
  @ApiLocale()
  @ApiOperation({ summary: 'Favorite places of the authenticated user, most recent first' })
  @ApiPaginatedResponse(PlaceSummaryDto)
  mine(
    @CurrentUser('id') userId: string,
    @Query() query: LocalizedPaginationQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<Paginated<PlaceSummaryDto>> {
    return this.favorites.listMine(userId, query, locale);
  }
}
