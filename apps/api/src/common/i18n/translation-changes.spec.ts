import { BadRequestException } from '@nestjs/common';
import type { Locale } from '@korea-project/shared';
import { planTranslationChanges, translationsByLocale } from './translation-changes';

interface Text {
  name: string;
  description: string;
  note?: string | null;
}
const REQUIRED = ['name', 'description'] as const;
const en: Text = { name: 'Seoul', description: 'Capital' };

const errorCode = (fn: () => unknown) => {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(BadRequestException);
    return ((error as BadRequestException).getResponse() as { code: string }).code;
  }
  throw new Error('expected an error');
};

describe('planTranslationChanges', () => {
  const existing = new Map<Locale, Text>([['en', en]]);

  it('updating one locale leaves the other untouched', () => {
    const plan = planTranslationChanges(
      existing,
      { 'pt-BR': { name: 'Seul', description: 'Capital' } },
      REQUIRED,
    );

    expect(plan.deletes).toEqual([]);
    expect(plan.upserts).toEqual([
      {
        locale: 'pt-BR',
        create: { name: 'Seul', description: 'Capital' },
        update: { name: 'Seul', description: 'Capital' },
      },
    ]);
  });

  it('accepts partial fields for an existing translation, keeping the rest', () => {
    const plan = planTranslationChanges(existing, { en: { name: 'Seoul City' } }, REQUIRED);

    expect(plan.upserts).toEqual([
      {
        locale: 'en',
        create: { name: 'Seoul City', description: 'Capital' },
        update: { name: 'Seoul City' },
      },
    ]);
  });

  it('requires every field for a new translation', () => {
    expect(
      errorCode(() => planTranslationChanges(existing, { 'pt-BR': { name: 'Seul' } }, REQUIRED)),
    ).toBe('TRANSLATION_INCOMPLETE');
  });

  it('null removes an optional translation but never the default one', () => {
    const both = new Map<Locale, Text>([
      ['en', en],
      ['pt-BR', { name: 'Seul', description: 'Capital' }],
    ]);

    expect(planTranslationChanges(both, { 'pt-BR': null }, REQUIRED).deletes).toEqual(['pt-BR']);
    expect(planTranslationChanges(existing, { 'pt-BR': null }, REQUIRED).deletes).toEqual([]);
    expect(errorCode(() => planTranslationChanges(both, { en: null }, REQUIRED))).toBe(
      'DEFAULT_TRANSLATION_REQUIRED',
    );
  });

  it('ignores undefined fields (absent in the request)', () => {
    const plan = planTranslationChanges(
      existing,
      { en: { name: undefined, note: null } },
      REQUIRED,
    );

    expect(plan.upserts[0]?.update).toEqual({ note: null });
  });
});

describe('translationsByLocale', () => {
  it('maps rows to { locale: fields }, dropping unknown locales', () => {
    const rows = [
      { locale: 'en', name: 'Seoul', id: '1' },
      { locale: 'pt-BR', name: 'Seul', id: '2' },
      { locale: 'fr', name: 'Séoul', id: '3' },
    ];

    expect(translationsByLocale(rows, ['name'])).toEqual({
      en: { name: 'Seoul' },
      'pt-BR': { name: 'Seul' },
    });
  });
});
