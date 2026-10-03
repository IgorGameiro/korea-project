import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlaceCategory, TrailDifficulty } from '@korea-project/shared';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { LocalizedPaginationQueryDto, PaginationQueryDto } from '../../../common/dto';
import { SLUG_MESSAGE, SLUG_PATTERN, toCommaList } from '../../../common/validation';

export const PLACE_SORTS = ['rating', 'price'] as const;
export type PlaceSort = (typeof PLACE_SORTS)[number];

export class ListPlacesQueryDto extends LocalizedPaginationQueryDto {
  @ApiPropertyOptional({ enum: Object.values(PlaceCategory) })
  @IsOptional()
  @IsEnum(PlaceCategory)
  category?: PlaceCategory;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  districtId?: string;

  @ApiPropertyOptional({
    description: 'One or more levels, comma-separated: "1,2".',
    example: '1,2',
  })
  @IsOptional()
  @Transform(({ value }) => toCommaList({ value }).map(Number))
  @ArrayMaxSize(4)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(4, { each: true })
  priceLevel?: number[];

  @ApiPropertyOptional({
    description: 'Places having every tag, comma-separated.',
    example: 'free,night',
  })
  @IsOptional()
  @Transform(toCommaList)
  @ArrayMaxSize(10)
  @Matches(SLUG_PATTERN, { each: true, message: `each tag ${SLUG_MESSAGE}` })
  tags?: string[];

  @ApiPropertyOptional({ enum: Object.values(TrailDifficulty), description: 'Hiking places only.' })
  @IsOptional()
  @IsEnum(TrailDifficulty)
  difficulty?: TrailDifficulty;

  @ApiPropertyOptional({ minimum: 0, maximum: 5, description: 'Minimum average rating.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ enum: PLACE_SORTS, default: 'rating' })
  @IsOptional()
  @IsIn(PLACE_SORTS)
  sort: PlaceSort = 'rating';

  @ApiPropertyOptional({
    description:
      'Matches name/description (in the requested language and English), Korean name or a tag.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class MapQueryDto {
  @ApiPropertyOptional({ enum: Object.values(PlaceCategory) })
  @IsOptional()
  @IsEnum(PlaceCategory)
  category?: PlaceCategory;

  @IsOptional()
  @IsString()
  locale?: string;
}

export class ListPlacesAdminQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @ApiPropertyOptional({ enum: Object.values(PlaceCategory) })
  @IsOptional()
  @IsEnum(PlaceCategory)
  category?: PlaceCategory;
}
