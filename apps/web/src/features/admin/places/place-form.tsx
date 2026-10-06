'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { OpeningHours } from '@korea-project/shared';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { buttonClasses } from '@/components/ui/button';
import { TextAreaField, TextField } from '@/components/ui/text-field';
import type { components } from '@/lib/api/schema';
import { CATEGORIES } from '@/lib/categories';
import { applyFieldErrors, describeError } from '../admin-api';
import { coordinate } from '../cities/city-form';
import { CheckboxField, ErrorBanner, FormSection } from '../form-parts';
import { useAdminCities, useAdminDistricts } from '../use-admin-data';
import { OpeningHoursEditor, openingHoursProblems } from './opening-hours-editor';

export type AdminPlace = components['schemas']['AdminPlaceDto'];
export type CreatePlaceBody = components['schemas']['CreatePlaceDto'];

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HTTPS_URL = /^https:\/\/\S+$/;
const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
const tagList = (value: string) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
const wholeNumber = (message = 'A whole number.') =>
  z.coerce.string().trim().regex(/^\d+$/, message).transform(Number);

// Mirrors the API's CreatePlaceDto (it validates again; its messages land on these fields).
const schema = z
  .object({
    cityId: z.string().min(1, 'Choose a city.'),
    districtId: z.string(),
    category: z.enum(CATEGORIES as [string, ...string[]], { error: 'Choose a category.' }),
    slug: z.string().trim().regex(SLUG, 'Lowercase words separated by hyphens.').max(100),
    nameKo: z.string().trim().min(1, 'Required.').max(120),
    address: z.string().trim().min(1, 'Required.').max(300),
    latitude: coordinate(90),
    longitude: coordinate(180),
    priceLevel: z.coerce.number().int().min(1).max(4),
    averageSpendKRW: wholeNumber('Whole won, 0 for free.'),
    website: z
      .string()
      .trim()
      .max(500)
      .refine((value) => value === '' || HTTPS_URL.test(value), 'A full https:// URL, or empty.'),
    imageUrls: z
      .string()
      .refine(
        (value) => lines(value).every((url) => HTTPS_URL.test(url)),
        'One https:// URL per line.',
      )
      .refine((value) => lines(value).length <= 20, 'At most 20 images.'),
    tags: z
      .string()
      .refine(
        (value) => tagList(value).every((tag) => SLUG.test(tag)),
        'Comma-separated keys like street-food.',
      )
      .refine((value) => tagList(value).length <= 20, 'At most 20 tags.'),
    trail: z.object({
      difficulty: z.string(),
      distanceKm: z.string().trim(),
      durationMinutes: z.string().trim(),
      elevationGainM: z.string().trim(),
    }),
    openingHours: z.custom<OpeningHours | null>(),
    withPortuguese: z.boolean(),
    translations: z.object({
      en: z.object({
        name: z.string().trim().min(1, 'Required.').max(160),
        description: z.string().trim().min(1, 'Required.').max(4000),
        openingHoursNote: z.string().trim().max(500),
      }),
      'pt-BR': z.object({
        name: z.string().trim().max(160),
        description: z.string().trim().max(4000),
        openingHoursNote: z.string().trim().max(500),
      }),
    }),
  })
  .superRefine((values, ctx) => {
    if (openingHoursProblems(values.openingHours).length > 0) {
      ctx.addIssue({ code: 'custom', path: ['openingHours'], message: 'Fix the opening hours.' });
    }
    if (values.category === 'HIKING') {
      if (!['EASY', 'MODERATE', 'HARD'].includes(values.trail.difficulty)) {
        ctx.addIssue({
          code: 'custom',
          path: ['trail', 'difficulty'],
          message: 'Choose a difficulty.',
        });
      }
      const positive = (field: 'distanceKm' | 'durationMinutes', integer: boolean) => {
        const n = Number(values.trail[field]);
        if (!values.trail[field] || !(n > 0) || (integer && !Number.isInteger(n))) {
          ctx.addIssue({
            code: 'custom',
            path: ['trail', field],
            message: integer ? 'A whole number above 0.' : 'A number above 0.',
          });
        }
      };
      positive('distanceKm', false);
      positive('durationMinutes', true);
      if (!/^\d+$/.test(values.trail.elevationGainM)) {
        ctx.addIssue({
          code: 'custom',
          path: ['trail', 'elevationGainM'],
          message: 'Whole meters, 0 or more.',
        });
      }
    }
    if (values.withPortuguese) {
      for (const field of ['name', 'description'] as const) {
        if (!values.translations['pt-BR'][field]) {
          ctx.addIssue({
            code: 'custom',
            path: ['translations', 'pt-BR', field],
            message: 'Required.',
          });
        }
      }
    }
  });

type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

const FIELDS = [
  'cityId',
  'districtId',
  'category',
  'slug',
  'nameKo',
  'address',
  'latitude',
  'longitude',
  'priceLevel',
  'averageSpendKRW',
  'website',
  'imageUrls',
  'tags',
  'openingHours',
  'trail.difficulty',
  'trail.distanceKm',
  'trail.durationMinutes',
  'trail.elevationGainM',
  ...['en', 'pt-BR'].flatMap((l) =>
    ['name', 'description', 'openingHoursNote'].map((f) => `translations.${l}.${f}`),
  ),
];

