import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { ExchangeRatesResponseDto } from './dto/exchange-rates.response';
import { BASE_CURRENCY, ExchangeRatesService } from './exchange-rates.service';

@ApiTags('exchange-rates')
@Public()
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRates: ExchangeRatesService) {}

  @Get()
  @ApiOperation({ summary: 'Rates from KRW to every display currency, for client-side conversion' })
  @ApiOkResponse({ type: ExchangeRatesResponseDto })
  async findAll(): Promise<ExchangeRatesResponseDto> {
    return { base: BASE_CURRENCY, rates: await this.exchangeRates.findAll() };
  }
}
