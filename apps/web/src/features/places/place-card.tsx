import { useTranslations } from 'next-intl';
import { CategoryBadge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PriceLevel } from '@/components/ui/price-tag';
import { Rating } from '@/components/ui/rating';
import type { PlaceSummaryDto } from '@/lib/api/types';

/** Place summary card. `cityName` is shown when results mix several cities (search). */
export function PlaceCard({
  place,
  cityName,
  headingLevel = 3,
}: {
  place: PlaceSummaryDto;
  cityName?: string;
  headingLevel?: 2 | 3 | 4;
}) {
  const t = useTranslations('place');
  const td = useTranslations('difficulty');
  return (
    <Card
      href={`/places/${place.slug}`}
      imageUrl={place.imageUrl}
      title={place.name}
      headingLevel={headingLevel}
      eyebrow={
        <>
          <CategoryBadge category={place.category} />
          {cityName ? (
            <span className="text-xs font-medium text-navy-700">
              {t('inCity', { city: cityName })}
            </span>
          ) : null}
        </>
      }
    >
      <p lang="ko" className="text-sm text-navy-700">
        {place.nameKo}
      </p>
      <p className="line-clamp-2 text-sm text-navy-700">{place.description}</p>
      {place.trail ? (
        <p className="text-sm font-medium">
          {t('trail', {
            difficulty: td(place.trail.difficulty),
            distance: place.trail.distanceKm,
            hours: Math.round(place.trail.durationMinutes / 30) / 2,
          })}
        </p>
      ) : null}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <Rating value={place.ratingAvg} count={place.ratingCount} />
        <PriceLevel level={place.priceLevel} />
      </div>
    </Card>
  );
}
