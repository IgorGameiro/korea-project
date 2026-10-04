'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { buttonClasses } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { TextAreaField, TextField } from '@/components/ui/text-field';
import type { ReviewDto } from '@/lib/api/types';
import { ReviewError, type ReviewErrorCode, type ReviewInput } from './reviews-api';

/** Today in Korea (where the visit happened), as YYYY-MM-DD. */
const todayInSeoul = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());

// Same limits as the API's CreateReviewDto (which validates again).
const schema = (t: (key: string) => string) =>
  z.object({
    // Radio values are strings ("4"): coerce. Nothing chosen gives 0, below the minimum.
    rating: z.coerce
      .number({ error: t('rating') })
      .int()
      .min(1, t('rating'))
      .max(5, t('rating')),
    title: z.string().trim().min(1, t('titleRequired')).max(120, t('titleMax')),
    comment: z.string().trim().min(1, t('commentRequired')).max(2000, t('commentMax')),
    visitedAt: z
      .string()
      .refine((value) => value === '' || value <= todayInSeoul(), t('visitedFuture')),
  });

type Schema = ReturnType<typeof schema>;

/** Create or edit form. `onSubmit` throws ReviewError; the form shows its message. */
export function ReviewForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: ReviewDto | null;
  onSubmit: (input: ReviewInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const t = useTranslations('reviews');
  const tv = useTranslations('reviews.validation');
  const tl = useTranslations('localeNames');
  const locale = useLocale() as ReviewInput['locale'];
  const [failure, setFailure] = useState<ReviewErrorCode | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.input<Schema>, unknown, z.output<Schema>>({
    resolver: zodResolver(schema(tv)),
    defaultValues: {
      rating: initial?.rating,
      title: initial?.title ?? '',
      comment: initial?.comment ?? '',
      visitedAt: initial?.visitedAt ?? '',
    },
  });
  const rating = Number(useWatch({ control, name: 'rating' }) ?? 0);

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      await onSubmit({
        rating: values.rating,
        title: values.title,
        comment: values.comment,
        visitedAt: values.visitedAt || undefined,
        // Editing keeps the language the review was written in.
        locale: (initial?.locale as ReviewInput['locale'] | undefined) ?? locale,
      });
    } catch (error) {
      setFailure(error instanceof ReviewError ? error.code : 'UNKNOWN');
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {failure ? (
        <p role="alert" className="rounded-lg bg-coral-50 p-3 text-sm font-medium text-coral-700">
          {t(`errors.${failure}`)}
        </p>
      ) : null}

      <fieldset aria-describedby={errors.rating ? 'rating-error' : undefined}>
        <legend className="mb-1 text-sm font-semibold">{t('rating')}</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className="cursor-pointer rounded-md p-0.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-coral-500"
            >
              <input type="radio" value={value} className="sr-only" {...register('rating')} />
              <Icon
                name="star"
                filled={rating >= value}
                className={`size-8 ${rating >= value ? 'text-amber-500' : 'text-navy-200'}`}
              />
              <span className="sr-only">{t('star', { count: value })}</span>
            </label>
          ))}
        </div>
        {errors.rating ? (
          <p id="rating-error" className="mt-1 text-sm font-medium text-coral-600">
            {errors.rating.message}
          </p>
        ) : null}
      </fieldset>

      <TextField
        label={t('title')}
        maxLength={120}
        error={errors.title?.message}
        {...register('title')}
      />
      <TextAreaField
        label={t('comment')}
        hint={t('commentHint')}
        maxLength={2000}
        error={errors.comment?.message}
        {...register('comment')}
      />
      <TextField
        type="date"
        label={t('visitedAt')}
        max={todayInSeoul()}
        error={errors.visitedAt?.message}
        {...register('visitedAt')}
      />
      {!initial ? (
        <p className="text-xs text-navy-700">{t('writtenIn', { language: tl(locale) })}</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={isSubmitting} className={buttonClasses('primary')}>
          {isSubmitting ? t('sending') : t(initial ? 'save' : 'submit')}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={buttonClasses('secondary')}>
            {t('cancel')}
          </button>
        ) : null}
      </div>
    </form>
  );
}
