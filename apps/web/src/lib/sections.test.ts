import { describe, expect, it } from 'vitest';
import { categoryForSection, hasFilterParams, matchSectionPath } from './sections';

describe('sections', () => {
  it('maps section segments to categories (stays has none)', () => {
    expect(categoryForSection('hiking')).toBe('HIKING');
    expect(categoryForSection('cafes')).toBe('CAFE');
    expect(categoryForSection('stays')).toBeUndefined();
  });

  it('matches public section paths in both locales', () => {
    expect(matchSectionPath('/cities/seoul/hiking')).toBe(true);
    expect(matchSectionPath('/cities/seoul/stays/')).toBe(true);
    expect(matchSectionPath('/pt/cities/jeju/nature')).toBe(true);
    expect(matchSectionPath('/cities/seoul')).toBe(false);
    expect(matchSectionPath('/cities/seoul/unknown')).toBe(false);
    expect(matchSectionPath('/cities/seoul/hiking/filtered')).toBe(false);
    expect(matchSectionPath('/places/namsan')).toBe(false);
  });

  it('only known filter parameters count', () => {
    expect(hasFilterParams(new URLSearchParams('difficulty=easy'))).toBe(true);
    expect(hasFilterParams(new URLSearchParams('page=2'))).toBe(true);
    expect(hasFilterParams(new URLSearchParams('utm_source=newsletter'))).toBe(false);
  });
});
