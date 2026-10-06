import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import {
  type OpeningHours,
  type Photo,
  PlaceCategory,
  TrailDifficulty,
  validateOpeningHours,
} from '@korea-project/shared';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateBy,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { SLUG_MESSAGE, SLUG_PATTERN } from '../../../common/validation';
import { IsPhotos, PhotoDto } from '../../../common/dto/photo.dto';
import { OpeningHoursDto } from './opening-hours.dto';

/** Validates the shared OpeningHours shape (every weekday, HH:MM ranges). */
const IsOpeningHours = () =>
  ValidateBy({
    name: 'isOpeningHours',
    validator: {
      validate: (value: unknown) => validateOpeningHours(value).length === 0,
      defaultMessage: (args) =>
        `openingHours is invalid: ${validateOpeningHours(args?.value).join('; ')}`,
    },
  });

// ----- Translations -----

export class PlaceTextDto {
  @ApiProperty({ example: 'Gyeongbokgung Palace' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  description: string;

  @ApiPropertyOptional({ nullable: true, example: 'Closed on Tuesdays.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  openingHoursNote?: string | null;
}

export class PartialPlaceTextDto extends PartialType(PlaceTextDto) {}

export class PlaceTranslationsDto {
  @ApiProperty({ type: PlaceTextDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PlaceTextDto)
  en: PlaceTextDto;

  @ApiPropertyOptional({ type: PlaceTextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PlaceTextDto)
  'pt-BR'?: PlaceTextDto;
}

export class UpdatePlaceTranslationsDto {
  @ApiPropertyOptional({ type: PartialPlaceTextDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PartialPlaceTextDto)
  en?: PartialPlaceTextDto;

  @ApiPropertyOptional({
    type: PartialPlaceTextDto,
    nullable: true,
    description: 'null removes it.',
  })
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @ValidateNested()
  @Type(() => PartialPlaceTextDto)
  'pt-BR'?: PartialPlaceTextDto | null;
}

// ----- Trail -----

export class TrailDto {
  @ApiProperty({ enum: Object.values(TrailDifficulty) })
  @IsEnum(TrailDifficulty)
  difficulty: TrailDifficulty;

  @ApiProperty({ example: 8.4 })
  @IsNumber()
  @IsPositive()
  @Max(500)
  distanceKm: number;

  @ApiProperty({ example: 270 })
  @IsInt()
  @IsPositive()
  durationMinutes: number;

  @ApiProperty({ example: 700 })
  @IsInt()
  @Min(0)
  elevationGainM: number;
}

// ----- Place -----

export class CreatePlaceDto {
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

  @ApiProperty({ enum: Object.values(PlaceCategory) })
  @IsEnum(PlaceCategory)
  category: PlaceCategory;

  @ApiProperty({ example: 'gyeongbokgung-palace', description: 'Globally unique.' })
  @Matches(SLUG_PATTERN, { message: `slug ${SLUG_MESSAGE}` })
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: '경복궁' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nameKo: string;

  @ApiProperty({ example: '161 Sajik-ro, Jongno-gu, Seoul' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  address: string;

  @ApiProperty() @IsLatitude() latitude: number;
  @ApiProperty() @IsLongitude() longitude: number;

  @ApiProperty({ minimum: 1, maximum: 4 })
  @IsInt()
  @Min(1)
  @Max(4)
  priceLevel: number;

  @ApiProperty({ example: 3000 })
  @IsInt()
  @Min(0)
  averageSpendKRW: number;

  @ApiPropertyOptional({
    type: OpeningHoursDto,
    nullable: true,
    description: 'Weekly schedule (Asia/Seoul).',
  })
  @IsOptional()
  @IsOpeningHours()
  openingHours?: OpeningHours | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @MaxLength(500)
  website?: string | null;

  @ApiPropertyOptional({
    type: [PhotoDto],
    default: [],
    description: 'In display order (the first one is the cover). Credit required for real photos.',
  })
  @IsOptional()
  @IsPhotos()
  images?: Photo[];

  @ApiPropertyOptional({ type: [String], default: [], example: ['palace', 'history'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @Matches(SLUG_PATTERN, { each: true, message: `each tag ${SLUG_MESSAGE}` })
  tags?: string[];

  @ApiPropertyOptional({ type: TrailDto, nullable: true, description: 'Only for HIKING places.' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TrailDto)
  trail?: TrailDto | null;

  @ApiProperty({ type: PlaceTranslationsDto })
  @IsObject()
  @ValidateNested()
  @Type(() => PlaceTranslationsDto)
  translations: PlaceTranslationsDto;
}

/** A place cannot move to another city. Ratings are derived from reviews, never written. */
export class UpdatePlaceDto extends PartialType(
  OmitType(CreatePlaceDto, ['cityId', 'translations'] as const),
) {
  @ApiPropertyOptional({ type: UpdatePlaceTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdatePlaceTranslationsDto)
  translations?: UpdatePlaceTranslationsDto;
}
