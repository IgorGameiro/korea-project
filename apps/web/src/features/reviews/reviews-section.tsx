'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/features/auth/use-session';
import { Link } from '@/i18n/navigation';
import type { ReviewDto } from '@/lib/api/types';
import { setPlaceRating } from './place-rating-store';
import { ReviewForm } from './review-form';
import { ReviewItem } from './review-item';
import {
  createReview,
  deleteReview,
  fetchMyReview,
  fetchReviews,
  ReviewError,
  type ReviewErrorCode,
  type ReviewInput,
  updateReview,
} from './reviews-api';

/** Same page size as the place endpoint's "recent reviews". */
export const REVIEWS_PAGE_SIZE = 5;

interface ListState {
  reviews: ReviewDto[];
  page: number;
  totalPages: number;
  total: number;
}

/** The visitor's own review, tagged with whose it is (another login in this tab starts over). */
type Mine =
  | { status: 'unknown' }
  | { status: 'none'; userId: string }
  | { status: 'found'; userId: string; review: ReviewDto };

/**
 * Reviews of a place. The first page comes with the static HTML; everything that depends on the
 * visitor (their own review, the form) and "show more" happen on the client.
 */
export function ReviewsSection({
  placeId,
  placeSlug,
  initialReviews,
  initialTotal,
}: {
  placeId: string;
  placeSlug: string;
  initialReviews: ReviewDto[];
  initialTotal: number;
}) {
  const t = useTranslations('reviews');
  const tp = useTranslations('place');
  const locale = useLocale() as ReviewInput['locale'];
  const session = useSession();
  const [list, setList] = useState<ListState>({
    reviews: initialReviews,
    page: 1,
    totalPages: Math.ceil(initialTotal / REVIEWS_PAGE_SIZE),
    total: initialTotal,
  });
  const [stored, setMine] = useState<Mine>({ status: 'unknown' });
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [failure, setFailure] = useState<ReviewErrorCode | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const userId = session.status === 'authenticated' ? session.user.id : null;
  const mine: Mine =
    stored.status !== 'unknown' && stored.userId === userId ? stored : { status: 'unknown' };

  // Whether the signed-in visitor has already reviewed this place.
  useEffect(() => {
    if (!userId) return;
    let active = true;
    fetchMyReview(placeId, locale)
      .then((review) => {
        if (active) {
          setMine(review ? { status: 'found', userId, review } : { status: 'none', userId });
        }
      })
      .catch(() => {
        if (active) setMine({ status: 'none', userId });
      });
    return () => {
      active = false;
    };
  }, [placeId, locale, userId]);

  /** After a change, the first page again from the API (authoritative order and total). */
  const refreshList = async () => {
    const first = await fetchReviews(placeSlug, 1, REVIEWS_PAGE_SIZE);
    setList({
      reviews: first.data,
      page: 1,
      totalPages: first.meta.totalPages,
      total: first.meta.total,
    });
  };

  const save = async (input: ReviewInput) => {
    if (!userId) return;
    setFailure(null);
    const existing = mine.status === 'found' ? mine.review : null;
    try {
      const saved = existing
        ? await updateReview(existing.id, input)
        : await createReview(placeId, input);
      setPlaceRating(placeId, saved.placeRating);
      setMine({ status: 'found', userId, review: saved });
      setEditing(false);
      setNotice(t(existing ? 'updated' : 'published'));
    } catch (error) {
      // Reviewed in another tab meanwhile: explain it here (the form goes away) and show that review.
      if (error instanceof ReviewError && error.code === 'REVIEW_ALREADY_EXISTS') {
        const review = await fetchMyReview(placeId, locale).catch(() => null);
        if (review) {
          setMine({ status: 'found', userId, review });
          setFailure(error.code);
          return;
        }
      }
      throw error;
    }
    await refreshList().catch(() => undefined);
  };

  const remove = async () => {
    if (mine.status !== 'found' || !userId) return;
    setFailure(null);
    try {
      setPlaceRating(placeId, await deleteReview(mine.review.id));
      setMine({ status: 'none', userId });
      setConfirmDelete(false);
      setNotice(t('deleted'));
    } catch (error) {
      setConfirmDelete(false);
      setFailure(error instanceof ReviewError ? error.code : 'UNKNOWN');
      return;
    }
    await refreshList().catch(() => undefined);
  };

  const showMore = async () => {
    setLoadingMore(true);
    try {
      const next = await fetchReviews(placeSlug, list.page + 1, REVIEWS_PAGE_SIZE);
      setList((current) => {
        const seen = new Set(current.reviews.map((review) => review.id));
        return {
          reviews: [...current.reviews, ...next.data.filter((review) => !seen.has(review.id))],
          page: next.meta.page,
          totalPages: next.meta.totalPages,
          total: next.meta.total,
        };
      });
    } catch (error) {
      setFailure(error instanceof ReviewError ? error.code : 'UNKNOWN');
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section aria-labelledby="reviews-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="reviews-title" className="text-xl font-bold">
          {tp('reviews')}
        </h2>
        <p className="text-sm text-navy-700">{t('count', { count: list.total })}</p>
      </div>

      {/* Always rendered, so screen readers announce the message when it appears. */}
      <p
        role="status"
        className={
          notice ? 'rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800' : 'sr-only'
        }
      >
        {notice}
      </p>
      {failure ? (
        <p role="alert" className="rounded-lg bg-coral-50 p-3 text-sm font-medium text-coral-700">
          {t(`errors.${failure}`)}
        </p>
      ) : null}

      <div className="rounded-[var(--radius-card)] bg-navy-50 p-5">
        {session.status === 'restoring' || (userId && mine.status === 'unknown') ? (
          <Skeleton className="h-10 w-48" />
        ) : !userId ? (
          <LoginToReview />
        ) : mine.status === 'found' && !editing ? (
          <div>
            <h3 className="font-bold">{t('yourReview')}</h3>
            <ReviewItem review={mine.review} />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setNotice(null);
                  setEditing(true);
                }}
                className={buttonClasses('secondary')}
              >
                {t('edit')}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className={buttonClasses('ghost', 'text-coral-700')}
              >
                {t('delete')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="mb-3 font-bold">
              {t(mine.status === 'found' ? 'editTitle' : 'writeTitle')}
            </h3>
            <ReviewForm
              initial={mine.status === 'found' ? mine.review : null}
              onSubmit={save}
              onCancel={mine.status === 'found' ? () => setEditing(false) : undefined}
            />
          </div>
        )}
      </div>

      {list.reviews.length === 0 ? null : (
        <div>
          {list.reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      )}
      {list.page < list.totalPages ? (
        <button
          type="button"
          onClick={showMore}
          disabled={loadingMore}
          className={buttonClasses('secondary', 'self-start')}
        >
          {t('showMore')}
        </button>
      ) : null}

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title={t('deleteTitle')}>
        <p>{t('deleteBody')}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className={buttonClasses('secondary')}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={remove}
            className={buttonClasses('primary', 'bg-coral-700 hover:bg-coral-600')}
          >
            {t('deleteConfirm')}
          </button>
        </div>
      </Modal>
    </section>
  );
}

function LoginToReview() {
  const t = useTranslations('reviews');
  const path = typeof window === 'undefined' ? '/' : `${window.location.pathname}#reviews-title`;
  return (
    <Link href={{ pathname: '/login', query: { next: path } }} className={buttonClasses('primary')}>
      {t('loginToReview')}
    </Link>
  );
}
