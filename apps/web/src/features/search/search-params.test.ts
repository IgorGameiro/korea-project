import { describe, expect, it } from 'vitest';
import { parseSearchParams } from './search-params';

describe('parseSearchParams', () => {
  it('trims the term and keeps valid filters', () => {
    expect(parseSearchParams({ q: '  bibimbap ', category: 'RESTAURANT', page: '2' })).toEqual({
      q: 'bibimbap',
      category: 'RESTAURANT',
      page: 2,
      problem: undefined,
      searchable: true,
    });
  });

  it('falls back to defaults for an invalid category or page', () => {
    for (const page of ['0', '-1', '1.5', 'abc', '1001', undefined]) {
      expect(parseSearchParams({ q: 'busan', category: 'SPA', page })).toMatchObject({
        category: undefined,
        page: 1,
        searchable: true,
      });
    }
  });

  it('uses the first value when a parameter is repeated', () => {
    expect(parseSearchParams({ q: ['seoul', 'busan'], page: ['3', '4'] })).toMatchObject({
      q: 'seoul',
      page: 3,
    });
  });

  it('reports terms outside 2–100 characters and does not search them', () => {
    expect(parseSearchParams({ q: ' a ' })).toMatchObject({
      problem: 'tooShort',
      searchable: false,
    });
    expect(parseSearchParams({ q: 'x'.repeat(101) })).toMatchObject({
      problem: 'tooLong',
      searchable: false,
    });
    expect(parseSearchParams({ q: 'ab' }).searchable).toBe(true);
    expect(parseSearchParams({ q: 'x'.repeat(100) }).searchable).toBe(true);
  });

  it('a category alone is searchable, an empty request is not', () => {
    expect(parseSearchParams({ category: 'HIKING' })).toMatchObject({ q: '', searchable: true });
    expect(parseSearchParams({})).toMatchObject({ searchable: false, problem: undefined });
  });

  it('a short term with a category is still rejected (the API would answer 400)', () => {
    expect(parseSearchParams({ q: 'a', category: 'HIKING' }).searchable).toBe(false);
  });
});
