'use client';

import { useEffect, useState } from 'react';
import { onSiteRefresh } from './admin-api';

/** Announces when a saved change could not be pushed to the public pages right away. */
export function AdminRefreshStatus() {
  const [failed, setFailed] = useState(false);
  useEffect(() => onSiteRefresh((ok) => setFailed(!ok)), []);
  return (
    <p
      role="status"
      className={
        failed ? 'rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-900' : 'sr-only'
      }
    >
      {failed
        ? 'Saved, but the public pages could not be refreshed now. They update on their own within 5 minutes.'
        : ''}
    </p>
  );
}
