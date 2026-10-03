import { Module } from '@nestjs/common';
import { CitiesModule } from '../cities/cities.module';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';
import { AdminCostEstimatesController } from './admin-cost-estimates.controller';
import { CostEstimatesController } from './cost-estimates.controller';
import { CostEstimatesRepository } from './cost-estimates.repository';
import { CostEstimatesService } from './cost-estimates.service';

@Module({
  imports: [CitiesModule, ExchangeRatesModule],
  controllers: [CostEstimatesController, AdminCostEstimatesController],
  providers: [CostEstimatesService, CostEstimatesRepository],
})
export class CostEstimatesModule {}