function toValues(place?: AdminPlace): Input {
  const pt = place?.translations['pt-BR'];
  const text = (t?: { name: string; description: string; openingHoursNote?: string | null }) => ({
    name: t?.name ?? '',
    description: t?.description ?? '',
    openingHoursNote: t?.openingHoursNote ?? '',
  });
  return {
    cityId: place?.cityId ?? '',
    districtId: place?.districtId ?? '',
    category: place?.category ?? '',
    slug: place?.slug ?? '',
    nameKo: place?.nameKo ?? '',
    address: place?.address ?? '',
    latitude: place?.latitude ?? '',
    longitude: place?.longitude ?? '',
    priceLevel: place?.priceLevel ?? 1,
    averageSpendKRW: place?.averageSpendKRW ?? 0,
    website: place?.website ?? '',
    imageUrls: (place?.imageUrls ?? []).join('\n'),
    tags: (place?.tags ?? []).join(', '),
    trail: {
      difficulty: place?.trail?.difficulty ?? '',
      distanceKm: place?.trail?.distanceKm?.toString() ?? '',
      durationMinutes: place?.trail?.durationMinutes?.toString() ?? '',
      elevationGainM: place?.trail?.elevationGainM?.toString() ?? '',
    },
    openingHours: (place?.openingHours as OpeningHours | null | undefined) ?? null,
    withPortuguese: Boolean(pt),
    translations: { en: text(place?.translations.en), 'pt-BR': text(pt) },
  };
}

/** The request body. On edit, `pt-BR: null` removes the Portuguese translation. */
export function toPlaceBody(values: Output, editing: boolean) {
  const note = (value: string) => (value ? value : null);
  const pt = values.translations['pt-BR'];
  return {
    cityId: values.cityId,
    districtId: values.districtId || null,
    category: values.category as CreatePlaceBody['category'],
    slug: values.slug,
    nameKo: values.nameKo,
    address: values.address,
    latitude: values.latitude,
    longitude: values.longitude,
    priceLevel: values.priceLevel,
    averageSpendKRW: values.averageSpendKRW,
    website: values.website || null,
    imageUrls: lines(values.imageUrls),
    tags: tagList(values.tags),
    openingHours: values.openingHours,
    trail:
      values.category === 'HIKING'
        ? {
            difficulty: values.trail.difficulty as 'EASY' | 'MODERATE' | 'HARD',
            distanceKm: Number(values.trail.distanceKm),
            durationMinutes: Number(values.trail.durationMinutes),
            elevationGainM: Number(values.trail.elevationGainM),
          }
        : null,
    translations: {
      en: {
        ...values.translations.en,
        openingHoursNote: note(values.translations.en.openingHoursNote),
      },
      ...(values.withPortuguese
        ? { 'pt-BR': { ...pt, openingHoursNote: note(pt.openingHoursNote) } }
        : editing
          ? { 'pt-BR': null }
          : {}),
    },
  };
}

const selectClass = 'rounded-lg border border-navy-200 bg-white px-3 py-2.5';

