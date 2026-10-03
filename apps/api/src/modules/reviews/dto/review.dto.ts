import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { type Locale, LOCALES } from '@korea-project/shared';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { LocalizedPaginationQueryDto } from '../../../common/dto';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// ----- Input -----

export class CreateReviewDto {
  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Go early and rent a hanbok', maxLength: 120 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @ApiProperty({ maxLength: 2000 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comment: string;

  @ApiPropertyOptional({
    example: '2026-04-12',
    description: 'Day of the visit (YYYY-MM-DD), not in the future.',
  })
  @IsOptional()
  @IsISO8601({ strict: true, strictSeparator: true })
  @MaxLength(10)
  visitedAt?: string;

  @ApiPropertyOptional({
    enum: LOCALES,
    description: 'Language the review is written in. Defaults to the request locale.',
  })
  @IsOptional()
  @IsIn(LOCALES)
  locale?: Locale;
}

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

export class ListReviewsQueryDto extends LocalizedPaginationQueryDto {}

// ----- Output -----

export class ReviewAuthorDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: 'Ana Souza' }) name: string;
}

export class ReviewDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) placeId: string;
  @ApiProperty({ minimum: 1, maximum: 5 }) rating: number;
  @ApiProperty() title: string;
  @ApiProperty() comment: string;
  @ApiProperty({ enum: LOCALES, description: 'Language it was written in (never translated).' })
  locale: Locale;
  @ApiPropertyOptional({ nullable: true, type: String, example: '2026-04-12' }) visitedAt:
    string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ type: ReviewAuthorDto }) author: ReviewAuthorDto;
}

export class ReviewedPlaceDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
}

/** A review in "my reviews", with the place it is about. */
export class MyReviewDto extends ReviewDto {
  @ApiProperty({ type: ReviewedPlaceDto }) place: ReviewedPlaceDto;
}
