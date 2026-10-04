import { useTranslations } from 'next-intl';
import { Icon } from './icon';

/**
 * Star rating with one accessible label ("Rated 4.7 out of 5, 3 reviews"); stars are decorative.
 * `hideCount` is for a single review's own rating ("Rated 4 out of 5").
 */
export function Rating({
  value,
  count,
  hideCount = false,
}: {
  value: number;
  count: number;
  hideCount?: boolean;
}) {
  const t = useTranslations('rating');
  if (count === 0 && !hideCount) {
    return <p className="text-sm text-navy-700">{t('noReviews')}</p>;
  }

  const rounded = Math.round(value * 2) / 2; // nearest half star
  return (
    <p
      className="flex items-center gap-1.5 text-sm"
      role="img"
      aria-label={hideCount ? t('single', { value }) : t('label', { value, count })}
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
      {hideCount ? null : (
        <span aria-hidden="true" className="text-navy-700">
          ({t('reviews', { count })})
        </span>
      )}
    </p>
  );
}
