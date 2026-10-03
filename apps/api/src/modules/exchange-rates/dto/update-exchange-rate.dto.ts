import { ApiProperty } from '@nestjs/swagger';
import { DISPLAY_CURRENCIES, type DisplayCurrency } from '@korea-project/shared';
import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsPositive, Max, ValidateBy } from 'class-validator';

const RATE_DECIMALS = 8; // ExchangeRate.rate is Decimal(18, 8)

/**
 * At most N decimal places, also for numbers JSON sends in exponent form (1e-9). class-validator's
 * `maxDecimalPlaces` looks for a "." in the text and lets "1e-9" through, which the column would
 * round to 0.
 */
const HasAtMostDecimals = (decimals: number) =>
  ValidateBy({
    name: 'hasAtMostDecimals',
    validator: {
      validate: (value: unknown) =>
        typeof value === 'number' && Number(value.toFixed(decimals)) === value,
      defaultMessage: () => `rate must have at most ${decimals} decimal places`,
    },
  });

export class CurrencyParamDto {
  @ApiProperty({ enum: DISPLAY_CURRENCIES, description: 'Target currency (case-insensitive).' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsIn(DISPLAY_CURRENCIES)
  currency: DisplayCurrency;
}

export class UpdateExchangeRateDto {
  @ApiProperty({
    example: 0.00072,
    description: `How many units of the currency one KRW buys. Positive, at most ${RATE_DECIMALS} decimal places.`,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @IsPositive()
  @HasAtMostDecimals(RATE_DECIMALS)
  @Max(1_000_000)
  rate: number;
}
