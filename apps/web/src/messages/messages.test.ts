import { LOCALES } from '@korea-project/shared';
import { describe, expect, it } from 'vitest';
import en from './en.json';

/** Every key path of a messages object ("city.sections.hiking"). */
const keys = (value: unknown, prefix = ''): string[] =>
  value && typeof value === 'object'
    ? Object.entries(value).flatMap(([key, child]) =>
        keys(child, prefix ? `${prefix}.${key}` : key),
      )
    : [prefix];

describe('messages', () => {
  it.each(LOCALES.filter((locale) => locale !== 'en'))(
    '%s has exactly the keys of en',
    async (locale) => {
      const messages = (await import(`./${locale}.json`)).default;
      expect(keys(messages).sort()).toEqual(keys(en).sort());
    },
  );
});
