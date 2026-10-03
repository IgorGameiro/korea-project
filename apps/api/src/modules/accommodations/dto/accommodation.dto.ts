import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { AccommodationType, CostTier } from '@korea-project/shared';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { LocalizedPaginationQueryDto, PaginationQueryDto } from '../../../common/dto';
import { SLUG_MESSAGE, SLUG_PATTERN } from '../../../common/validation';

const TYPES = Object.values(AccommodationType);
const TIERS = Object.values(CostTier);

// ----- Input -----

export class CreateAccommodationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  cityId: string;

  @ApiPropertyOptional({
    format: 'uuid',
    nullable: true,
    description: 'Must belong to the same city.',
  })
  @IsOptional()
  @IsUUID()
  districtId?: string | null;

  @ApiProperty({ example: 'the-shilla-seoul', description: 'Globally unique.' })
  @Matches(SLUG_PATTERN, { message: `slug ${SLUG_MESSAGE}` })
  @MaxLength(120)
  slug: string;

  @ApiProperty({ example: 'The Shilla Seoul', description: 'Proper name; not translated.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name: string;

  @ApiProperty({ enum: TYPES })
  @IsEnum(AccommodationType)
  type: AccommodationType;

  @ApiProperty({ enum: TIERS })
  @IsEnum(CostTier)
  tier: CostTier;

  @ApiProperty({ example: 650000 })
  @IsInt()
  @Min(0)
  pricePerNightKRW: number;

  @ApiProperty() @IsLatitude() latitude: number;
  @ApiProperty() @IsLongitude() longitude: number;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(500)
  bookingUrl?: string | null;

  @ApiPropertyOptional({ type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  imageUrls?: string[];
}

/** An accommodation cannot move to another city. */
export class UpdateAccommodationDto extends PartialType(
  OmitType(CreateAccommodationDto, ['cityId'] as const),
) {}

export const ACCOMMODATION_SORTS = ['price', '-price'] as const;
export type AccommodationSort = (typeof ACCOMMODATION_SORTS)[number];

export class ListAccommodationsQueryDto extends LocalizedPaginationQueryDto {
  @ApiPropertyOptional({ enum: TIERS })
  @IsOptional()
  @IsEnum(CostTier)
  tier?: CostTier;

  @ApiPropertyOptional({ enum: TYPES })
  @IsOptional()
  @IsEnum(AccommodationType)
  type?: AccommodationType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  districtId?: string;

  @ApiPropertyOptional({
    enum: ACCOMMODATION_SORTS,
    default: 'price',
    description: '"-price" = most expensive first.',
  })
  @IsOptional()
  @IsIn(ACCOMMODATION_SORTS)
  sort: AccommodationSort = 'price';
}

export class ListAccommodationsAdminQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  cityId?: string;
}

// ----- Output -----

export class AccommodationDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) cityId: string;
  @ApiPropertyOptional({ format: 'uuid', nullable: true, type: String }) districtId: string | null;
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: TYPES }) type: AccommodationType;
  @ApiProperty({ enum: TIERS }) tier: CostTier;
  @ApiProperty({ description: 'In KRW; convert with GET /exchange-rates.' })
  pricePerNightKRW: number;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiPropertyOptional({ nullable: true, type: String }) bookingUrl: string | null;
  @ApiProperty({ type: [String] }) imageUrls: string[];
}

export class AdminAccommodationDto extends AccommodationDto {
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
