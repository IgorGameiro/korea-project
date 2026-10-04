'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, type ReactNode, useTransition } from 'react';

/**
 * A plain GET form (it works without JavaScript) that, when JavaScript is available, navigates
 * client-side with a clean URL: empty fields are dropped and repeated fields (price checkboxes)
 * are joined with commas — "?price=1,2" instead of "?district=&price=1&price=2".
 */
export function FilterForm({
  action,
  label,
  children,
}: {
  action: string;
  label: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new Map<string, string[]>();
    for (const [name, value] of new FormData(event.currentTarget)) {
      if (typeof value !== 'string' || value === '') continue;
      values.set(name, [...(values.get(name) ?? []), value]);
    }
    const query = new URLSearchParams(
      [...values].map(([name, list]) => [name, list.join(',')]),
    ).toString();
    startTransition(() => router.push(query ? `${action}?${query}` : action, { scroll: false }));
  };

  return (
    <form
      action={action}
      method="get"
      onSubmit={onSubmit}
      aria-label={label}
      aria-busy={pending}
      className="flex flex-wrap items-end gap-4 rounded-[var(--radius-card)] bg-navy-50 p-4"
    >
      {children}
    </form>
  );
}