export function PlaceForm({
  place,
  onSave,
}: {
  place?: AdminPlace;
  onSave: (body: ReturnType<typeof toPlaceBody>) => Promise<void>;
}) {
  const editing = Boolean(place);
  const cities = useAdminCities();
  const [failure, setFailure] = useState<{ message: string; extra: string[] } | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: toValues(place),
  });
  const [cityId, category, withPortuguese] = useWatch({
    control,
    name: ['cityId', 'category', 'withPortuguese'],
  });
  const districts = useAdminDistricts(cityId || undefined);
  // A district belongs to one city: changing the city clears it (the API would refuse it).
  const previousCity = useRef(cityId);
  useEffect(() => {
    if (previousCity.current !== cityId) setValue('districtId', '');
    previousCity.current = cityId;
  }, [cityId, setValue]);

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await onSave(toPlaceBody(values, editing));
    } catch (error) {
      const unmatched = applyFieldErrors(error, setError, FIELDS);
      setFailure({
        message: describeError(error),
        extra: unmatched.map((d) => `${d.field}: ${d.errors.join(' ')}`),
      });
    }
  });

  const textFields = (locale: 'en' | 'pt-BR') => {
    const e = errors.translations?.[locale];
    return (
      <>
        <TextField
          label="Name"
          error={e?.name?.message}
          {...register(`translations.${locale}.name`)}
        />
        <TextAreaField
          label="Description"
          error={e?.description?.message}
          {...register(`translations.${locale}.description`)}
        />
        <TextField
          label="Opening hours note"
          hint="Optional, e.g. “Closed on public holidays.”"
          error={e?.openingHoursNote?.message}
          {...register(`translations.${locale}.openingHoursNote`)}
        />
      </>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <ErrorBanner message={failure?.message ?? null} extra={failure?.extra} />

      <FormSection title="Place">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="place-city" className="text-sm font-semibold">
              City
            </label>
            <select
              id="place-city"
              className={selectClass}
              aria-invalid={errors.cityId ? true : undefined}
              {...register('cityId')}
            >
              <option value="">Choose…</option>
              {cities?.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.translations.en.name}
                </option>
              ))}
            </select>
            {errors.cityId ? (
              <p className="text-sm font-medium text-coral-600">{errors.cityId.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="place-district" className="text-sm font-semibold">
              District
            </label>
            <select
              id="place-district"
              className={selectClass}
              disabled={!cityId}
              {...register('districtId')}
            >
              <option value="">None</option>
              {districts?.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.translations.en.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="place-category" className="text-sm font-semibold">
              Category
            </label>
            <select
              id="place-category"
              className={selectClass}
              aria-invalid={errors.category ? true : undefined}
              {...register('category')}
            >
              <option value="">Choose…</option>
              {CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0) + value.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            {errors.category ? (
              <p className="text-sm font-medium text-coral-600">{errors.category.message}</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Slug"
            hint="Used in the URL: /places/<slug>."
            error={errors.slug?.message}
            {...register('slug')}
          />
          <TextField
            label="Korean name"
            lang="ko"
            error={errors.nameKo?.message}
            {...register('nameKo')}
          />
        </div>
        <TextField label="Address" error={errors.address?.message} {...register('address')} />
        <div className="grid gap-4 sm:grid-cols-4">
          <TextField
            label="Latitude"
            inputMode="decimal"
            error={errors.latitude?.message}
            {...register('latitude')}
          />
          <TextField
            label="Longitude"
            inputMode="decimal"
            error={errors.longitude?.message}
            {...register('longitude')}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="place-price" className="text-sm font-semibold">
              Price level
            </label>
            <select id="place-price" className={selectClass} {...register('priceLevel')}>
              {[1, 2, 3, 4].map((level) => (
                <option key={level} value={level}>
                  {'₩'.repeat(level)} ({level} of 4)
                </option>
              ))}
            </select>
          </div>
          <TextField
            label="Average spend (KRW)"
            hint="Per person; 0 = free."
            inputMode="numeric"
            error={errors.averageSpendKRW?.message}
            {...register('averageSpendKRW')}
          />
        </div>
        <TextField
          label="Website"
          hint="Optional, https only."
          error={errors.website?.message}
          {...register('website')}
        />
        <TextAreaField
          label="Image URLs"
          hint="One https:// URL per line (the first one is the cover). Hosts must be allowed in next.config.ts."
          error={errors.imageUrls?.message}
          {...register('imageUrls')}
        />
        <TextField
          label="Tags"
          hint="Comma-separated keys, e.g. street-food, night. New keys need a label in the web messages."
          error={errors.tags?.message}
          {...register('tags')}
        />
      </FormSection>

      {category === 'HIKING' ? (
        <FormSection title="Trail">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="trail-difficulty" className="text-sm font-semibold">
                Difficulty
              </label>
              <select
                id="trail-difficulty"
                className={selectClass}
                aria-invalid={errors.trail?.difficulty ? true : undefined}
                {...register('trail.difficulty')}
              >
                <option value="">Choose…</option>
                <option value="EASY">Easy</option>
                <option value="MODERATE">Moderate</option>
                <option value="HARD">Hard</option>
              </select>
              {errors.trail?.difficulty ? (
                <p className="text-sm font-medium text-coral-600">
                  {errors.trail.difficulty.message}
                </p>
              ) : null}
            </div>
            <TextField
              label="Distance (km)"
              inputMode="decimal"
              error={errors.trail?.distanceKm?.message}
              {...register('trail.distanceKm')}
            />
            <TextField
              label="Duration (minutes)"
              inputMode="numeric"
              error={errors.trail?.durationMinutes?.message}
              {...register('trail.durationMinutes')}
            />
            <TextField
              label="Elevation gain (m)"
              inputMode="numeric"
              error={errors.trail?.elevationGainM?.message}
              {...register('trail.elevationGainM')}
            />
          </div>
        </FormSection>
      ) : null}

      <FormSection title="Opening hours">
        <Controller
          control={control}
          name="openingHours"
          render={({ field }) => (
            <OpeningHoursEditor value={field.value ?? null} onChange={field.onChange} />
          )}
        />
        {errors.openingHours ? (
          <p className="text-sm font-medium text-coral-600">{errors.openingHours.message}</p>
        ) : null}
      </FormSection>

      <FormSection title="English (required)">{textFields('en')}</FormSection>
      <FormSection title="Portuguese (pt-BR)">
        <CheckboxField
          label="Has a Portuguese translation"
          hint={editing ? 'Unchecking removes it; Portuguese readers then see English.' : undefined}
          {...register('withPortuguese')}
        />
        {withPortuguese ? textFields('pt-BR') : null}
      </FormSection>

      <div>
        <button type="submit" disabled={isSubmitting} className={buttonClasses('primary')}>
          {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Create place'}
        </button>
      </div>
    </form>
  );
}
