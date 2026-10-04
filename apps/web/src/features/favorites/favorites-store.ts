'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { browserApi } from '@/features/auth/browser-api';
import { useSession } from '@/features/auth/use-session';

// The signed-in visitor's favorite place ids, loaded once per session (one request marks every
// heart on the page) and changed optimistically: the heart flips at once and flips back if the
// API refuses.

interface State {
  userId: string | null;
  status: 'idle' | 'loading' | 'ready';
  ids: ReadonlySet<string>;
}

const EMPTY: State = { userId: null, status: 'idle', ids: new Set() };
let state: State = EMPTY;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  for (const listener of listeners) listener();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

function load(userId: string) {
  if (state.userId === userId && state.status !== 'idle') return loading ?? Promise.resolve();
  setState({ userId, status: 'loading', ids: new Set() });
  loading = browserApi()
    .GET('/api/v1/users/me/favorites/ids')
    .then(({ data }) => {
      if (state.userId === userId) {
        setState({ userId, status: 'ready', ids: new Set(data?.placeIds ?? []) });
      }
    })
    .catch(() => {
      if (state.userId === userId) setState({ userId, status: 'ready', ids: new Set() });
    })
    .finally(() => {
      loading = null;
    });
  return loading;
}

export class FavoriteError extends Error {}

/** Favorites or unfavorites a place, optimistically. Throws FavoriteError if the API refuses. */
export async function toggleFavorite(placeId: string): Promise<boolean> {
  const { userId, ids } = state;
  if (!userId) throw new FavoriteError('not signed in');
  const add = !ids.has(placeId);
  const flip = (on: boolean) => {
    const next = new Set(state.ids);
    if (on) next.add(placeId);
    else next.delete(placeId);
    setState({ ...state, ids: next });
  };
  flip(add);
  try {
    const call = add
      ? browserApi().POST('/api/v1/places/{id}/favorite', { params: { path: { id: placeId } } })
      : browserApi().DELETE('/api/v1/places/{id}/favorite', { params: { path: { id: placeId } } });
    const { response } = await call;
    if (!response.ok) throw new FavoriteError(`HTTP ${response.status}`);
    return add;
  } catch (error) {
    if (state.userId === userId) flip(!add);
    throw error instanceof FavoriteError ? error : new FavoriteError('network');
  }
}

/**
 * Favorite state for the current visitor: `ready` false while the session or the ids load
 * (render a neutral heart then), and `signedIn` false for anonymous visitors.
 */
export function useFavorites() {
  const session = useSession();
  const userId = session.status === 'authenticated' ? session.user.id : null;
  const current = useSyncExternalStore(
    subscribe,
    () => state,
    () => EMPTY,
  );

  useEffect(() => {
    if (userId) void load(userId);
    else if (session.status === 'anonymous' && state.userId !== null) setState(EMPTY);
  }, [userId, session.status]);

  const mine = current.userId === userId ? current : EMPTY;
  return {
    signedIn: userId !== null,
    restoring: session.status === 'restoring',
    ready: userId !== null && mine.status === 'ready',
    isFavorite: (placeId: string) => mine.ids.has(placeId),
  };
}

/** Test hook. */
export function resetFavoritesForTests() {
  state = EMPTY;
  loading = null;
  listeners.clear();
}
