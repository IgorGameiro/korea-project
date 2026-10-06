import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import type { Locale, Photo } from '@korea-project/shared';
import { Public } from '../../common/decorators';
import { PhotoDto } from '../../common/dto/photo.dto';
import { ApiLocale, RequestLocale } from '../../common/i18n';
import { CitiesService } from '../cities/cities.service';
import { PlacesService } from '../places/places.service';

class CreditedCityDto {
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
  @ApiProperty({ type: PhotoDto }) photo: PhotoDto;
}

class CreditedPlaceDto {
  @ApiProperty() slug: string;
  @ApiProperty() name: string;
  @ApiProperty() citySlug: string;
  @ApiProperty() cityName: string;
  @ApiProperty({ type: [PhotoDto] }) photos: PhotoDto[];
}

export class CreditsDto {
  @ApiProperty({ type: [CreditedCityDto] }) cities: CreditedCityDto[];
  @ApiProperty({ type: [CreditedPlaceDto] }) places: CreditedPlaceDto[];
}

/**
 * Composition endpoint for the photo credits page: every credited photo (Wikimedia Commons
 * licenses require naming author and license) with the page it appears on. Placeholders are left
 * out. Lives outside the domain modules so cities and places stay independent.
 */
@ApiTags('credits')
@Public()
@Controller('credits')
export class CreditsController {
  constructor(
    private readonly cities: CitiesService,
    private readonly places: PlacesService,
  ) {}

  @Get()
  @ApiLocale()
  @ApiOperation({ summary: 'Photo credits: every credited city and place photo' })
  @ApiOkResponse({ type: CreditsDto })
  async list(@RequestLocale() locale: Locale): Promise<CreditsDto> {
    const [cityPage, places] = await Promise.all([
      this.cities.list({ page: 1, limit: 100, skip: 0 }, locale),
      this.places.listCreditedPhotos(locale),
    ]);
    const cityById = new Map(cityPage.data.map((city) => [city.id, city]));
    const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name, locale);
    return {
      cities: cityPage.data
        .filter((city) => city.heroImageCredit)
        .map((city) => ({
          slug: city.slug,
          name: city.name,
          photo: { url: city.heroImageUrl, credit: city.heroImageCredit } satisfies Photo,
        }))
        .sort(byName),
      places: places
        .map((place) => {
          const city = cityById.get(place.cityId);
          return {
            slug: place.slug,
            name: place.name,
            citySlug: city?.slug ?? '',
            cityName: city?.name ?? '',
            photos: place.photos,
          };
        })
        .sort(byName),
    };
  }
}
