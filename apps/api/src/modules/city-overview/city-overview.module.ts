import { Module } from '@nestjs/common';
import { CitiesModule } from '../cities/cities.module';
import { DistrictsModule } from '../districts/districts.module';
import { CityOverviewController } from './city-overview.controller';

@Module({
  imports: [CitiesModule, DistrictsModule],
  controllers: [CityOverviewController],
})
export class CityOverviewModule {}
