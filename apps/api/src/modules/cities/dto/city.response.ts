import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { type Locale, LOCALES } from '@korea-project/shared';
import { PhotoCreditDto } from '../../../common/dto/photo.dto';
import { CityTextDto } from './city-input.dto';

/** Public, single-language view. `locale` tells which language the text is in (after fallback). */
export class CityDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: 'seoul' }) slug: string;
  @ApiProperty({ enum: LOCALES }) locale: Locale;
  @ApiProperty({ example: 'Seoul' }) name: string;
  @ApiProperty({ example: '서울' }) nameKo: string;
  @ApiProperty() description: string;
  @ApiProperty() bestTimeToVisit: string;
  @ApiProperty() heroImageUrl: string;
  @ApiPropertyOptional({
    type: PhotoCreditDto,
    nullable: true,
    description: 'Null for placeholders.',
  })
  heroImageCredit: PhotoCreditDto | null;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiPropertyOptional({ nullable: true, type: Number }) population: number | null;
  @ApiProperty() isFeatured: boolean;
}

class AdminCityTranslationsDto {
  @ApiProperty({ type: CityTextDto }) en: CityTextDto;
  @ApiPropertyOptional({ type: CityTextDto }) 'pt-BR'?: CityTextDto;
}

/** Admin view: every translation, plus bookkeeping fields. */
export class AdminCityDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() slug: string;
  @ApiProperty() nameKo: string;
  @ApiProperty() heroImageUrl: string;
  @ApiPropertyOptional({ type: PhotoCreditDto, nullable: true })
  heroImageCredit: PhotoCreditDto | null;
  @ApiProperty() latitude: number;
  @ApiProperty() longitude: number;
  @ApiPropertyOptional({ nullable: true, type: Number }) population: number | null;
  @ApiProperty() isFeatured: boolean;
  @ApiProperty() sortOrder: number;
  @ApiProperty({ type: AdminCityTranslationsDto }) translations: Partial<
    Record<Locale, CityTextDto>
  >;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
