'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { validatePhotos } from '@korea-project/shared';
import { z } from 'zod';
import { buttonClasses } from '@/components/ui/button';
import { TextAreaField, TextField } from '@/components/ui/text-field';
import type { components } from '@/lib/api/schema';
import { applyFieldErrors, describeError } from '../admin-api';
import { CheckboxField, ErrorBanner, FormSection } from '../form-parts';

export type AdminCity = components['schemas']['AdminCityDto'];
export type CreateCityBody = components['schemas']['CreateCityDto'];

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Required decimal: an empty field must not silently become 0 (the middle of the ocean). */
export const coordinate = (limit: number) =>
  z.coerce
    .string()
    .trim()
    .min(1, 'Required.')
    .transform(Number)
    .pipe(z.number({ error: 'A number.' }).min(-limit).max(limit));

// Mirrors the API's CreateCityDto; the API validates again and its messages land on these fields.
const text = z.object({
  name: z.string().trim().min(1, 'Required.').max(120, 'At most 120 characters.'),
  description: z.string().trim().min(1, 'Required.').max(2000, 'At most 2,000 characters.'),
  bestTimeToVisit: z.string().trim().min(1, 'Required.').max(500, 'At most 500 characters.'),
});

const schema = z.object({
  slug: z
    .string()
    .trim()
    .regex(SLUG, 'Lowercase words separated by hyphens (e.g. "jeju").')
    .max(80),
  nameKo: z.string().trim().min(1, 'Required.').max(80),
  heroImageUrl: z
    .string()
    .trim()
    .url('A full https:// URL.')
    .startsWith('https://', 'Use https.')
    .max(500),
  latitude: coordinate(90),
  longitude: coordinate(180),
  population: z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d+$/.test(value), 'A whole number, or empty.'),
  heroImageCredit: z.object({
    author: z.string().trim().max(300),
    license: z.string().trim().max(100),
    licenseUrl: z.string().trim().max(500),
    sourceUrl: z.string().trim().max(500),
  }),
  isFeatured: z.boolean(),
  sortOrder: z.coerce
    .string()
    .trim()
    .regex(/^-?\d+$/, 'A whole number.')
    .transform(Number),
  withPortuguese: z.boolean(),
  // Portuguese fields only have length limits here; they are required (all of them) only when
  // "Has a Portuguese translation" is checked (superRefine below). Hidden fields never block.
  translations: z.object({
    en: text,
    'pt-BR': z.object({
      name: z.string().trim().max(120, 'At most 120 characters.'),
      description: z.string().trim().max(2000, 'At most 2,000 characters.'),
      bestTimeToVisit: z.string().trim().max(500, 'At most 500 characters.'),
    }),
  }),
});

type Input = z.input<typeof schema>;
type Output = z.output<typeof schema>;

/** Every field path, to place the API's validation messages. */
const FIELDS = [
  'slug',
  'nameKo',
  'heroImageUrl',
  'heroImageCredit',
  'heroImageCredit.author',
  'heroImageCredit.license',
  'heroImageCredit.licenseUrl',
  'heroImageCredit.sourceUrl',
  'latitude',
  'longitude',
  'population',
  'isFeatured',
  'sortOrder',
  ...['en', 'pt-BR'].flatMap((l) =>
    ['name', 'description', 'bestTimeToVisit'].map((f) => `translations.${l}.${f}`),
  ),
];

/** Form fields -> PhotoCredit (an empty license link means none, as for public domain). */
const toCredit = (credit: {
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
}) => ({
  author: credit.author,
  license: credit.license,
  sourceUrl: credit.sourceUrl,
  licenseUrl: credit.licenseUrl || null,
});

const emptyText = { name: '', description: '', bestTimeToVisit: '' };

function toValues(city?: AdminCity): Input {
  const pt = city?.translations['pt-BR'];
  return {
    slug: city?.slug ?? '',
    nameKo: city?.nameKo ?? '',
    heroImageUrl: city?.heroImageUrl ?? '',
    heroImageCredit: {
      author: city?.heroImageCredit?.author ?? '',
      license: city?.heroImageCredit?.license ?? '',
      licenseUrl: city?.heroImageCredit?.licenseUrl ?? '',
      sourceUrl: city?.heroImageCredit?.sourceUrl ?? '',
    },
    latitude: city?.latitude ?? '',
    longitude: city?.longitude ?? '',
    population: city?.population?.toString() ?? '',
    isFeatured: city?.isFeatured ?? false,
    sortOrder: city?.sortOrder ?? 0,
    withPortuguese: Boolean(pt),
    translations: { en: city?.translations.en ?? emptyText, 'pt-BR': pt ?? emptyText },
  };
}

/** The request body. On edit, `pt-BR: null` removes the Portuguese translation. */
export function toBody(values: Output, editing: boolean) {
  const pt = values.translations['pt-BR'];
  const portuguese =
    values.withPortuguese && pt.name && pt.description && pt.bestTimeToVisit
      ? { name: pt.name, description: pt.description, bestTimeToVisit: pt.bestTimeToVisit }
      : undefined;
  return {
    slug: values.slug,
    nameKo: values.nameKo,
    heroImageUrl: values.heroImageUrl,
    ...(Object.values(values.heroImageCredit).some((value) => value !== '')
      ? { heroImageCredit: toCredit(values.heroImageCredit) }
      : editing
        ? { heroImageCredit: null }
        : {}),
    latitude: values.latitude,
    longitude: values.longitude,
    ...(values.population === '' ? {} : { population: Number(values.population) }),
    isFeatured: values.isFeatured,
    sortOrder: values.sortOrder,
    translations: {
      en: values.translations.en,
      ...(portuguese ? { 'pt-BR': portuguese } : editing ? { 'pt-BR': null } : {}),
    },
  };
}

