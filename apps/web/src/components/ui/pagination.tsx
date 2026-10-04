import { getTranslations } from 'next-intl/server';
import type { ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';

type Href = ComponentProps<typeof Link>['href'];

/** Previous / "Page x of y" / next. Renders nothing for a single page. */
export async function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => Href;
}) {
  if (totalPages <= 1) return null;
  const t = await getTranslations('pagination');
  const linkClass = 'font-semibold underline underline-offset-4 hover:text-coral-600';
  return (
    <nav aria-label={t('label')} className="mt-8 flex items-center gap-4">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          {t('previous')}
        </Link>
      ) : null}
      <span className="text-sm text-navy-700">{t('pageOf', { page, total: totalPages })}</span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
          {t('next')}
        </Link>
      ) : null}
    </nav>
  );
}
