'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { buttonClasses } from '@/components/ui/button';
import { TextAreaField, TextField } from '@/components/ui/text-field';
import type { components } from '@/lib/api/schema';
import { applyFieldErrors, describeError } from '../admin-api';
import { coordinate } from '../cities/city-form';
import { ErrorBanner, FormSection } from '../form-parts';
import { useAdminCities, useAdminDistricts } from '../use-admin-data';

export type AdminStay = components['schemas']['AdminAccommodationDto'];
export type CreateStayBody = components['schemas']['CreateAccommodationDto'];

export const STAY_TYPES = ['HOTEL', 'HOSTEL', 'GUESTHOUSE', 'HANOK', 'APARTMENT'] as const;
export const TIERS = ['BUDGET', 'MID', 'LUXURY'] as const;
export const TIER_LABELS: Record<(typeof TIERS)[number], string> = {
  BUDGET: 'Budget',
  MID: 'Comfort',
  LUXURY: 'Luxury',
};

const HTTPS_URL = /^https:\/\/\S+$/;
const lines = (value: string) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const schema = z.object({
  cityId: z.string().min(1, 'Choose a city.'),
  districtId: z.string(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Lowercase words separated by hyphens.')
    .max(100),
  name: z.string().trim().min(1, 'Required.').max(160),
  type: z.enum(STAY_TYPES, { error: 'Choose a type.' }),
  tier: z.enum(TIERS, { error: 'Choose a style.' }),
  pricePerNightKRW: z.coerce
    .string()
    .trim()
    .regex(/^\d+$/, 'Whole won per night.')
    .transform(Number),
  latitude: coordinate(90),
  longitude: coordinate(180),
  bookingUrl: z
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
});

type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;
const FIELDS = Object.keys(schema.shape);

export function toStayBody(values: Output) {
  return {
    ...values,
    districtId: values.districtId || null,
    bookingUrl: values.bookingUrl || null,
    imageUrls: lines(values.imageUrls),
  };
}

const selectClass = 'rounded-lg border border-navy-200 bg-white px-3 py-2.5';

/** Stays have no translations: hotel names are proper names (see README, i18n). */
export function StayForm({
  stay,
  onSave,
}: {
  stay?: AdminStay;
  onSave: (body: ReturnType<typeof toStayBody>) => Promise<void>;
}) {
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
    defaultValues: {
      cityId: stay?.cityId ?? '',
      districtId: stay?.districtId ?? '',
      slug: stay?.slug ?? '',
      name: stay?.name ?? '',
      type: stay?.type,
      tier: stay?.tier,
      pricePerNightKRW: stay?.pricePerNightKRW ?? '',
      latitude: stay?.latitude ?? '',
      longitude: stay?.longitude ?? '',
      bookingUrl: stay?.bookingUrl ?? '',
      imageUrls: (stay?.imageUrls ?? []).join('\n'),
    },
  });
  const cityId = useWatch({ control, name: 'cityId' });
  const districts = useAdminDistricts(cityId || undefined);
  const previousCity = useRef(cityId);
  useEffect(() => {
    if (previousCity.current !== cityId) setValue('districtId', '');
    previousCity.current = cityId;
  }, [cityId, setValue]);

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await onSave(toStayBody(values));
    } catch (error) {
      const unmatched = applyFieldErrors(error, setError, FIELDS);
      setFailure({
        message: describeError(error),
        extra: unmatched.map((d) => `${d.field}: ${d.errors.join(' ')}`),
      });
    }
  });

  const select = (
    id: string,
    label: string,
    error: string | undefined,
    children: React.ReactNode,
    props: object,
  ) => (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select id={id} className={selectClass} aria-invalid={error ? true : undefined} {...props}>
        {children}
      </select>
      {error ? <p className="text-sm font-medium text-coral-600">{error}</p> : null}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <ErrorBanner message={failure?.message ?? null} extra={failure?.extra} />
      <FormSection title="Stay">
        <div className="grid gap-4 sm:grid-cols-2">
          {select(
            'stay-city',
            'City',
            errors.cityId?.message,
            <>
              <option value="">Choose…</option>
              {cities?.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.translations.en.name}
                </option>
              ))}
            </>,
            register('cityId'),
          )}
          {select(
            'stay-district',
            'District',
            undefined,
            <>
              <option value="">None</option>
              {districts?.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.translations.en.name}
                </option>
              ))}
            </>,
            { ...register('districtId'), disabled: !cityId },
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Name" error={errors.name?.message} {...register('name')} />
          <TextField label="Slug" error={errors.slug?.message} {...register('slug')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {select(
            'stay-type',
            'Type',
            errors.type?.message,
            <>
              <option value="">Choose…</option>
              {STAY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </>,
            register('type'),
          )}
          {select(
            'stay-tier',
            'Travel style',
            errors.tier?.message,
            <>
              <option value="">Choose…</option>
              {TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {TIER_LABELS[tier]}
                </option>
              ))}
            </>,
            register('tier'),
          )}
          <TextField
            label="Price per night (KRW)"
            inputMode="numeric"
            error={errors.pricePerNightKRW?.message}
            {...register('pricePerNightKRW')}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
        <TextField
          label="Booking URL"
          hint="Optional, https only."
          error={errors.bookingUrl?.message}
          {...register('bookingUrl')}
        />
        <TextAreaField
          label="Image URLs"
          hint="One https:// URL per line. Hosts must be allowed in next.config.ts."
          error={errors.imageUrls?.message}
          {...register('imageUrls')}
        />
      </FormSection>
      <div>
        <button type="submit" disabled={isSubmitting} className={buttonClasses('primary')}>
          {isSubmitting ? 'Saving…' : stay ? 'Save changes' : 'Create stay'}
        </button>
      </div>
    </form>
  );
}
