import type { OpeningHours } from '@korea-project/shared';
import type {
  AccommodationType,
  CostTier,
  PlaceCategory,
  TrailDifficulty,
} from '../../src/generated/prisma/enums';

// Plain data shapes for the seed. Relations are expressed by slug and resolved to ids at insert time.

export interface DistrictSeed {
  slug: string;
  name: string;
  nameKo: string;
  description: string;
  latitude: number;
  longitude: number;
}

export interface CostEstimateSeed {
  lodgingPerRoomPerNightKRW: number;
  foodPerPersonPerDayKRW: number;
  transportPerPersonPerDayKRW: number;
  activitiesPerPersonPerDayKRW: number;
}

export interface TrailSeed {
  difficulty: TrailDifficulty;
  distanceKm: number;
  durationMinutes: number;
  elevationGainM: number;
}

export interface PlaceSeed {
  category: PlaceCategory;
  name: string;
  nameKo: string;
  /** District slug within the same city. Omitted when the place is outside the listed districts. */
  district?: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  priceLevel: 1 | 2 | 3 | 4;
  averageSpendKRW: number;
  openingHours: OpeningHours | null;
  website?: string;
  tags: string[];
  trail?: TrailSeed;
}

export interface AccommodationSeed {
  name: string;
  type: AccommodationType;
  tier: CostTier;
  district?: string;
  pricePerNightKRW: number;
  latitude: number;
  longitude: number;
}

export interface CitySeed {
  slug: string;
  name: string;
  nameKo: string;
  description: string;
  latitude: number;
  longitude: number;
  bestTimeToVisit: string;
  population: number;
  isFeatured: boolean;
  sortOrder: number;
  districts: DistrictSeed[];
  costEstimates: Record<CostTier, CostEstimateSeed>;
  places: PlaceSeed[];
  accommodations: AccommodationSeed[];
}

export interface UserSeed {
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface ReviewSeed {
  userEmail: string;
  placeSlug: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  /** YYYY-MM-DD */
  visitedAt: string;
}

export interface FavoriteSeed {
  userEmail: string;
  placeSlug: string;
}
