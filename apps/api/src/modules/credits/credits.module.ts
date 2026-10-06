import { Module } from '@nestjs/common';
import { CitiesModule } from '../cities/cities.module';
import { PlacesModule } from '../places/places.module';
import { CreditsController } from './credits.controller';

@Module({
  imports: [CitiesModule, PlacesModule],
  controllers: [CreditsController],
})
export class CreditsModule {}
