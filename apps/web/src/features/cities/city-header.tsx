import Image from 'next/image';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import type { CityOverviewDto } from '@/lib/api/types';

/**
 * Hero shared by the city overview and its sections. Each page passes its own <h1> content:
 * the city name on the overview, "Hiking in Seoul" on a section.
 */
export function CityHeader({
  city,
  title,
  compact = false,
}: {
  city: CityOverviewDto;
  title: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="relative isolate overflow-hidden bg-navy-900 text-white">
      <Image
        src={city.heroImageUrl}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover opacity-60"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent" />
      <Container className={compact ? 'pt-16 pb-8 sm:pt-20' : 'pt-28 pb-10 sm:pt-40 sm:pb-14'}>
        {compact ? (
          <p className="mb-1 text-sm font-semibold tracking-wide text-navy-100 uppercase">
            {city.name}{' '}
            <span lang="ko" className="font-normal normal-case">
              {city.nameKo}
            </span>
          </p>
        ) : null}
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      </Container>
    </div>
  );
}
