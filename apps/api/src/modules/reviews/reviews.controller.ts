import {
  Body,
  Controller,
  Delete,
  Get,
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
  DeletedReviewDto,
  ListReviewsQueryDto,
  MyReviewDto,
  MyReviewsQueryDto,
  ReviewDto,
  ReviewMutationDto,
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
  @ApiCreatedResponse({ type: ReviewMutationDto })
  @ApiConflictResponse({ description: 'REVIEW_ALREADY_EXISTS' })
  @ApiNotFoundResponse({ description: 'PLACE_NOT_FOUND' })
  create(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) placeId: string,
    @Body() dto: CreateReviewDto,
    @RequestLocale() locale: Locale,
  ): Promise<ReviewMutationDto> {
    return this.reviews.create(user, placeId, dto, locale);
  }

  @Patch('reviews/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit a review (author or admin); updates the place rating' })
  @ApiOkResponse({ type: ReviewMutationDto })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: not the author' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewMutationDto> {
    return this.reviews.update(user, id, dto);
  }

  @Delete('reviews/:id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a review (author or admin); returns the updated place rating',
  })
  @ApiOkResponse({ type: DeletedReviewDto })
  @ApiForbiddenResponse({ description: 'FORBIDDEN: not the author' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeletedReviewDto> {
    return this.reviews.delete(user, id);
  }

  @Get('users/me/reviews')
  @ApiBearerAuth()
  @ApiLocale()
  @ApiOperation({ summary: 'Reviews written by the authenticated user, newest first' })
  @ApiPaginatedResponse(MyReviewDto)
  mine(
    @CurrentUser('id') userId: string,
    @Query() query: MyReviewsQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<Paginated<MyReviewDto>> {
    return this.reviews.listMine(userId, query, locale);
  }
}
