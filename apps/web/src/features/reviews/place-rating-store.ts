'use client';

import { useSyncExternalStore } from 'react';

// The place page is static (ISR, up to 60 s old). After the visitor writes, edits or deletes a
// review, the API returns the new rating and this store makes every rating on the page show it
// right away (the static HTML catches up on the next regeneration).

export interface PlaceRating {
  ratingAvg: number;
  ratingCount: number;
}

const overrides = new Map<string, PlaceRating>();
const listeners = new Set<() => void>();

export function setPlaceRating(placeId: string, rating: PlaceRating) {
  overrides.set(placeId, rating);
  for (const listener of listeners) listener();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function usePlaceRating(placeId: string, initial: PlaceRating): PlaceRating {
  return useSyncExternalStore(
    subscribe,
    () => overrides.get(placeId) ?? initial,
    () => initial,
  );
}

/** Test hook. */
export function resetPlaceRatingsForTests() {
  overrides.clear();
  listeners.clear();
}
