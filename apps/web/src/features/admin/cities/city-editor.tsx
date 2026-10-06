'use client';

import { useEffect, useState } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { browserApi } from '@/features/auth/browser-api';
import { Link, useRouter } from '@/i18n/navigation';
import { describeError, mutate, unwrap } from '../admin-api';
import { ErrorBanner, Notice } from '../form-parts';
import type { components } from '@/lib/api/schema';
import { type AdminCity, CityForm, type CreateCityBody } from './city-form';
import { type AdminDistrict, DistrictForm } from './district-form';

type CreateDistrictBody = components['schemas']['CreateDistrictDto'];

/** /admin/cities/new */
export function NewCity() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/cities" className="text-sm underline underline-offset-4">
        ← Cities
      </Link>
      <h1 className="text-2xl font-bold">New city</h1>
      <CityForm
        onSave={async (body) => {
          const created = await mutate(
            browserApi().POST('/api/v1/admin/cities', {
              body: body as CreateCityBody,
            }),
          );
          router.replace(`/admin/cities/${created.id}`);
        }}
      />
    </div>
  );
}

/** /admin/cities/[id]: the city form and its districts. */
export function CityEditor({ id }: { id: string }) {
  const [city, setCity] = useState<AdminCity | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    unwrap(browserApi().GET('/api/v1/admin/cities/{id}', { params: { path: { id } } }))
      .then(setCity)
      .catch((error: unknown) => setFailure(describeError(error)));
  }, [id]);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/cities" className="text-sm underline underline-offset-4">
        ← Cities
      </Link>
      <h1 className="text-2xl font-bold">
        {city ? `Edit ${city.translations.en.name}` : 'Edit city'}
      </h1>
      <Notice message={notice} />
      <ErrorBanner message={failure} />
      {!city && !failure ? <Skeleton className="h-96 w-full" /> : null}
      {city ? (
        <>
          <CityForm
            key={city.updatedAt}
            city={city}
            onSave={async (body) => {
              setNotice(null);
              const saved = await mutate(
                browserApi().PATCH('/api/v1/admin/cities/{id}', {
                  params: { path: { id } },
                  body,
                }),
              );
              setCity(saved);
              setNotice('City saved.');
            }}
          />
          <DistrictsPanel cityId={city.id} />
        </>
      ) : null}
    </div>
  );
}

function DistrictsPanel({ cityId }: { cityId: string }) {
  const [districts, setDistricts] = useState<AdminDistrict[] | null>(null);
  const [editing, setEditing] = useState<AdminDistrict | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<AdminDistrict | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () =>
    unwrap(
      browserApi().GET('/api/v1/admin/districts', { params: { query: { cityId, limit: 100 } } }),
    )
      .then((page) => setDistricts(page.data))
      .catch((error: unknown) => setFailure(describeError(error)));

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId]);

  const save = async (body: Parameters<Parameters<typeof DistrictForm>[0]['onSave']>[0]) => {
    if (editing === 'new') {
      await mutate(
        browserApi().POST('/api/v1/admin/districts', {
          body: { ...body, cityId } as CreateDistrictBody,
        }),
      );
      setNotice(`Added ${body.translations.en.name}.`);
    } else if (editing) {
      await mutate(
        browserApi().PATCH('/api/v1/admin/districts/{id}', {
          params: { path: { id: editing.id } },
          body,
        }),
      );
      setNotice(`Saved ${body.translations.en.name}.`);
    }
    setEditing(null);
    await load();
  };

  const remove = async (district: AdminDistrict) => {
    setToDelete(null);
    setFailure(null);
    try {
      await mutate(
        browserApi().DELETE('/api/v1/admin/districts/{id}', {
          params: { path: { id: district.id } },
        }),
      );
      setNotice(`Deleted ${district.translations.en.name}.`);
      await load();
    } catch (error) {
      setFailure(describeError(error));
    }
  };

  return (
    <section aria-labelledby="districts-title" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="districts-title" className="text-xl font-bold">
          Districts
        </h2>
        {editing === null ? (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className={buttonClasses('secondary')}
          >
            Add district
          </button>
        ) : null}
      </div>
      <Notice message={notice} />
      <ErrorBanner message={failure} />
      {editing !== null ? (
        <div className="rounded-[var(--radius-card)] bg-navy-50 p-5">
          <h3 className="mb-3 font-bold">
            {editing === 'new' ? 'New district' : `Edit ${editing.translations.en.name}`}
          </h3>
          <DistrictForm
            key={editing === 'new' ? 'new' : editing.id}
            district={editing === 'new' ? undefined : editing}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        </div>
      ) : null}
      {districts === null && !failure ? <Skeleton className="h-24 w-full" /> : null}
      {districts && districts.length === 0 ? (
        <p className="text-navy-700">No districts yet.</p>
      ) : null}
      {districts && districts.length > 0 ? (
        <ul className="divide-y divide-navy-100 rounded-[var(--radius-card)] ring-1 ring-navy-100">
          {districts.map((district) => (
            <li key={district.id} className="flex items-center justify-between gap-4 p-3">
              <span>
                <span className="font-semibold">{district.translations.en.name}</span>{' '}
                <span lang="ko" className="text-navy-700">
                  {district.nameKo}
                </span>
                <span className="ml-2 font-mono text-xs text-navy-700">{district.slug}</span>
              </span>
              <span className="whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => setEditing(district)}
                  aria-label={`Edit ${district.translations.en.name}`}
                  className="font-semibold underline underline-offset-4"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(district)}
                  aria-label={`Delete ${district.translations.en.name}`}
                  className="ml-4 font-semibold text-coral-700 underline underline-offset-4"
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <Modal
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title={`Delete ${toDelete?.translations.en.name ?? ''}?`}
      >
        <p>The API refuses while places or stays still belong to this district.</p>
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
            Delete district
          </button>
        </div>
      </Modal>
    </section>
  );
}
