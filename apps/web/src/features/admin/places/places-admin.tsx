'use client';

import { useCallback, useEffect, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { browserApi } from '@/features/auth/browser-api';
import { Link, useRouter } from '@/i18n/navigation';
import { CATEGORIES } from '@/lib/categories';
import { describeError, mutate, unwrap } from '../admin-api';
import { ConfirmDialog } from '../confirm-dialog';
import { ErrorBanner, Notice } from '../form-parts';
import { useAdminCities, useAdminList } from '../use-admin-data';
import { type AdminPlace, type CreatePlaceBody, PlaceForm } from './place-form';

const PAGE_SIZE = 25;
const selectClass = 'rounded-lg border border-navy-200 bg-white px-3 py-2';
const label = (category: string) => category.charAt(0) + category.slice(1).toLowerCase();

/** /admin/places */
export function PlacesList() {
  const cities = useAdminCities();
  const [cityId, setCityId] = useState('');
  const [category, setCategory] = useState('');
  const [toDelete, setToDelete] = useState<AdminPlace | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const cityName = (id: string) => cities?.find((c) => c.id === id)?.translations.en.name ?? '…';

  const fetchPage = useCallback(
    (page: number) =>
      unwrap(
        browserApi().GET('/api/v1/admin/places', {
          params: {
            query: {
              page,
              limit: PAGE_SIZE,
              cityId: cityId || undefined,
              category: (category || undefined) as CreatePlaceBody['category'] | undefined,
            },
          },
        }),
      ),
    [cityId, category],
  );
  const list = useAdminList<AdminPlace>(fetchPage);

  const remove = async (place: AdminPlace) => {
    setToDelete(null);
    try {
      await mutate(
        browserApi().DELETE('/api/v1/admin/places/{id}', { params: { path: { id: place.id } } }),
      );
      setNotice(
        `Deleted ${place.translations.en.name}. Its reviews and favorites were removed too.`,
      );
      list.reload();
    } catch (error) {
      list.setFailure(describeError(error));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Places</h1>
        <Link href="/admin/places/new" className={buttonClasses('primary')}>
          New place
        </Link>
      </div>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          City
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className={selectClass}
          >
            <option value="">All cities</option>
            {cities?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.translations.en.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectClass}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {label(value)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Notice message={notice} />
      <ErrorBanner message={list.failure} />
      {list.items === null && !list.failure ? <Skeleton className="h-64 w-full" /> : null}
      {list.items ? (
        <>
          <p className="text-sm text-navy-700">{list.meta?.total ?? 0} places</p>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-200 text-navy-700">
              <tr>
                <th scope="col" className="py-2 pr-3">
                  Name
                </th>
                <th scope="col" className="py-2 pr-3">
                  City
                </th>
                <th scope="col" className="py-2 pr-3">
                  Category
                </th>
                <th scope="col" className="py-2 pr-3">
                  Rating
                </th>
                <th scope="col" className="py-2 pr-3">
                  Portuguese
                </th>
                <th scope="col" className="py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((place) => (
                <tr key={place.id} className="border-b border-navy-100">
                  <th scope="row" className="py-2 pr-3 font-semibold">
                    {place.translations.en.name}
                    <span className="block font-mono text-xs font-normal text-navy-700">
                      {place.slug}
                    </span>
                  </th>
                  <td className="py-2 pr-3">{cityName(place.cityId)}</td>
                  <td className="py-2 pr-3">{label(place.category)}</td>
                  <td className="py-2 pr-3">
                    {place.ratingCount > 0
                      ? `${place.ratingAvg.toFixed(2)} (${place.ratingCount})`
                      : '—'}
                  </td>
                  <td className="py-2 pr-3">{place.translations['pt-BR'] ? 'Yes' : 'Missing'}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/places/${place.id}`}
                      aria-label={`Edit ${place.translations.en.name}`}
                      className="font-semibold underline underline-offset-4"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete(place)}
                      aria-label={`Delete ${place.translations.en.name}`}
                      className="ml-4 font-semibold text-coral-700 underline underline-offset-4"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pager page={list.page} totalPages={list.meta?.totalPages ?? 1} onPage={list.setPage} />
        </>
      ) : null}
      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.translations.en.name ?? ''}?`}
        body="The place is removed with its translations, reviews and favorites. This cannot be undone."
        confirmLabel="Delete place"
        onConfirm={() => toDelete && remove(toDelete)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}

/** Previous / Page x of y / Next for admin tables. */
export function Pager({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pages" className="flex items-center gap-4 text-sm">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className={buttonClasses('secondary')}
      >
        Previous
      </button>
      <span>
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className={buttonClasses('secondary')}
      >
        Next
      </button>
    </nav>
  );
}

/** /admin/places/new */
export function NewPlace() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/places" className="text-sm underline underline-offset-4">
        ← Places
      </Link>
      <h1 className="text-2xl font-bold">New place</h1>
      <PlaceForm
        onSave={async (body) => {
          const created = await mutate(
            browserApi().POST('/api/v1/admin/places', { body: body as CreatePlaceBody }),
          );
          router.replace(`/admin/places/${created.id}`);
        }}
      />
    </div>
  );
}

/** /admin/places/[id] */
export function PlaceEditor({ id }: { id: string }) {
  const [place, setPlace] = useState<AdminPlace | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    unwrap(browserApi().GET('/api/v1/admin/places/{id}', { params: { path: { id } } }))
      .then(setPlace)
      .catch((error: unknown) => setFailure(describeError(error)));
  }, [id]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/places" className="text-sm underline underline-offset-4">
        ← Places
      </Link>
      <h1 className="text-2xl font-bold">
        {place ? `Edit ${place.translations.en.name}` : 'Edit place'}
      </h1>
      <Notice message={notice} />
      <ErrorBanner message={failure} />
      {!place && !failure ? <Skeleton className="h-96 w-full" /> : null}
      {place ? (
        <>
          <p className="text-sm">
            <Link href={`/places/${place.slug}`} className="underline underline-offset-4">
              View on the site
            </Link>
          </p>
          <PlaceForm
            key={place.updatedAt}
            place={place}
            onSave={async (body) => {
              setNotice(null);
              const saved = await mutate(
                browserApi().PATCH('/api/v1/admin/places/{id}', { params: { path: { id } }, body }),
              );
              setPlace(saved);
              setNotice('Place saved.');
            }}
          />
        </>
      ) : null}
    </div>
  );
}
