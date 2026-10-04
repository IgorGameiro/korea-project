'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { logout } from './actions';
import { useSession } from './use-session';

/**
 * Account area of the header. While the session is being restored it shows a neutral placeholder
 * of the same size (no "Log in" flash for a signed-in visitor).
 */
export function UserMenu() {
  const t = useTranslations('auth');
  const session = useSession();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  if (session.status === 'restoring') {
    return (
      <span
        role="status"
        aria-label={t('restoring')}
        className="inline-block h-9 w-24 animate-pulse rounded-full bg-navy-100"
      />
    );
  }

  if (session.status === 'anonymous') {
    return (
      <Link
        href={{ pathname: '/login', query: { next: currentPath(pathname) } }}
        className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-navy-200 hover:bg-navy-50"
      >
        {t('logIn')}
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="max-w-40 truncate text-sm font-semibold"
        title={t('signedInAs', { name: session.user.name })}
      >
        {session.user.name}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await logout();
          setBusy(false);
        }}
        className="rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-navy-200 hover:bg-navy-50 disabled:opacity-50"
      >
        {t('logOut')}
      </button>
    </div>
  );
}

/** Public path including the locale prefix and query, for ?next= after logging in. */
const currentPath = (pathname: string) =>
  typeof window === 'undefined' ? pathname : `${window.location.pathname}${window.location.search}`;
