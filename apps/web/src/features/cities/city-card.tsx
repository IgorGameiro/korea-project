import { Card } from '@/components/ui/card';
import type { CityDto } from '@/lib/api/types';

export function CityCard({
  city,
  headingLevel = 3,
  eager = false,
}: {
  city: CityDto;
  headingLevel?: 2 | 3;
  eager?: boolean;
}) {
  return (
    <Card
      href={`/cities/${city.slug}`}
      imageUrl={city.heroImageUrl}
      headingLevel={headingLevel}
      eager={eager}
      title={
        <>
          {city.name}{' '}
          <span lang="ko" className="text-base font-normal text-navy-700">
            {city.nameKo}
          </span>
        </>
      }
    >
      <p className="line-clamp-3 text-sm text-navy-700">{city.description}</p>
    </Card>
  );
}
