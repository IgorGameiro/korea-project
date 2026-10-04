'use client';

import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Rating } from '@/components/ui/rating';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs } from '@/components/ui/tabs';
import { browserApi } from '@/features/auth/browser-api';
import { useSession } from '@/features/auth/use-session';
import { useFavorites } from '@/features/favorites/favorites-store';
import { PlaceCard } from '@/features/places/place-card';
import { Link, useRouter } from '@/i18n/navigation';
import type { MyReviewDto, PlaceSummaryDto } from '@/lib/api/types';

const PAGE_SIZE = 12;
type Locale = 'en' | 'pt-BR';

/** Account page body: client-only, because everything on it belongs to the signed-in visitor. */
export function AccountView() {
  const t = useTranslations('account');
  const format = useFormatter();
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session.status === 'anonymous') {
      router.replace({ pathname: '/login', query: { next: window.location.pathname } });
    }
  }, [session.status, router]);

  if (session.status === 'restoring') {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (session.status === 'anonymous') {
    return <p role="status">{t('redirecting')}</p>;
  }

  const { user } = session;
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 font-semibold">{user.name}</p>
        <p className="text-sm text-navy-700">{user.email}</p>
        <p className="text-sm text-navy-700">
          {t('memberSince', {
            date: format.dateTime(new Date(user.createdAt), { month: 'long', year: 'numeric' }),
          })}
        </p>
      </div>
      <Tabs
        label={t('tabs')}
        items={[
          { id: 'favorites', label: t('favorites'), content: <FavoritesList /> },
          { id: 'reviews', label: t('reviews'), content: <MyReviewsList /> },
        ]}
      />
    </div>
  );
}

interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
}

/** A paginated "my …" list: first page on mount, "show more" appends. */
function usePagedList<T extends { id: string }>(
  fetchPage: (page: number) => Promise<{ data: T[]; meta: { page: number; totalPages: number } }>,
) {
  const [list, setList] = useState<Page<T> | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadPage = async (page: number) => {
    setBusy(true);
    try {
      const result = await fetchPage(page);
      setFailed(false);
      setList((current) => {
        const before = page === 1 || !current ? [] : current.items;
        const seen = new Set(before.map((item) => item.id));
        return {
          items: [...before, ...result.data.filter((item) => !seen.has(item.id))],
          page: result.meta.page,
          totalPages: result.meta.totalPages,
        };
      });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchPage(1)
      .then((result) => {
        if (active) setList({ items: result.data, page: 1, totalPages: result.meta.totalPages });
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
    // The first page is loaded once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { list, failed, busy, more: () => loadPage((list?.page ?? 0) + 1) };
}

async function unwrapPage<T>(
  call: Promise<{ data?: { data: T[]; meta: { page: number; totalPages: number } } }>,
) {
  const { data } = await call;
  if (!data) throw new Error('load failed');
  return data;
}

function FavoritesList() {
  const t = useTranslations('account');
  const locale = useLocale() as Locale;
  const favorites = useFavorites();
  const { list, failed, busy, more } = usePagedList<PlaceSummaryDto>((page) =>
    unwrapPage(
      browserApi().GET('/api/v1/users/me/favorites', {
        params: { query: { page, limit: PAGE_SIZE, locale } },
      }),
    ),
  );
  // A place unfavorited here disappears right away.
  const items = list?.items.filter((place) => !favorites.ready || favorites.isFavorite(place.id));

  return (
    <ListShell list={list} failed={failed} empty={t('noFavorites')} count={items?.length ?? 0}>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((place) => (
          <li key={place.id} className="flex">
            <PlaceCard place={place} headingLevel={3} />
          </li>
        ))}
      </ul>
      <MoreButton list={list} busy={busy} onClick={more} />
    </ListShell>
  );
}

function MyReviewsList() {
  const t = useTranslations('account');
  const format = useFormatter();
  const locale = useLocale() as Locale;
  const { list, failed, busy, more } = usePagedList<MyReviewDto>((page) =>
    unwrapPage(
      browserApi().GET('/api/v1/users/me/reviews', {
        params: { query: { page, limit: PAGE_SIZE, locale } },
      }),
    ),
  );

  return (
    <ListShell list={list} failed={failed} empty={t('noReviews')} count={list?.items.length ?? 0}>
      <ul className="flex flex-col divide-y divide-navy-100">
        {list?.items.map((review) => (
          <li key={review.id} className="flex flex-col gap-1 py-4">
            <Link href={`/places/${review.place.slug}`} className="font-semibold hover:underline">
              {t('reviewOf', { place: review.place.name })}
            </Link>
            <Rating value={review.rating} count={1} hideCount />
            <p lang={review.locale} className="font-medium">
              {review.title}
            </p>
            <time dateTime={review.createdAt} className="text-sm text-navy-700">
              {format.dateTime(new Date(review.createdAt), { dateStyle: 'medium' })}
            </time>
          </li>
        ))}
      </ul>
      <MoreButton list={list} busy={busy} onClick={more} />
    </ListShell>
  );
}

function ListShell({
  list,
  failed,
  empty,
  count,
  children,
}: {
  list: Page<unknown> | null;
  failed: boolean;
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  const t = useTranslations('account');
  if (failed && !list) {
    return (
      <p role="alert" className="rounded-lg bg-coral-50 p-3 text-sm font-medium text-coral-700">
        {t('loadError')}
      </p>
    );
  }
  if (!list) return <Skeleton className="h-40 w-full" />;
  if (count === 0) return <p className="text-navy-700">{empty}</p>;
  return <div className="flex flex-col gap-6">{children}</div>;
}

function MoreButton({
  list,
  busy,
  onClick,
}: {
  list: Page<unknown> | null;
  busy: boolean;
  onClick: () => void;
}) {
  const t = useTranslations('account');
  if (!list || list.page >= list.totalPages) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={buttonClasses('secondary', 'self-start')}
    >
      {t('showMore')}
    </button>
  );
}
