'use client';

import { Rating } from '@/components/ui/rating';
import { type PlaceRating, usePlaceRating } from './place-rating-store';

/** The place's rating, updated in place after the visitor's own review. */
export function LiveRating({ placeId, initial }: { placeId: string; initial: PlaceRating }) {
  const { ratingAvg, ratingCount } = usePlaceRating(placeId, initial);
  return <Rating value={ratingAvg} count={ratingCount} />;
}
