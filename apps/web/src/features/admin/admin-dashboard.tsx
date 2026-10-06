'use client';

import { useEffect, useState } from 'react';
import { browserApi } from '@/features/auth/browser-api';
import { Link } from '@/i18n/navigation';
import { unwrap } from './admin-api';

type Key = 'cities' | 'districts' | 'places' | 'stays' | 'reviews';

/** Entry point: what can be managed, with counts. */
export function AdminDashboard() {
  const [counts, setCounts] = useState<Partial<Record<Key, number>>>({});

  useEffect(() => {
    const api = browserApi();
    const one = { params: { query: { limit: 1 } } };
    const calls: Record<Key, Promise<{ meta: { total: number } }>> = {
      cities: unwrap(api.GET('/api/v1/admin/cities', one)),
      districts: unwrap(api.GET('/api/v1/admin/districts', one)),
      places: unwrap(api.GET('/api/v1/admin/places', one)),
      stays: unwrap(api.GET('/api/v1/admin/accommodations', one)),
      reviews: unwrap(api.GET('/api/v1/admin/reviews', one)),
    };
    const keys = Object.keys(calls) as Key[];
    void Promise.allSettled(keys.map((key) => calls[key])).then((results) =>
      setCounts(
        Object.fromEntries(
          results.map((result, i) => [
            keys[i],
            result.status === 'fulfilled' ? result.value.meta.total : undefined,
          ]),
        ),
      ),
    );
  }, []);

  const n = (key: Key) => counts[key] ?? '…';
  const cards = [
    {
      href: '/admin/cities',
      title: 'Cities & districts',
      detail: `${n('cities')} cities · ${n('districts')} districts`,
    },
    { href: '/admin/places', title: 'Places', detail: `${n('places')} places` },
    { href: '/admin/stays', title: 'Stays', detail: `${n('stays')} stays` },
    {
      href: '/admin/costs',
      title: 'Cost estimates',
      detail: 'Calculator amounts per city and style',
    },
    { href: '/admin/exchange-rates', title: 'Exchange rates', detail: 'KRW → USD and BRL' },
    { href: '/admin/reviews', title: 'Reviews', detail: `${n('reviews')} reviews to moderate` },
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
