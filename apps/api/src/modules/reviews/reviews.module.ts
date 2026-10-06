import { Module } from '@nestjs/common';
import { PlacesModule } from '../places/places.module';
import { UsersModule } from '../users/users.module';
import { AdminReviewsController } from './admin-reviews.controller';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [PlacesModule, UsersModule],
  controllers: [ReviewsController, AdminReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService],
})
export class ReviewsModule {}