export function CityForm({
  city,
  onSave,
}: {
  city?: AdminCity;
  onSave: (body: ReturnType<typeof toBody>) => Promise<void>;
}) {
  const editing = Boolean(city);
  const [failure, setFailure] = useState<{ message: string; extra: string[] } | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Input, unknown, Output>({
    resolver: zodResolver(
      schema.superRefine((values, ctx) => {
        // The hero credit is optional (placeholder photos), but complete when given.
        const credit = values.heroImageCredit;
        if (Object.values(credit).some((value) => value.trim() !== '')) {
          const problems = validatePhotos([{ url: 'https://x.invalid', credit: toCredit(credit) }]);
          for (const problem of problems) {
            const field = problem.match(/credit\.(\w+)/)?.[1] ?? 'author';
            ctx.addIssue({
              code: 'custom',
              path: ['heroImageCredit', field],
              message: problem.includes('required')
                ? 'Required with a credit.'
                : 'A full https:// URL.',
            });
          }
        }
        // Portuguese is optional, but all of it or nothing.
        if (!values.withPortuguese) return;
        for (const field of ['name', 'description', 'bestTimeToVisit'] as const) {
          if (!values.translations['pt-BR'][field]?.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['translations', 'pt-BR', field],
              message: 'Required.',
            });
          }
        }
      }),
    ),
    defaultValues: toValues(city),
  });
  const withPortuguese = useWatch({ control, name: 'withPortuguese' });
  const err = (path: string) =>
    path
      .split('.')
      .reduce<unknown>(
        (node, key) => (node as Record<string, unknown> | undefined)?.[key],
        errors,
      ) as { message?: string } | undefined;

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await onSave(toBody(values, editing));
    } catch (error) {
      const unmatched = applyFieldErrors(error, setError, FIELDS);
      setFailure({
        message: describeError(error),
        extra: unmatched.map((detail) => `${detail.field}: ${detail.errors.join(' ')}`),
      });
    }
  });

  const textFields = (locale: 'en' | 'pt-BR') => (
    <>
      <TextField
        label="Name"
        error={err(`translations.${locale}.name`)?.message}
        {...register(`translations.${locale}.name`)}
      />
      <TextAreaField
        label="Description"
        error={err(`translations.${locale}.description`)?.message}
        {...register(`translations.${locale}.description`)}
      />
      <TextField
        label="Best time to visit"
        error={err(`translations.${locale}.bestTimeToVisit`)?.message}
        {...register(`translations.${locale}.bestTimeToVisit`)}
      />
    </>
  );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <ErrorBanner message={failure?.message ?? null} extra={failure?.extra} />

      <FormSection title="City">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Slug"
            hint="Used in the URL: /cities/<slug>. Changing it breaks existing links."
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
        <TextField
          label="Hero image URL"
          hint="https only. The host must be allowed in next.config.ts (images.remotePatterns)."
          error={errors.heroImageUrl?.message}
          {...register('heroImageUrl')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Hero photo author"
            hint="Credit for real photos (e.g. from Wikimedia Commons). Leave the four fields empty for a placeholder."
            error={errors.heroImageCredit?.author?.message}
            {...register('heroImageCredit.author')}
          />
          <TextField
            label="Hero photo license"
            hint="e.g. CC BY-SA 4.0"
            error={errors.heroImageCredit?.license?.message}
            {...register('heroImageCredit.license')}
          />
          <TextField
            label="Hero photo license URL"
            hint="Optional for public domain."
            error={errors.heroImageCredit?.licenseUrl?.message}
            {...register('heroImageCredit.licenseUrl')}
          />
          <TextField
            label="Hero photo source page"
            error={errors.heroImageCredit?.sourceUrl?.message}
            {...register('heroImageCredit.sourceUrl')}
          />
        </div>
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
          <TextField
            label="Population"
            inputMode="numeric"
            error={errors.population?.message}
            {...register('population')}
          />
          <TextField
            label="Sort order"
            hint="Lower comes first."
            inputMode="numeric"
            error={errors.sortOrder?.message}
            {...register('sortOrder')}
          />
        </div>
        <CheckboxField label="Featured on the home page" {...register('isFeatured')} />
      </FormSection>

      <FormSection title="English (required)">{textFields('en')}</FormSection>

      <FormSection title="Portuguese (pt-BR)">
        <CheckboxField
          label="Has a Portuguese translation"
          hint={
            editing
              ? 'Unchecking removes it; the site then shows English to Portuguese readers.'
              : 'Without it, the site shows English to Portuguese readers.'
          }
          {...register('withPortuguese')}
        />
        {withPortuguese ? textFields('pt-BR') : null}
      </FormSection>

      <div>
        <button type="submit" disabled={isSubmitting} className={buttonClasses('primary')}>
          {isSubmitting ? 'Saving…' : editing ? 'Save changes' : 'Create city'}
        </button>
      </div>
    </form>
  );
}
