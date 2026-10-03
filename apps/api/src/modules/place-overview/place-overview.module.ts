import { Module } from '@nestjs/common';
import { CitiesModule } from '../cities/cities.module';
import { DistrictsModule } from '../districts/districts.module';
import { PlacesModule } from '../places/places.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { PlaceOverviewController } from './place-overview.controller';

@Module({
  imports: [PlacesModule, CitiesModule, DistrictsModule, ReviewsModule],
  controllers: [PlaceOverviewController],
})
export class PlaceOverviewModule {}
