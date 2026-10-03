import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Locale, Paginated } from '@korea-project/shared';
import { CurrentUser, Public } from '../../common/decorators';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import type { AuthUser } from '../../common/types/auth-user';
import {
  CreateReviewDto,
  ListReviewsQueryDto,
  MyReviewDto,
  ReviewDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Public()
  @Get('places/:slug/reviews')
  @ApiOperation({ summary: 'Reviews of a place, newest first (each in its original language)' })
  @ApiPaginatedResponse(ReviewDto)
  @ApiNotFoundResponse({ description: 'PLACE_NOT_FOUND' })
  list(
    @Param('slug') slug: string,
    @Query() query: ListReviewsQueryDto,
  ): Promise<Paginated<ReviewDto>> {
    return this.reviews.listByPlaceSlug(slug, query);
  }

  @Post('places/:id/reviews')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review a place (once per user); updates its rating' })
  @ApiCreatedResponse({ type: ReviewDto })
  @ApiConflictResponse({ description: 'REVIEW_ALREADY_EXISTS' })
  @ApiNotFoundResponse({ description: 'PLACE_NOT_FOUND' })
  create(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) placeId: string,
    @Body() dto: CreateReviewDto,
    @RequestLocale() locale: Locale,
  ): Promise<ReviewDto> {
    return this.reviews.create(user, placeId, dto, locale);
  }

  @Patch('reviews/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a review (author or admin); updates the place rating' })
  @ApiOkResponse({ type: ReviewDto })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: not the author' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewDto> {
    return this.reviews.update(user, id, dto);
  }

  @Delete('reviews/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a review (author or admin); updates the place rating' })
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: 'FORBIDDEN: not the author' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.reviews.delete(user, id);
  }

  @Get('users/me/reviews')
  @ApiBearerAuth()
  @ApiLocale()
  @ApiOperation({ summary: 'Reviews written by the authenticated user, newest first' })
  @ApiPaginatedResponse(MyReviewDto)
  mine(
    @CurrentUser('id') userId: string,
    @Query() query: ListReviewsQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<Paginated<MyReviewDto>> {
    return this.reviews.listMine(userId, query, locale);
  }
}
