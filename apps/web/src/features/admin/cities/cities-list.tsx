'use client';

import { useEffect, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { browserApi } from '@/features/auth/browser-api';
import { Link } from '@/i18n/navigation';
import { describeError, unwrap } from '../admin-api';
import { ErrorBanner, Notice } from '../form-parts';
import type { AdminCity } from './city-form';

export function CitiesList() {
  const [cities, setCities] = useState<AdminCity[] | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AdminCity | null>(null);

  const load = () =>
    unwrap(browserApi().GET('/api/v1/admin/cities', { params: { query: { limit: 100 } } }))
      .then((page) => setCities(page.data))
      .catch((error: unknown) => setFailure(describeError(error)));

  useEffect(() => {
    void load();
  }, []);

  const remove = async (city: AdminCity) => {
    setToDelete(null);
    setFailure(null);
    try {
      await unwrap(
        browserApi().DELETE('/api/v1/admin/cities/{id}', { params: { path: { id: city.id } } }),
      );
      setNotice(`Deleted ${city.translations.en.name}.`);
      await load();
    } catch (error) {
      setFailure(describeError(error));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Cities</h1>
        <Link href="/admin/cities/new" className={buttonClasses('primary')}>
          New city
        </Link>
      </div>
      <Notice message={notice} />
      <ErrorBanner message={failure} />
      {cities === null && !failure ? <Skeleton className="h-48 w-full" /> : null}
      {cities ? (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy-200 text-navy-700">
            <tr>
              <th scope="col" className="py-2 pr-3">
                Name
              </th>
              <th scope="col" className="py-2 pr-3">
                Slug
              </th>
              <th scope="col" className="py-2 pr-3">
                Featured
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
            {cities.map((city) => (
              <tr key={city.id} className="border-b border-navy-100">
                <th scope="row" className="py-2 pr-3 font-semibold">
                  {city.translations.en.name}{' '}
                  <span lang="ko" className="font-normal text-navy-700">
                    {city.nameKo}
                  </span>
                </th>
                <td className="py-2 pr-3 font-mono text-xs">{city.slug}</td>
                <td className="py-2 pr-3">{city.isFeatured ? 'Yes' : 'No'}</td>
                <td className="py-2 pr-3">{city.translations['pt-BR'] ? 'Yes' : 'Missing'}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/cities/${city.id}`}
                    className="font-semibold underline underline-offset-4"
                    aria-label={`Edit ${city.translations.en.name}`}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setToDelete(city)}
                    className="ml-4 font-semibold text-coral-700 underline underline-offset-4"
                    aria-label={`Delete ${city.translations.en.name}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      <Modal
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={`Delete ${toDelete?.translations.en.name ?? ''}?`}
      >
        <p>
          The city and its translations are removed. The API refuses while it still has districts,
          places, stays or cost estimates.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setToDelete(null)}
            className={buttonClasses('secondary')}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => toDelete && remove(toDelete)}
            className={buttonClasses('primary', 'bg-coral-700 hover:bg-coral-600')}
          >
            Delete city
          </button>
        </div>
      </Modal>
    </div>
  );
}
