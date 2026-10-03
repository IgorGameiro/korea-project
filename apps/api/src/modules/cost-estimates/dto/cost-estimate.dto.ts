import { ApiProperty, ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import {
  CostTier,
  DISPLAY_CURRENCIES,
  type DisplayCurrency,
  type Locale,
  LOCALES,
} from '@korea-project/shared';
import { IsEnum, IsIn, IsInt, IsOptional, IsUUID, Matches, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { SLUG_MESSAGE, SLUG_PATTERN } from '../../../common/validation';

const TIERS = Object.values(CostTier);

// ----- Calculator -----

export class CalculateCostDto {
  @ApiProperty({ example: 'seoul' })
  @Matches(SLUG_PATTERN, { message: `citySlug ${SLUG_MESSAGE}` })
  citySlug: string;

  @ApiProperty({ minimum: 1, maximum: 20, example: 2 })
  @IsInt()
  @Min(1)
  @Max(20)
  people: number;

  @ApiProperty({ minimum: 1, maximum: 30, example: 7 })
  @IsInt()
  @Min(1)
  @Max(30)
  days: number;

  @ApiProperty({ enum: TIERS, example: CostTier.MID, description: 'Travel style.' })
  @IsEnum(CostTier)
  tier: CostTier;

  @ApiPropertyOptional({
    enum: DISPLAY_CURRENCIES,
    description: 'Currency for the converted amounts. Defaults to USD for en and BRL for pt-BR.',
  })
  @IsOptional()
  @IsIn(DISPLAY_CURRENCIES)
  currency?: DisplayCurrency;
}

export class MoneyDto {
  @ApiProperty({ example: 1_250_000, description: 'Amount in KRW (rounded to the won).' })
  krw: number;

  @ApiProperty({
    example: 900,
    description: 'Amount in the requested currency (rounded to cents).',
  })
  amount: number;
}

class BreakdownDto {
  @ApiProperty({ type: MoneyDto }) lodging: MoneyDto;
  @ApiProperty({ type: MoneyDto }) food: MoneyDto;
  @ApiProperty({ type: MoneyDto }) transport: MoneyDto;
  @ApiProperty({ type: MoneyDto }) activities: MoneyDto;
}

class UsedExchangeRateDto {
  @ApiProperty({ example: 'KRW' }) base: string;
  @ApiProperty({ enum: DISPLAY_CURRENCIES }) currency: DisplayCurrency;
  @ApiProperty({ example: 0.00072 }) rate: number;
  @ApiProperty() updatedAt: Date;
}

class CalculatedCityDto {
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: LOCALES }) locale: Locale;
}

export class CostCalculationDto {
  @ApiProperty({ type: CalculatedCityDto }) city: CalculatedCityDto;
  @ApiProperty() people: number;
  @ApiProperty() days: number;
  @ApiProperty({ description: 'days - 1, at least 1.' }) nights: number;
  @ApiProperty({ description: 'ceil(people / 2).' }) rooms: number;
  @ApiProperty({ enum: TIERS }) tier: CostTier;
  @ApiProperty({ enum: DISPLAY_CURRENCIES }) currency: DisplayCurrency;
  @ApiProperty({ type: UsedExchangeRateDto }) exchangeRate: UsedExchangeRateDto;
  @ApiProperty({ type: BreakdownDto }) breakdown: BreakdownDto;
  @ApiProperty({ type: MoneyDto }) total: MoneyDto;
  @ApiProperty({ type: MoneyDto, description: 'Average spend per day of the trip.' })
  perDay: MoneyDto;
  @ApiProperty({ type: MoneyDto, description: 'Average spend per traveler.' }) perPerson: MoneyDto;
}

// ----- Admin -----

export class CreateCostEstimateDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  cityId: string;

  @ApiProperty({ enum: TIERS })
  @IsEnum(CostTier)
  tier: CostTier;

  @ApiProperty({ example: 180_000 })
  @IsInt()
  @Min(0)
  lodgingPerRoomPerNightKRW: number;

  @ApiProperty({ example: 70_000 })
  @IsInt()
  @Min(0)
  foodPerPersonPerDayKRW: number;

  @ApiProperty({ example: 15_000 })
  @IsInt()
  @Min(0)
  transportPerPersonPerDayKRW: number;

  @ApiProperty({ example: 40_000 })
  @IsInt()
  @Min(0)
  activitiesPerPersonPerDayKRW: number;
}

/** City and tier identify the estimate and cannot change; only the amounts can. */
export class UpdateCostEstimateDto extends PartialType(
  PickType(CreateCostEstimateDto, [
    'lodgingPerRoomPerNightKRW',
    'foodPerPersonPerDayKRW',
    'transportPerPersonPerDayKRW',
    'activitiesPerPersonPerDayKRW',
  ] as const),
) {}

export class ListCostEstimatesAdminQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  cityId?: string;
}

export class CostEstimateDto extends CreateCostEstimateDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
