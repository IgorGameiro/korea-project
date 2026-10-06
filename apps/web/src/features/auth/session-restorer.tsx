'use client';

import { useEffect } from 'react';
import { restoreSession } from './session';

/** Restores the session once per page load (when a session cookie exists). Renders nothing. */
export function SessionRestorer() {
  useEffect(() => {
    void restoreSession();
  }, []);
  return null;
}
