import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Locale, Paginated } from '@korea-project/shared';
import { Roles } from '../../common/decorators';
import { ApiPaginatedResponse } from '../../common/dto/api-paginated-response.decorator';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import { MyReviewDto, MyReviewsQueryDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

/**
 * Moderation: every review, newest first. Editing and deleting use the regular
 * PATCH/DELETE /reviews/:id routes, which already allow an ADMIN.
 */
@ApiTags('admin: reviews')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'FORBIDDEN: requires the ADMIN role' })
@Roles('ADMIN')
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  @ApiLocale()
  @ApiOperation({ summary: 'All reviews with their place, newest first (optionally one place)' })
  @ApiPaginatedResponse(MyReviewDto)
  list(
    @Query() query: MyReviewsQueryDto,
    @RequestLocale() locale: Locale,
  ): Promise<Paginated<MyReviewDto>> {
    return this.reviews.listAll(query, locale);
  }
}
