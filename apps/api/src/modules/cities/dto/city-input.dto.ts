import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { SLUG_MESSAGE, SLUG_PATTERN } from '../../../common/validation';

export class CityTextDto {
  @ApiProperty({ example: 'Seoul' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: 'Spring (April–May) and autumn (September–November).' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  bestTimeToVisit: string;
}

export class PartialCityTextDto extends PartialType(CityTextDto) {}

export class CityTranslationsDto {
  @ApiProperty({ type: CityTextDto, description: 'Required: the default locale.' })
  @IsObject()
  @ValidateNested()
  @Type(() => CityTextDto)
  en: CityTextDto;

  @ApiPropertyOptional({ type: CityTextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CityTextDto)
  'pt-BR'?: CityTextDto;
}

export class UpdateCityTranslationsDto {
  @ApiPropertyOptional({ type: PartialCityTextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialCityTextDto)
  en?: PartialCityTextDto;

  @ApiPropertyOptional({
    type: PartialCityTextDto,
    nullable: true,
    description: 'Send null to remove the Portuguese translation.',
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @ValidateNested()
  @Type(() => PartialCityTextDto)
  'pt-BR'?: PartialCityTextDto | null;
}

class CityBaseDto {
  @ApiProperty({ example: 'seoul' })
  @Matches(SLUG_PATTERN, { message: `slug ${SLUG_MESSAGE}` })
  @MaxLength(80)
  slug: string;

  @ApiProperty({ example: '서울' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  nameKo: string;

  @ApiProperty({ example: 'https://picsum.photos/seed/seoul/1600/900' })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(500)
  heroImageUrl: string;

  @ApiProperty({ example: 37.5665 })
  @IsLatitude()
  latitude: number;

  @ApiProperty({ example: 126.978 })
  @IsLongitude()
  longitude: number;

  @ApiPropertyOptional({ example: 9_400_000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  population?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class CreateCityDto extends CityBaseDto {
  @ApiProperty({ type: CityTranslationsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CityTranslationsDto)
  translations: CityTranslationsDto;
}

export class UpdateCityDto extends PartialType(CityBaseDto) {
  @ApiPropertyOptional({
    type: UpdateCityTranslationsDto,
    description: 'Only the locales sent are changed; the others are kept.',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateCityTranslationsDto)
  translations?: UpdateCityTranslationsDto;
}
