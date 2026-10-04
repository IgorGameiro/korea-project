'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Icon } from '@/components/ui/icon';
import { Link, usePathname } from '@/i18n/navigation';
import { CATEGORIES, CATEGORY_META, type IconName } from '@/lib/categories';
import { STAYS_SECTION } from '@/lib/sections';

/**
 * City section links (the SPEC's "tabs"). Sections are separate pages so each has its own URL,
 * metadata and static HTML; links are the right semantics for that (not ARIA tabs).
 */
export function SectionNav({
  citySlug,
  counts,
  stayCount,
}: {
  citySlug: string;
  counts: Record<string, number>;
  stayCount: number | null;
}) {
  const t = useTranslations('city');
  const pathname = usePathname();
  const base = `/cities/${citySlug}`;
  const items: { href: string; label: string; icon?: IconName; count?: number | null }[] = [
    { href: base, label: t('overview') },
    ...CATEGORIES.map((category) => ({
      href: `${base}/${CATEGORY_META[category].section}`,
      label: t(`sections.${CATEGORY_META[category].section}`),
      icon: CATEGORY_META[category].icon,
      count: counts[category] ?? 0,
    })),
    { href: `${base}/${STAYS_SECTION}`, label: t('sections.stays'), icon: 'bed', count: stayCount },
  ];

  return (
    <nav aria-label={t('sectionsNav')} className="border-b border-navy-100 bg-white">
      <Container>
        <ul className="-mb-px flex gap-1 overflow-x-auto">
          {items.map((item) => {
            const current = pathname === item.href;
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-semibold whitespace-nowrap ${
                    current
                      ? 'border-coral-500 text-navy-900'
                      : 'border-transparent text-navy-700 hover:text-navy-900'
                  }`}
                >
                  {item.icon ? <Icon name={item.icon} className="size-4" /> : null}
                  {item.label}
                  {item.count !== undefined && item.count !== null ? (
                    <span className="rounded-full bg-navy-50 px-1.5 text-xs font-medium text-navy-700">
                      {item.count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
