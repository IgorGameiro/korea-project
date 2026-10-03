import { Module } from '@nestjs/common';
import { CitiesModule } from '../cities/cities.module';
import { DistrictsModule } from '../districts/districts.module';
import { AccommodationsController } from './accommodations.controller';
import { AccommodationsRepository } from './accommodations.repository';
import { AccommodationsService } from './accommodations.service';
import { AdminAccommodationsController } from './admin-accommodations.controller';

@Module({
  imports: [CitiesModule, DistrictsModule],
  controllers: [AccommodationsController, AdminAccommodationsController],
  providers: [AccommodationsService, AccommodationsRepository],
})
export class AccommodationsModule {}
