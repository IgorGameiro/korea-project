'use client';

import { useSyncExternalStore } from 'react';
import { type SessionState, sessionStore } from './session';

export function useSession(): SessionState {
  return useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot,
  );
}
