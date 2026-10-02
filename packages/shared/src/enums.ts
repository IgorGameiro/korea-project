// Domain enums shared by api and web.
// Declared as const objects (not TS enums) so they are plain values on both sides
// and their string values match the Prisma enums one to one.

export const PlaceCategory = {
  RESTAURANT: 'RESTAURANT',
  NIGHTLIFE: 'NIGHTLIFE',
  HIKING: 'HIKING',
  ATTRACTION: 'ATTRACTION',
  CAFE: 'CAFE',
  SHOPPING: 'SHOPPING',
  CULTURE: 'CULTURE',
  NATURE: 'NATURE',
} as const;
export type PlaceCategory = (typeof PlaceCategory)[keyof typeof PlaceCategory];

export const CostTier = {
  BUDGET: 'BUDGET',
  MID: 'MID',
  LUXURY: 'LUXURY',
} as const;
export type CostTier = (typeof CostTier)[keyof typeof CostTier];

export const AccommodationType = {
  HOTEL: 'HOTEL',
  HOSTEL: 'HOSTEL',
  GUESTHOUSE: 'GUESTHOUSE',
  HANOK: 'HANOK',
  APARTMENT: 'APARTMENT',
} as const;
export type AccommodationType = (typeof AccommodationType)[keyof typeof AccommodationType];

export const TrailDifficulty = {
  EASY: 'EASY',
  MODERATE: 'MODERATE',
  HARD: 'HARD',
} as const;
export type TrailDifficulty = (typeof TrailDifficulty)[keyof typeof TrailDifficulty];

export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type Role = (typeof Role)[keyof typeof Role];
