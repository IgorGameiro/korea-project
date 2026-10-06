'use client';

import { Link, usePathname } from '@/i18n/navigation';

export const ADMIN_SECTIONS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/cities', label: 'Cities & districts' },
  { href: '/admin/places', label: 'Places' },
  { href: '/admin/stays', label: 'Stays' },
  { href: '/admin/costs', label: 'Cost estimates' },
  { href: '/admin/exchange-rates', label: 'Exchange rates' },
  { href: '/admin/reviews', label: 'Reviews' },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin">
      <ul className="flex flex-wrap gap-1 border-b border-navy-100">
        {ADMIN_SECTIONS.map((item) => {
          const current =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={current ? 'page' : undefined}
                className={`-mb-px block border-b-2 px-3 py-2 text-sm font-semibold ${
                  current
                    ? 'border-coral-500 text-navy-900'
                    : 'border-transparent text-navy-700 hover:text-navy-900'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
