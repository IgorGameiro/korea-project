import { BadRequestException } from '@nestjs/common';
import { DEFAULT_LOCALE, type Locale, LOCALES } from '@korea-project/shared';

/** Per-locale admin input: an object sets (some) fields, `null` removes that translation. */
export type TranslationChanges<T> = Partial<Record<Locale, Partial<T> | null | undefined>>;

export interface TranslationPlan<T> {
  /** Rows to create or update. `create` is complete; `update` only has the fields that were sent. */
  upserts: { locale: Locale; create: T; update: Partial<T> }[];
  deletes: Locale[];
}

const definedFields = <T>(value: Partial<T>): Partial<T> =>
  Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;

/**
 * Turns an admin request into row operations, without touching locales that were not sent:
 * updating only "pt-BR" never deletes or overwrites "en".
 * - An existing translation accepts partial fields.
 * - A new translation must include every required field.
 * - `null` deletes a translation, except the default locale, which is mandatory.
 */
export function planTranslationChanges<T extends object>(
  existing: ReadonlyMap<Locale, T>,
  changes: TranslationChanges<T>,
  requiredFields: readonly (keyof T)[],
): TranslationPlan<T> {
  const plan: TranslationPlan<T> = { upserts: [], deletes: [] };

  for (const locale of LOCALES) {
    const change = changes[locale];
    if (change === undefined) continue;

    if (change === null) {
      if (locale === DEFAULT_LOCALE) {
        throw new BadRequestException({
          code: 'DEFAULT_TRANSLATION_REQUIRED',
          message: `The "${DEFAULT_LOCALE}" translation cannot be removed`,
        });
      }
      if (existing.has(locale)) plan.deletes.push(locale);
      continue;
    }

    const update = definedFields(change);
    const current = existing.get(locale);
    if (current) {
      plan.upserts.push({ locale, create: { ...current, ...update }, update });
      continue;
    }

    const missing = requiredFields.filter((field) => update[field] === undefined);
    if (missing.length > 0) {
      throw new BadRequestException({
        code: 'TRANSLATION_INCOMPLETE',
        message: `A new "${locale}" translation needs every required field`,
        details: { locale, missing },
      });
    }
    plan.upserts.push({ locale, create: update as T, update });
  }
  return plan;
}

/** `{ en: {...}, "pt-BR": {...} }` from translation rows, keeping only the given fields. */
export function translationsByLocale<Row extends { locale: string }, K extends keyof Row>(
  rows: readonly Row[],
  fields: readonly K[],
): Partial<Record<Locale, Pick<Row, K>>> {
  const result: Partial<Record<Locale, Pick<Row, K>>> = {};
  for (const row of rows) {
    if (!(LOCALES as readonly string[]).includes(row.locale)) continue;
    result[row.locale as Locale] = Object.fromEntries(fields.map((f) => [f, row[f]])) as Pick<
      Row,
      K
    >;
  }
  return result;
}
