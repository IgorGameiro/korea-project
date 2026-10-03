import { useTranslations } from 'next-intl';
import { Icon } from './icon';

/** Star rating with one accessible label ("Rated 4.7 out of 5, 3 reviews"); stars are decorative. */
export function Rating({ value, count }: { value: number; count: number }) {
  const t = useTranslations('rating');
  if (count === 0) {
    return <p className="text-sm text-navy-700">{t('noReviews')}</p>;
  }

  const rounded = Math.round(value * 2) / 2; // nearest half star
  return (
    <p
      className="flex items-center gap-1.5 text-sm"
      role="img"
      aria-label={t('label', { value, count })}
    >
      <span className="flex text-amber-500" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name={rounded >= star ? 'star' : rounded >= star - 0.5 ? 'star-half' : 'star'}
            filled={rounded >= star - 0.5}
            className={`size-4 ${rounded >= star - 0.5 ? '' : 'text-navy-200'}`}
          />
        ))}
      </span>
      <span aria-hidden="true" className="font-semibold">
        {value.toFixed(1)}
      </span>
      <span aria-hidden="true" className="text-navy-700">
        ({t('reviews', { count })})
      </span>
    </p>
  );
}
