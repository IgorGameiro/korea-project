import { useFormatter, useTranslations } from 'next-intl';
import { Rating } from '@/components/ui/rating';
import type { ReviewDto } from '@/lib/api/types';

/**
 * One review. Reviews are shown in the language they were written in (never translated), so the
 * text carries its own `lang` for screen readers and hyphenation.
 */
export function ReviewItem({ review }: { review: ReviewDto }) {
  const t = useTranslations('place');
  const format = useFormatter();
  return (
    <article className="flex flex-col gap-1.5 border-b border-navy-100 py-4 last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{review.author.name}</p>
        <time dateTime={review.createdAt} className="text-sm text-navy-700">
          {format.dateTime(new Date(review.createdAt), { dateStyle: 'medium' })}
        </time>
      </div>
      <Rating value={review.rating} count={1} hideCount />
      <div lang={review.locale}>
        <h3 className="font-semibold">{review.title}</h3>
        <p className="mt-1 whitespace-pre-line text-navy-800">{review.comment}</p>
      </div>
      {review.visitedAt ? (
        <p className="text-sm text-navy-700">
          {t('visited', {
            date: format.dateTime(new Date(`${review.visitedAt}T12:00:00Z`), {
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            }),
          })}
        </p>
      ) : null}
    </article>
  );
}
