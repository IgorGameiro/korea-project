import type { PlaceCategory } from '@korea-project/shared';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { CATEGORY_META } from '@/lib/categories';
import { Icon } from './icon';

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700 ${className}`}
    >
      {children}
    </span>
  );
}

/** Category label with its icon and color: readable without relying on color alone. */
export function CategoryBadge({ category }: { category: PlaceCategory }) {
  const t = useTranslations('categories');
  const { icon, color } = CATEGORY_META[category];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      <Icon name={icon} className="size-3.5" />
      {t(category)}
    </span>
  );
}
