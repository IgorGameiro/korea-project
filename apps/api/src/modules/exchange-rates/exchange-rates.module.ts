import { Module } from '@nestjs/common';
import { AdminExchangeRatesController } from './admin-exchange-rates.controller';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesRepository } from './exchange-rates.repository';
import { ExchangeRatesService } from './exchange-rates.service';

@Module({
  controllers: [ExchangeRatesController, AdminExchangeRatesController],
  providers: [ExchangeRatesService, ExchangeRatesRepository],
  exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
