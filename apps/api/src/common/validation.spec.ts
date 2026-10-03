import { escapeLike, toCommaList } from './validation';

describe('escapeLike', () => {
  it('escapes %, _ and the escape character itself', () => {
    expect(escapeLike('100%')).toBe('100\\%');
    expect(escapeLike('a_b')).toBe('a\\_b');
    expect(escapeLike('back\\slash')).toBe('back\\\\slash');
    expect(escapeLike('seoul')).toBe('seoul');
  });
});

describe('toCommaList', () => {
  it('splits, trims and drops empty items; accepts repeated params', () => {
    expect(toCommaList({ value: '1, 2,,3' })).toEqual(['1', '2', '3']);
    expect(toCommaList({ value: ['a,b', 'c'] })).toEqual(['a', 'b', 'c']);
    expect(toCommaList({ value: '' })).toEqual([]);
  });
});
