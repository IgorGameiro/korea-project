'use client';

import { useEffect, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/features/auth/use-session';
import { useRouter } from '@/i18n/navigation';

/**
 * Shows the admin only to ADMIN users. This is a convenience: the API enforces the role on every
 * admin route, so hiding the UI is not what protects the data.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === 'anonymous') {
      router.replace({ pathname: '/login', query: { next: window.location.pathname } });
    }
  }, [session.status, router]);

  if (session.status === 'restoring') {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (session.status === 'anonymous') return <p role="status">Taking you to the login page…</p>;
  if (session.user.role !== 'ADMIN') {
    return (
      <div role="alert" className="rounded-[var(--radius-card)] bg-coral-50 p-5">
        <h1 className="text-xl font-bold">Access denied</h1>
        <p className="mt-1">The admin area requires an administrator account.</p>
      </div>
    );
  }
  return children;
}
