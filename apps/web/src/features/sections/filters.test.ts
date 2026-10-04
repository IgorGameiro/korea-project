import { describe, expect, it } from 'vitest';
import {
  parsePlaceFilters,
  parseStayFilters,
  placeFiltersQuery,
  stayFiltersQuery,
} from './filters';

const districts = [
  { id: 'd-hongdae', slug: 'hongdae' },
  { id: 'd-gangnam', slug: 'gangnam' },
];

describe('parsePlaceFilters', () => {
  it('reads valid filters', () => {
    expect(
      parsePlaceFilters(
        {
          district: 'hongdae',
          price: '2,1',
          rating: '4.5',
          difficulty: 'easy',
          sort: 'price',
          page: '2',
        },
        { districts, category: 'HIKING' },
      ),
    ).toEqual({
      district: districts[0],
      price: [1, 2],
      rating: 4.5,
      difficulty: 'EASY',
      sort: 'price',
      page: 2,
    });
  });

  it('falls back to defaults for every invalid value', () => {
    expect(
      parsePlaceFilters(
        {
          district: 'atlantis',
          price: '0,5,x',
          rating: '4.2',
          difficulty: 'extreme',
          sort: 'name',
          page: '0',
        },
        { districts, category: 'HIKING' },
      ),
    ).toEqual({
      district: undefined,
      price: [],
      rating: undefined,
      difficulty: undefined,
      sort: 'rating',
      page: 1,
    });
  });

  it('accepts repeated checkbox values and drops duplicates', () => {
    expect(
      parsePlaceFilters({ price: ['3', '1', '3'] }, { districts, category: 'RESTAURANT' }).price,
    ).toEqual([1, 3]);
  });

  it('ignores difficulty outside the hiking section', () => {
    expect(
      parsePlaceFilters({ difficulty: 'easy' }, { districts, category: 'CAFE' }).difficulty,
    ).toBeUndefined();
  });
});

describe('parseStayFilters', () => {
  it('reads valid filters case-insensitively', () => {
    expect(
      parseStayFilters(
        { district: 'gangnam', tier: 'luxury', type: 'HANOK', sort: 'price-desc' },
        { districts },
      ),
    ).toEqual({ district: districts[1], tier: 'LUXURY', type: 'HANOK', sort: '-price', page: 1 });
  });

  it('falls back to defaults for invalid values', () => {
    expect(
      parseStayFilters({ tier: 'cheap', type: 'castle', sort: 'x', page: '1001' }, { districts }),
    ).toEqual({
      district: undefined,
      tier: undefined,
      type: undefined,
      sort: 'price',
      page: 1,
    });
  });
});

describe('filter queries', () => {
  it('leave defaults out, so no filter means no query string', () => {
    expect(placeFiltersQuery(parsePlaceFilters({}, { districts, category: 'HIKING' }))).toEqual({});
    expect(stayFiltersQuery(parseStayFilters({}, { districts }))).toEqual({});
  });

  it('round-trip through the URL and change only the page', () => {
    const filters = parsePlaceFilters(
      { district: 'hongdae', price: '1,2', difficulty: 'hard' },
      { districts, category: 'HIKING' },
    );
    expect(placeFiltersQuery(filters, 3)).toEqual({
      district: 'hongdae',
      price: '1,2',
      difficulty: 'hard',
      page: '3',
    });
    const stays = parseStayFilters({ tier: 'mid', sort: 'price-desc' }, { districts });
    expect(stayFiltersQuery(stays, 2)).toEqual({ tier: 'mid', sort: 'price-desc', page: '2' });
  });
});
