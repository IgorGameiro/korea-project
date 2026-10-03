import type { SVGProps } from 'react';
import type { IconName } from '@/lib/categories';

type ExtraIcon = 'star' | 'star-half' | 'search' | 'map-pin' | 'globe' | 'chevron-right' | 'x';

// Minimal inline icon set (24x24, stroke-based) — no icon dependency needed.
const PATHS: Record<IconName | ExtraIcon, string> = {
  utensils: 'M7 2v9M4 2v5a3 3 0 0 0 6 0V2M7 11v11M17 2c-2 2-3 4-3 7v4h3v9',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
  mountain: 'm3 20 6-11 4 6 3-4 5 9H3Z',
  landmark: 'M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M2 10 12 3l10 7H2Z',
  coffee:
    'M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V8ZM17 9h1.5a2.5 2.5 0 0 1 0 5H17M7 2v3M11 2v3M15 2v3',
  'shopping-bag': 'M5 7h14l-1 14H6L5 7ZM9 7V5a3 3 0 0 1 6 0v2',
  temple: 'M2 8h20M4 8l2-4h12l2 4M6 8v12M18 8v12M10 12h4v8h-4zM3 20h18',
  leaf: 'M5 21c0-9 6-15 15-16-1 9-7 15-15 16ZM5 21l7-7',
  bed: 'M3 18V7M3 13h18v5M21 18v-3a3 3 0 0 0-3-3h-7v5M7 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  star: 'm12 2 3 6.3 7 1-5 4.8 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.8 7-1L12 2Z',
  'star-half': 'M12 2v15.8L5.8 21l1.2-6.9-5-4.8 7-1L12 2Z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  'map-pin':
    'M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  globe:
    'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20',
  'chevron-right': 'm9 6 6 6-6 6',
  x: 'M18 6 6 18M6 6l12 12',
};

export type AnyIconName = keyof typeof PATHS;

/** Decorative by default (aria-hidden). Pass `title` to make it meaningful to screen readers. */
export function Icon({
  name,
  title,
  filled = false,
  className = 'size-5',
  ...props
}: { name: AnyIconName; title?: string; filled?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}
