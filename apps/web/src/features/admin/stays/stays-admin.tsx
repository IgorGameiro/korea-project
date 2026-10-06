'use client';

import { useCallback, useEffect, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { browserApi } from '@/features/auth/browser-api';
import { Link, useRouter } from '@/i18n/navigation';
import { describeError, unwrap } from '../admin-api';
import { ConfirmDialog } from '../confirm-dialog';
import { ErrorBanner, Notice } from '../form-parts';
import { Pager } from '../places/places-admin';
import { useAdminCities, useAdminList } from '../use-admin-data';
import { type AdminStay, type CreateStayBody, StayForm, TIER_LABELS } from './stay-form';

const won = (value: number) => `₩${value.toLocaleString('en-US')}`;

/** /admin/stays */
export function StaysList() {
  const cities = useAdminCities();
  const [cityId, setCityId] = useState('');
  const [toDelete, setToDelete] = useState<AdminStay | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const cityName = (id: string) => cities?.find((c) => c.id === id)?.translations.en.name ?? '…';
  const fetchPage = useCallback(
    (page: number) =>
      unwrap(
        browserApi().GET('/api/v1/admin/accommodations', {
          params: { query: { page, limit: 25, cityId: cityId || undefined } },
        }),
      ),
    [cityId],
  );
  const list = useAdminList<AdminStay>(fetchPage);

  const remove = async (stay: AdminStay) => {
    setToDelete(null);
    try {
      await unwrap(
        browserApi().DELETE('/api/v1/admin/accommodations/{id}', {
          params: { path: { id: stay.id } },
        }),
      );
      setNotice(`Deleted ${stay.name}.`);
      list.reload();
    } catch (error) {
      list.setFailure(describeError(error));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Stays</h1>
        <Link href="/admin/stays/new" className={buttonClasses('primary')}>
          New stay
        </Link>
      </div>
      <label className="flex w-fit flex-col gap-1 text-sm font-semibold">
        City
        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="rounded-lg border border-navy-200 bg-white px-3 py-2"
        >
          <option value="">All cities</option>
          {cities?.map((city) => (
            <option key={city.id} value={city.id}>
              {city.translations.en.name}
            </option>
          ))}
        </select>
      </label>
      <Notice message={notice} />
      <ErrorBanner message={list.failure} />
      {list.items === null && !list.failure ? <Skeleton className="h-64 w-full" /> : null}
      {list.items ? (
        <>
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
                  Style
                </th>
                <th scope="col" className="py-2 pr-3">
                  Per night
                </th>
                <th scope="col" className="py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((stay) => (
                <tr key={stay.id} className="border-b border-navy-100">
                  <th scope="row" className="py-2 pr-3 font-semibold">
                    {stay.name}
                  </th>
                  <td className="py-2 pr-3">{cityName(stay.cityId)}</td>
                  <td className="py-2 pr-3">{TIER_LABELS[stay.tier]}</td>
                  <td className="py-2 pr-3">{won(stay.pricePerNightKRW)}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/stays/${stay.id}`}
                      aria-label={`Edit ${stay.name}`}
                      className="font-semibold underline underline-offset-4"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToDelete(stay)}
                      aria-label={`Delete ${stay.name}`}
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
        title={`Delete ${toDelete?.name ?? ''}?`}
        body="The stay is removed from the city's list. This cannot be undone."
        confirmLabel="Delete stay"
        onConfirm={() => toDelete && remove(toDelete)}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
}

/** /admin/stays/new */
export function NewStay() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/stays" className="text-sm underline underline-offset-4">
        ← Stays
      </Link>
      <h1 className="text-2xl font-bold">New stay</h1>
      <StayForm
        onSave={async (body) => {
          const created = await unwrap(
            browserApi().POST('/api/v1/admin/accommodations', { body: body as CreateStayBody }),
          );
          router.replace(`/admin/stays/${created.id}`);
        }}
      />
    </div>
  );
}

/** /admin/stays/[id] */
export function StayEditor({ id }: { id: string }) {
  const [stay, setStay] = useState<AdminStay | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    unwrap(browserApi().GET('/api/v1/admin/accommodations/{id}', { params: { path: { id } } }))
      .then(setStay)
      .catch((error: unknown) => setFailure(describeError(error)));
  }, [id]);
  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/stays" className="text-sm underline underline-offset-4">
        ← Stays
      </Link>
      <h1 className="text-2xl font-bold">{stay ? `Edit ${stay.name}` : 'Edit stay'}</h1>
      <Notice message={notice} />
      <ErrorBanner message={failure} />
      {!stay && !failure ? <Skeleton className="h-96 w-full" /> : null}
      {stay ? (
        <StayForm
          key={stay.updatedAt}
          stay={stay}
          onSave={async (body) => {
            setNotice(null);
            const saved = await unwrap(
              browserApi().PATCH('/api/v1/admin/accommodations/{id}', {
                params: { path: { id } },
                body,
              }),
            );
            setStay(saved);
            setNotice('Stay saved.');
          }}
        />
      ) : null}
    </div>
  );
}
