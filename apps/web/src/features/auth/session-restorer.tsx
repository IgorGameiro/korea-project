'use client';

import { useEffect } from 'react';
import { refreshSession } from './session';

/** Restores the session once per page load from the refresh cookie. Renders nothing. */
export function SessionRestorer() {
  useEffect(() => {
    void refreshSession();
  }, []);
  return null;
}
