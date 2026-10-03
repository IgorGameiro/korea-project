import type { Locale, OpeningHours } from '@korea-project/shared';
import type {
  AccommodationType,
  CostTier,
  PlaceCategory,
  TrailDifficulty,
} from '../../src/generated/prisma/enums';

// Plain data shapes for the seed. Relations are expressed by slug and resolved to ids at insert time.
// Translatable text is a Record over every Locale, so a missing translation is a type error.

export type Localized<T> = Record<Locale, T>;

export interface CityText {
  name: string;
  description: string;
  bestTimeToVisit: string;
}

export interface DistrictText {
  name: string;
  description: string;
}

export interface PlaceText {
  name: string;
  description: string;
  /** Caveat shown next to the opening hours. */
  hoursNote?: string;
}

export interface DistrictSeed {
  slug: string;
  nameKo: string;
  latitude: number;
  longitude: number;
  text: Localized<DistrictText>;
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
  /** Stable, English, globally unique. Part of the public URL: never derive it from a translation. */
  slug: string;
  category: PlaceCategory;
  nameKo: string;
  /** District slug within the same city. Omitted when the place is outside the listed districts. */
  district?: string;
  /** Romanized street address. */
  address: string;
  latitude: number;
  longitude: number;
  priceLevel: 1 | 2 | 3 | 4;
  averageSpendKRW: number;
  openingHours: OpeningHours | null;
  website?: string;
  /** English keys; labels are translated in the web app. */
  tags: string[];
  trail?: TrailSeed;
  text: Localized<PlaceText>;
}

export interface AccommodationSeed {
  /** Proper names are not translated; generic names are English. */
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
  nameKo: string;
  latitude: number;
  longitude: number;
  population: number;
  isFeatured: boolean;
  sortOrder: number;
  text: Localized<CityText>;
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
  /** Language the review is written in. */
  locale: Locale;
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
