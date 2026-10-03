import { Body, Controller, Param, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DISPLAY_CURRENCIES } from '@korea-project/shared';
import { Roles } from '../../common/decorators';
import { ExchangeRateDto } from './dto/exchange-rates.response';
import { CurrencyParamDto, UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { ExchangeRatesService } from './exchange-rates.service';

@ApiTags('admin: exchange-rates')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'FORBIDDEN: requires the ADMIN role' })
@Roles('ADMIN')
@Controller('admin/exchange-rates')
export class AdminExchangeRatesController {
  constructor(private readonly exchangeRates: ExchangeRatesService) {}

  @Put(':currency')
  @ApiParam({ name: 'currency', enum: DISPLAY_CURRENCIES })
  @ApiOperation({
    summary: 'Create or replace the KRW -> currency rate (takes effect immediately)',
  })
  @ApiOkResponse({ type: ExchangeRateDto })
  upsert(
    @Param() { currency }: CurrencyParamDto,
    @Body() dto: UpdateExchangeRateDto,
  ): Promise<ExchangeRateDto> {
    return this.exchangeRates.upsert(currency, dto.rate);
  }
}
