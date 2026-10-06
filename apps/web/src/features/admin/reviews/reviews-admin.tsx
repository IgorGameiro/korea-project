'use client';

import { useCallback, useState } from 'react';
import { Rating } from '@/components/ui/rating';
import { Skeleton } from '@/components/ui/skeleton';
import { browserApi } from '@/features/auth/browser-api';
import { Link } from '@/i18n/navigation';
import type { MyReviewDto } from '@/lib/api/types';
import { describeError, mutate, unwrap } from '../admin-api';
import { ConfirmDialog } from '../confirm-dialog';
import { ErrorBanner, Notice } from '../form-parts';
import { Pager } from '../places/places-admin';
import { useAdminList } from '../use-admin-data';

/** /admin/reviews: newest first, across every place; an ADMIN may delete any review. */
export function ReviewsAdmin() {
  const [toDelete, setToDelete] = useState<MyReviewDto | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fetchPage = useCallback(
    (page: number) =>
      unwrap(browserApi().GET('/api/v1/admin/reviews', { params: { query: { page, limit: 20 } } })),
    [],
  );
  const list = useAdminList<MyReviewDto>(fetchPage);

  const remove = async (review: MyReviewDto) => {
    setToDelete(null);
    try {
      await mutate(
        browserApi().DELETE('/api/v1/reviews/{id}', { params: { path: { id: review.id } } }),
      );
      setNotice(`Deleted the review by ${review.author.name}. The place rating was recalculated.`);
      list.reload();
    } catch (error) {
      list.setFailure(describeError(error));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Reviews</h1>
      <p className="text-sm text-navy-700">
        Newest first, in the language each review was written in.
      </p>
      <Notice message={notice} />
      <ErrorBanner message={list.failure} />
      {list.items === null && !list.failure ? <Skeleton className="h-64 w-full" /> : null}
      {list.items ? (
        <>
          <p className="text-sm text-navy-700">{list.meta?.total ?? 0} reviews</p>
          <ul className="flex flex-col divide-y divide-navy-100">
            {list.items.map((review) => (
              <li key={review.id} className="flex flex-col gap-1 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/places/${review.place.slug}`}
                    className="font-semibold underline underline-offset-4"
                  >
                    {review.place.name}
                  </Link>
                  <time dateTime={review.createdAt} className="text-sm text-navy-700">
                    {new Date(review.createdAt).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
                <p className="text-sm">
                  by <span className="font-semibold">{review.author.name}</span> · {review.locale}
                </p>
                <Rating value={review.rating} count={1} hideCount />
                <div lang={review.locale}>
                  <p className="font-semibold">{review.title}</p>
                  <p className="whitespace-pre-line text-navy-800">{review.comment}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setToDelete(review)}
                  aria-label={`Delete the review by ${review.author.name} of ${review.place.name}`}
                  className="self-start text-sm font-semibold text-coral-700 underline underline-offset-4"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <Pager page={list.page} totalPages={list.meta?.totalPages ?? 1} onPage={list.setPage} />
        </>
      ) : null}
      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this review?"
        body={`The review by ${toDelete?.author.name ?? ''} is removed and the rating of ${toDelete?.place.name ?? 'the place'} is recalculated.`}
        confirmLabel="Delete review"
        onConfirm={() => toDelete && remove(toDelete)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}
