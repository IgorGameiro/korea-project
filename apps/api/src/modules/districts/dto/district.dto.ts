import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { type Locale, LOCALES } from '@korea-project/shared';
import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { SLUG_MESSAGE, SLUG_PATTERN } from '../../../common/validation';

// ----- Input -----

export class DistrictTextDto {
  @ApiProperty({ example: 'Hongdae' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;
}

export class PartialDistrictTextDto extends PartialType(DistrictTextDto) {}

export class DistrictTranslationsDto {
  @ApiProperty({ type: DistrictTextDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DistrictTextDto)
  en: DistrictTextDto;

  @ApiPropertyOptional({ type: DistrictTextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DistrictTextDto)
  'pt-BR'?: DistrictTextDto;
}

export class UpdateDistrictTranslationsDto {
  @ApiPropertyOptional({ type: PartialDistrictTextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialDistrictTextDto)
  en?: PartialDistrictTextDto;

  @ApiPropertyOptional({
    type: PartialDistrictTextDto,
    nullable: true,
    description: 'null removes it.',
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @ValidateNested()
  @Type(() => PartialDistrictTextDto)
  'pt-BR'?: PartialDistrictTextDto | null;
}

export class CreateDistrictDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  cityId: string;

  @ApiProperty({ example: 'hongdae', description: 'Unique within its city.' })
  @Matches(SLUG_PATTERN, { message: `slug ${SLUG_MESSAGE}` })
  @MaxLength(80)
  slug: string;

  @ApiProperty({ example: '홍대' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nameKo: string;

  @ApiProperty({ example: 37.5563 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: 126.9236 })
  @IsLongitude()
  longitude: number;

  @ApiProperty({ type: DistrictTranslationsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => DistrictTranslationsDto)
  translations: DistrictTranslationsDto;
}

/** A district cannot move to another city; delete and recreate it instead. */
export class UpdateDistrictDto extends PartialType(
  OmitType(CreateDistrictDto, ['cityId', 'translations'] as const),
) {
  @ApiPropertyOptional({ type: UpdateDistrictTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateDistrictTranslationsDto)
  translations?: UpdateDistrictTranslationsDto;
}

export class ListDistrictsAdminQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  cityId?: string;
}

// ----- Output -----

export class DistrictDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() slug: string;
  @ApiProperty({ enum: LOCALES }) locale: Locale;
  @ApiProperty() name: string;
  @ApiProperty() nameKo: string;
  @ApiProperty() description: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
}

class AdminDistrictTranslationsDto {
  @ApiProperty({ type: DistrictTextDto }) en: DistrictTextDto;
  @ApiPropertyOptional({ type: DistrictTextDto }) 'pt-BR'?: DistrictTextDto;
}

export class AdminDistrictDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) cityId: string;
  @ApiProperty() slug: string;
  @ApiProperty() nameKo: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiProperty({ type: AdminDistrictTranslationsDto })
  translations: Partial<Record<Locale, DistrictTextDto>>;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
