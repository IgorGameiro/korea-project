import { ApiProperty } from '@nestjs/swagger';
import { DISPLAY_CURRENCIES, type DisplayCurrency } from '@korea-project/shared';

export class ExchangeRateDto {
  @ApiProperty({ enum: DISPLAY_CURRENCIES, example: 'USD' })
  currency: DisplayCurrency;

  @ApiProperty({ example: 0.00072, description: 'How many units of `currency` one KRW buys.' })
  rate: number;

  @ApiProperty({ example: 'env', description: 'Where the rate came from.' })
  source: string;

  @ApiProperty({ description: 'When the rate was last updated.' })
  updatedAt: Date;
}

export class ExchangeRatesResponseDto {
  @ApiProperty({
    example: 'KRW',
    description: 'Every price in the API is stored in this currency.',
  })
  base: string;

  @ApiProperty({ type: [ExchangeRateDto] })
  rates: ExchangeRateDto[];
}
