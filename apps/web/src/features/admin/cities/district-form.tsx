'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { buttonClasses } from '@/components/ui/button';
import { TextAreaField, TextField } from '@/components/ui/text-field';
import type { components } from '@/lib/api/schema';
import { applyFieldErrors, describeError } from '../admin-api';
import { CheckboxField, ErrorBanner } from '../form-parts';
import { coordinate } from './city-form';

export type AdminDistrict = components['schemas']['AdminDistrictDto'];

const text = z.object({
  name: z.string().trim().min(1, 'Required.').max(120, 'At most 120 characters.'),
  description: z.string().trim().min(1, 'Required.').max(2000, 'At most 2,000 characters.'),
});
const schema = z
  .object({
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Lowercase words separated by hyphens.')
      .max(80),
    nameKo: z.string().trim().min(1, 'Required.').max(80),
    latitude: coordinate(90),
    longitude: coordinate(180),
    withPortuguese: z.boolean(),
    // Required only when "Has a Portuguese translation" is checked (superRefine below).
    translations: z.object({
      en: text,
      'pt-BR': z.object({
        name: z.string().trim().max(120, 'At most 120 characters.'),
        description: z.string().trim().max(2000, 'At most 2,000 characters.'),
      }),
    }),
  })
  .superRefine((values, ctx) => {
    if (!values.withPortuguese) return;
    for (const field of ['name', 'description'] as const) {
      if (!values.translations['pt-BR'][field]?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['translations', 'pt-BR', field],
          message: 'Required.',
        });
      }
    }
  });

type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;
const FIELDS = [
  'slug',
  'nameKo',
  'latitude',
  'longitude',
  'translations.en.name',
  'translations.en.description',
  'translations.pt-BR.name',
  'translations.pt-BR.description',
];

export function toDistrictBody(values: Output, editing: boolean) {
  const pt = values.translations['pt-BR'];
  const portuguese =
    values.withPortuguese && pt.name && pt.description
      ? { name: pt.name, description: pt.description }
      : undefined;
  return {
    slug: values.slug,
    nameKo: values.nameKo,
    latitude: values.latitude,
    longitude: values.longitude,
    translations: {
      en: values.translations.en,
      ...(portuguese ? { 'pt-BR': portuguese } : editing ? { 'pt-BR': null } : {}),
    },
  };
}

export function DistrictForm({
  district,
  onSave,
  onCancel,
}: {
  district?: AdminDistrict;
  onSave: (body: ReturnType<typeof toDistrictBody>) => Promise<void>;
  onCancel: () => void;
}) {
  const editing = Boolean(district);
  const [failure, setFailure] = useState<{ message: string; extra: string[] } | null>(null);
  const empty = { name: '', description: '' };
  const pt = district?.translations['pt-BR'];
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: {
      slug: district?.slug ?? '',
      nameKo: district?.nameKo ?? '',
      latitude: district?.latitude ?? '',
      longitude: district?.longitude ?? '',
      withPortuguese: Boolean(pt),
      translations: { en: district?.translations.en ?? empty, 'pt-BR': pt ?? empty },
    },
  });
  const withPortuguese = useWatch({ control, name: 'withPortuguese' });

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await onSave(toDistrictBody(values, editing));
    } catch (error) {
      const unmatched = applyFieldErrors(error, setError, FIELDS);
      setFailure({
        message: describeError(error),
        extra: unmatched.map((d) => `${d.field}: ${d.errors.join(' ')}`),
      });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <ErrorBanner message={failure?.message ?? null} extra={failure?.extra} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Slug" error={errors.slug?.message} {...register('slug')} />
        <TextField
          label="Korean name"
          lang="ko"
          error={errors.nameKo?.message}
          {...register('nameKo')}
        />
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
        label="Name (English)"
        error={errors.translations?.en?.name?.message}
        {...register('translations.en.name')}
      />
      <TextAreaField
        label="Description (English)"
        error={errors.translations?.en?.description?.message}
        {...register('translations.en.description')}
      />
      <CheckboxField label="Has a Portuguese translation" {...register('withPortuguese')} />
      {withPortuguese ? (
        <>
          <TextField
            label="Name (Portuguese)"
            error={errors.translations?.['pt-BR']?.name?.message}
            {...register('translations.pt-BR.name')}
          />
          <TextAreaField
            label="Description (Portuguese)"
            error={errors.translations?.['pt-BR']?.description?.message}
            {...register('translations.pt-BR.description')}
          />
        </>
      ) : null}
      <div className="flex gap-3">
        <button type="submit" disabled={isSubmitting} className={buttonClasses('primary')}>
          {isSubmitting ? 'Saving…' : editing ? 'Save district' : 'Add district'}
        </button>
        <button type="button" onClick={onCancel} className={buttonClasses('secondary')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
