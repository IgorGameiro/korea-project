import { Module } from '@nestjs/common';
import { CitiesModule } from '../cities/cities.module';
import { AdminDistrictsController } from './admin-districts.controller';
import { DistrictsRepository } from './districts.repository';
import { DistrictsService } from './districts.service';

@Module({
  imports: [CitiesModule],
  controllers: [AdminDistrictsController],
  providers: [DistrictsService, DistrictsRepository],
  exports: [DistrictsService],
})
export class DistrictsModule {}
