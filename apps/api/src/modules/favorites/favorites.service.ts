import { Injectable } from '@nestjs/common';
import type { Locale, Paginated } from '@korea-project/shared';
import { paginate } from '../../common/dto';
import type { PlaceSummaryDto } from '../places/dto/place.response';
import { PlacesService } from '../places/places.service';
import { FavoritesRepository } from './favorites.repository';

/** Upper bound of GET /users/me/favorites/ids. */
export const MAX_FAVORITE_IDS = 1000;

@Injectable()
export class FavoritesService {
  constructor(
    private readonly repository: FavoritesRepository,
    private readonly places: PlacesService,
  ) {}

  async add(userId: string, placeId: string): Promise<void> {
    await this.places.assertExists(placeId);
    await this.repository.add(userId, placeId);
  }

  async remove(userId: string, placeId: string): Promise<void> {
    await this.places.assertExists(placeId);
    await this.repository.remove(userId, placeId);
  }

  async isFavorite(userId: string, placeId: string): Promise<boolean> {
    await this.places.assertExists(placeId);
    return this.repository.exists(userId, placeId);
  }

  /** Ids of the user's favorite places, so a page can mark every card at once. */
  allIds(userId: string): Promise<string[]> {
    return this.repository.allPlaceIds(userId, MAX_FAVORITE_IDS);
  }

  /** The user's favorite places as localized summaries, most recently favorited first. */
  async listMine(
    userId: string,
    query: { page: number; limit: number; skip: number },
    locale: Locale,
  ): Promise<Paginated<PlaceSummaryDto>> {
    const { placeIds, total } = await this.repository.listPlaceIds(userId, {
      skip: query.skip,
      take: query.limit,
    });
    return paginate(await this.places.findSummariesByIds(placeIds, locale), total, query);
  }
}
