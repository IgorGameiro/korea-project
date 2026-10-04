import type { components } from './schema';

// Short aliases for the API response shapes used by the web app.
type Schemas = components['schemas'];
export type CityDto = Schemas['CityDto'];
export type CityOverviewDto = Schemas['CityOverviewDto'];
export type DistrictDto = Schemas['DistrictDto'];
export type PlaceSummaryDto = Schemas['PlaceSummaryDto'];
export type SearchResultDto = Schemas['SearchResultDto'];
export type MapPointDto = Schemas['MapPointDto'];
export type AccommodationDto = Schemas['AccommodationDto'];
export type UserDto = Schemas['UserDto'];
export type AuthResponseDto = Schemas['AuthResponseDto'];
export type CostCalculationDto = Schemas['CostCalculationDto'];
export type PlaceOverviewDto = Schemas['PlaceOverviewDto'];
export type ReviewDto = Schemas['ReviewDto'];
export type ReviewMutationDto = Schemas['ReviewMutationDto'];
export type MyReviewDto = Schemas['MyReviewDto'];
