import { matchAcceptLanguage, normalizeLocale, resolveLocale } from './locale';
import { localesToLoad, pickTranslation } from './translations';

describe('resolveLocale', () => {
  it('uses a valid ?locale= and ignores the header (no Vary needed)', () => {
    expect(resolveLocale('pt-BR', 'en')).toEqual({ locale: 'pt-BR', fromHeader: false });
  });

  it('is case-insensitive for ?locale=', () => {
    expect(resolveLocale('PT-br', undefined).locale).toBe('pt-BR');
  });

  it('falls back to en for an unsupported ?locale= without consulting the header', () => {
    expect(resolveLocale('xx', 'pt-BR')).toEqual({ locale: 'en', fromHeader: false });
    expect(resolveLocale('', 'pt-BR')).toEqual({ locale: 'en', fromHeader: false });
  });

  it('uses the first value when ?locale= is repeated', () => {
    expect(resolveLocale(['pt-BR', 'en'], undefined).locale).toBe('pt-BR');
  });

  it('uses Accept-Language when ?locale= is absent', () => {
    expect(resolveLocale(undefined, 'pt-BR,pt;q=0.9')).toEqual({
      locale: 'pt-BR',
      fromHeader: true,
    });
  });

  it('defaults to en when there is no input, still depending on the header', () => {
    expect(resolveLocale(undefined, undefined)).toEqual({ locale: 'en', fromHeader: true });
  });
});

describe('matchAcceptLanguage', () => {
  it.each([
    ['pt-BR', 'pt-BR'],
    ['pt', 'pt-BR'],
    ['pt-PT', 'pt-BR'],
    ['en-GB,en;q=0.8', 'en'],
    ['fr-FR, pt;q=0.5, en;q=0.4', 'pt-BR'],
    ['en;q=0.2, pt-BR;q=0.9', 'pt-BR'],
  ])('%s -> %s', (header, expected) => {
    expect(matchAcceptLanguage(header)).toBe(expected);
  });

  it.each([['fr-FR,de;q=0.9'], ['*'], ['pt-BR;q=0'], ['']])('%p -> no match', (header) => {
    expect(matchAcceptLanguage(header)).toBeUndefined();
  });
});

describe('normalizeLocale', () => {
  it('only accepts supported tags', () => {
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('pt')).toBeUndefined();
    expect(normalizeLocale(42)).toBeUndefined();
  });
});

describe('translations', () => {
  const rows = [
    { locale: 'en', name: 'Seoul' },
    { locale: 'pt-BR', name: 'Seul' },
  ];

  it('picks the requested locale, else the default one', () => {
    expect(pickTranslation(rows, 'pt-BR')?.name).toBe('Seul');
    expect(pickTranslation([rows[0]], 'pt-BR')?.name).toBe('Seoul');
    expect(pickTranslation([], 'en')).toBeUndefined();
  });

  it('loads the default locale alongside the requested one for fallback', () => {
    expect(localesToLoad('en')).toEqual(['en']);
    expect(localesToLoad('pt-BR')).toEqual(['pt-BR', 'en']);
  });
});
