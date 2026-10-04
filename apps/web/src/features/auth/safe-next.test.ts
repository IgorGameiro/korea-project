import { describe, expect, it } from 'vitest';
import { safeNext } from './safe-next';

describe('safeNext', () => {
  it('keeps internal paths with their query and hash', () => {
    expect(safeNext('/cities/seoul')).toBe('/cities/seoul');
    expect(safeNext('/pt/cities/seoul/hiking?difficulty=easy#map')).toBe(
      '/pt/cities/seoul/hiking?difficulty=easy#map',
    );
  });

  it.each([
    ['empty', ''],
    ['missing', null],
    ['absolute URL', 'https://evil.example/'],
    ['javascript: URL', 'javascript:alert(1)'],
    ['relative path', 'cities/seoul'],
    ['protocol-relative', '//evil.example'],
    ['protocol-relative with path', '//evil.example/cities'],
    ['backslash host', '/\\evil.example'],
    ['double backslash', '/\\\\evil.example'],
    ['backslash later in the path', '/cities\\..\\..\\evil'],
    ['tab trick', '/\t/evil.example'],
    ['newline trick', '/\n/evil.example'],
  ])('rejects %s', (_case, value) => {
    expect(safeNext(value)).toBeNull();
  });

  it('keeps percent-encoded slashes inside the path (still this site)', () => {
    expect(safeNext('/%2F%2Fevil.example')).toBe('/%2F%2Fevil.example');
  });

  it('never sends you back to the auth pages', () => {
    expect(safeNext('/login')).toBeNull();
    expect(safeNext('/pt/register?next=/x')).toBeNull();
    expect(safeNext('/login-help')).toBe('/login-help');
  });
});
