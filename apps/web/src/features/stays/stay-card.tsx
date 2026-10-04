import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PriceTag } from '@/components/ui/price-tag';
import type { AccommodationDto } from '@/lib/api/types';

/** Stays have no detail page: a plain card, with an external booking link when there is one. */
export function StayCard({
  stay,
  districtName,
}: {
  stay: AccommodationDto;
  districtName?: string;
}) {
  const t = useTranslations('stay');
  const tTier = useTranslations('tiers');
  const tType = useTranslations('stayTypes');
  const tPrice = useTranslations('price');
  return (
    <Card
      title={stay.name}
      imageUrl={stay.imageUrls[0]}
      eyebrow={
        <>
          <Badge>{tTier(stay.tier)}</Badge>
          <Badge>{tType(stay.type)}</Badge>
        </>
      }
    >
      {districtName ? <p className="text-sm text-navy-700">{districtName}</p> : null}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
        <PriceTag krw={stay.pricePerNightKRW} suffix={tPrice('perNight')} />
        {stay.bookingUrl ? (
          <a
            href={stay.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('bookLabel', { name: stay.name })}
            className="relative text-sm font-semibold text-coral-600 underline underline-offset-4"
          >
            {t('book')}
          </a>
        ) : null}
      </div>
    </Card>
  );
}
