import Image from 'next/image';
import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

/**
 * Image card whose whole surface is clickable, while only the title is the link
 * (one tab stop and a meaningful accessible name — the "stretched link" pattern).
 * Without `href` it is a plain card (its children may then hold their own links).
 */
export function Card({
  href,
  title,
  imageUrl,
  imageAlt = '',
  eyebrow,
  children,
  headingLevel = 3,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  action,
  eager = false,
}: {
  href?: ComponentProps<typeof Link>['href'];
  title: ReactNode;
  imageUrl?: string | null;
  imageAlt?: string;
  eyebrow?: ReactNode;
  children?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  sizes?: string;
  /** A control over the image corner (e.g. a favorite button), above the stretched link. */
  action?: ReactNode;
  /** For a card visible on load (it may be the largest element): fetch the image right away. */
  eager?: boolean;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)] ring-1 ring-navy-100 transition-shadow focus-within:ring-2 focus-within:ring-coral-500 hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-navy-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes={sizes}
            {...(eager ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {})}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
        {action ? <div className="absolute top-3 right-3 z-10">{action}</div> : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {eyebrow ? <div className="flex flex-wrap items-center gap-2">{eyebrow}</div> : null}
        <Heading className="text-lg leading-snug font-bold">
          {href ? (
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
              {title}
            </Link>
          ) : (
            title
          )}
        </Heading>
        {children}
      </div>
    </article>
  );
}
