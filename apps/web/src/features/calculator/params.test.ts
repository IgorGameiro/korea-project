import { describe, expect, it } from 'vitest';
import { parsePlanParams, planQuery } from './params';

const slugs = ['seoul', 'busan', 'jeju'];
const parse = (query: string) => parsePlanParams(new URLSearchParams(query), slugs);

describe('parsePlanParams', () => {
  it('reads a valid plan', () => {
    expect(parse('city=busan&people=3&days=7&tier=luxury')).toEqual({
      citySlug: 'busan',
      people: 3,
      days: 7,
      tier: 'LUXURY',
    });
  });

  it('uses the defaults when nothing is given', () => {
    expect(parse('')).toEqual({ citySlug: 'seoul', people: 2, days: 5, tier: 'MID' });
  });

  it.each([
    ['unknown city', 'city=atlantis', { citySlug: 'seoul' }],
    ['zero people', 'people=0', { people: 2 }],
    ['too many people', 'people=21', { people: 2 }],
    ['decimal days', 'days=2.5', { days: 5 }],
    ['negative days', 'days=-3', { days: 5 }],
    ['too many days', 'days=31', { days: 5 }],
    ['not a number', 'people=two&days=1e1', { people: 2, days: 5 }],
    ['unknown tier', 'tier=premium', { tier: 'MID' }],
  ])('falls back to the default for %s', (_case, query, expected) => {
    expect(parse(query)).toMatchObject(expected);
  });

  it('accepts the limits themselves', () => {
    expect(parse('people=1&days=1')).toMatchObject({ people: 1, days: 1 });
    expect(parse('people=20&days=30')).toMatchObject({ people: 20, days: 30 });
  });

  it('writes a normalized query', () => {
    expect(planQuery(parse('days=99&tier=BUDGET&city=jeju'))).toBe(
      'city=jeju&people=2&days=5&tier=budget',
    );
  });
});
