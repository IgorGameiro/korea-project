'use client';

import { useEffect, useState } from 'react';
import { browserApi } from '@/features/auth/browser-api';
import { Link } from '@/i18n/navigation';
import { unwrap } from './admin-api';

/** Entry point: what can be managed, with counts. */
export function AdminDashboard() {
  const [counts, setCounts] = useState<{ cities?: number; districts?: number }>({});

  useEffect(() => {
    const api = browserApi();
    void Promise.allSettled([
      unwrap(api.GET('/api/v1/admin/cities', { params: { query: { limit: 1 } } })),
      unwrap(api.GET('/api/v1/admin/districts', { params: { query: { limit: 1 } } })),
    ]).then(([cities, districts]) =>
      setCounts({
        cities: cities.status === 'fulfilled' ? cities.value.meta.total : undefined,
        districts: districts.status === 'fulfilled' ? districts.value.meta.total : undefined,
      }),
    );
  }, []);

  const cards = [
    {
      href: '/admin/cities',
      title: 'Cities & districts',
      detail: `${counts.cities ?? '…'} cities · ${counts.districts ?? '…'} districts`,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="text-navy-700">
        Changes are saved through the API, which checks the administrator role on every request.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.href}>
            <Link
              href={card.href}
              className="block rounded-[var(--radius-card)] p-5 ring-1 ring-navy-100 hover:bg-navy-50"
            >
              <span className="block font-bold">{card.title}</span>
              <span className="block text-sm text-navy-700">{card.detail}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
