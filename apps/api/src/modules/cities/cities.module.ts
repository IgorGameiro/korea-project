import { Module } from '@nestjs/common';
import { AdminCitiesController } from './admin-cities.controller';
import { CitiesController } from './cities.controller';
import { CitiesRepository } from './cities.repository';
import { CitiesService } from './cities.service';

/** Bottom of the destinations graph: depends on no other domain module. */
@Module({
  controllers: [CitiesController, AdminCitiesController],
  providers: [CitiesService, CitiesRepository],
  exports: [CitiesService],
})
export class CitiesModule {}
