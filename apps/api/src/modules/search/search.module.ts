import { Module } from '@nestjs/common';
import { CitiesModule } from '../cities/cities.module';
import { PlacesModule } from '../places/places.module';
import { SearchController } from './search.controller';

@Module({
  imports: [PlacesModule, CitiesModule],
  controllers: [SearchController],
})
export class SearchModule {}
