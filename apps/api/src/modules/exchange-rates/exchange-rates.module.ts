import { Module } from '@nestjs/common';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesRepository } from './exchange-rates.repository';
import { ExchangeRatesService } from './exchange-rates.service';

@Module({
  controllers: [ExchangeRatesController],
  providers: [ExchangeRatesService, ExchangeRatesRepository],
  exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
