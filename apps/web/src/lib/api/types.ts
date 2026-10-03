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
