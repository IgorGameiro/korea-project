import { browserApi } from '@/features/auth/browser-api';
import type { MyReviewDto, ReviewDto, ReviewMutationDto } from '@/lib/api/types';
import type { PlaceRating } from './place-rating-store';

export type ReviewErrorCode =
  | 'REVIEW_ALREADY_EXISTS'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'TOO_MANY_REQUESTS'
  | 'API_UNAVAILABLE'
  | 'UNKNOWN';

export class ReviewError extends Error {
  constructor(readonly code: ReviewErrorCode) {
    super(code);
    this.name = 'ReviewError';
  }
}

export interface ReviewInput {
  rating: number;
  title: string;
  comment: string;
  visitedAt?: string;
  locale: 'en' | 'pt-BR';
}

const BY_STATUS: Record<number, ReviewErrorCode> = {
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'REVIEW_ALREADY_EXISTS',
  429: 'TOO_MANY_REQUESTS',
};

/** Unwraps an openapi-fetch result, turning failures into a ReviewError with a known code. */
async function unwrap<T>(call: Promise<{ data?: T; response: Response }>): Promise<T> {
  let result: { data?: T; response: Response };
  try {
    result = await call;
  } catch {
    throw new ReviewError('API_UNAVAILABLE');
  }
  if (result.data !== undefined) return result.data;
  const { status } = result.response;
  throw new ReviewError(BY_STATUS[status] ?? (status >= 500 ? 'API_UNAVAILABLE' : 'UNKNOWN'));
}

/** The signed-in user's review of a place, if any. */
export async function fetchMyReview(placeId: string, locale: ReviewInput['locale']) {
  const page = await unwrap(
    browserApi().GET('/api/v1/users/me/reviews', {
      params: { query: { placeId, locale, limit: 1 } },
    }),
  );
  return (page.data[0] as MyReviewDto | undefined) ?? null;
}

export function fetchReviews(slug: string, page: number, limit: number) {
  return unwrap(
    browserApi().GET('/api/v1/places/{slug}/reviews', {
      params: { path: { slug }, query: { page, limit } },
    }),
  ) as Promise<{ data: ReviewDto[]; meta: { total: number; totalPages: number; page: number } }>;
}

export function createReview(placeId: string, input: ReviewInput): Promise<ReviewMutationDto> {
  return unwrap(
    browserApi().POST('/api/v1/places/{id}/reviews', {
      params: { path: { id: placeId } },
      body: input,
    }),
  );
}

export function updateReview(id: string, input: ReviewInput): Promise<ReviewMutationDto> {
  return unwrap(
    browserApi().PATCH('/api/v1/reviews/{id}', { params: { path: { id } }, body: input }),
  );
}

export async function deleteReview(id: string): Promise<PlaceRating> {
  const result = await unwrap(
    browserApi().DELETE('/api/v1/reviews/{id}', { params: { path: { id } } }),
  );
  return result.placeRating;
}
