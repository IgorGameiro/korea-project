import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type Locale, LOCALES, type OpeningHours, PlaceCategory } from '@korea-project/shared';
import { PlaceTextDto, TrailDto } from './place-input.dto';

/** Item of the public place list. */
export class PlaceSummaryDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() slug: string;
  @ApiProperty({ enum: LOCALES, description: 'Language of name/description after fallback.' })
  locale: Locale;
  @ApiProperty({ enum: Object.values(PlaceCategory) }) category: PlaceCategory;
  @ApiProperty() name: string;
  @ApiProperty() nameKo: string;
  @ApiProperty() description: string;
  @ApiProperty({ format: 'uuid' }) cityId: string;
  @ApiPropertyOptional({ format: 'uuid', nullable: true, type: String }) districtId: string | null;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiProperty({ minimum: 1, maximum: 4 }) priceLevel: number;
  @ApiProperty({ description: 'In KRW; convert with GET /exchange-rates.' })
  averageSpendKRW: number;
  @ApiProperty({ example: 4.67 }) ratingAvg: number;
  @ApiProperty() ratingCount: number;
  @ApiProperty({ type: [String] }) tags: string[];
  @ApiPropertyOptional({ nullable: true, type: String }) imageUrl: string | null;
  @ApiPropertyOptional({ type: TrailDto, nullable: true }) trail: TrailDto | null;
}

/** Full public view of a place. */
export class PlaceDetailDto extends PlaceSummaryDto {
  @ApiProperty() address: string;
  @ApiPropertyOptional({ nullable: true, description: 'Weekly schedule (Asia/Seoul).' })
  openingHours: OpeningHours | null;
  @ApiPropertyOptional({ nullable: true, type: String }) openingHoursNote: string | null;
  @ApiPropertyOptional({ nullable: true, type: String }) website: string | null;
  @ApiProperty({ type: [String] }) imageUrls: string[];
}

/** Lightweight marker for the city map. */
export class MapPointDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
  @ApiProperty({ enum: Object.values(PlaceCategory) }) category: PlaceCategory;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
}

class AdminPlaceTranslationsDto {
  @ApiProperty({ type: PlaceTextDto }) en: PlaceTextDto;
  @ApiPropertyOptional({ type: PlaceTextDto }) 'pt-BR'?: PlaceTextDto;
}

export class AdminPlaceDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) cityId: string;
  @ApiPropertyOptional({ format: 'uuid', nullable: true, type: String }) districtId: string | null;
  @ApiProperty({ enum: Object.values(PlaceCategory) }) category: PlaceCategory;
  @ApiProperty() slug: string;
  @ApiProperty() nameKo: string;
  @ApiProperty() address: string;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiProperty() priceLevel: number;
  @ApiProperty() averageSpendKRW: number;
  @ApiPropertyOptional({ nullable: true }) openingHours: OpeningHours | null;
  @ApiPropertyOptional({ nullable: true, type: String }) website: string | null;
  @ApiProperty({ type: [String] }) imageUrls: string[];
  @ApiProperty({ type: [String] }) tags: string[];
  @ApiPropertyOptional({ type: TrailDto, nullable: true }) trail: TrailDto | null;
  @ApiProperty() ratingAvg: number;
  @ApiProperty() ratingCount: number;
  @ApiProperty({ type: AdminPlaceTranslationsDto })
  translations: Partial<Record<Locale, PlaceTextDto>>;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
