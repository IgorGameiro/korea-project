import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_CURRENCY_BY_LOCALE,
  DEFAULT_LOCALE,
  isDisplayCurrency,
  isLocale,
  LOCALES,
} from './i18n.ts';

describe('i18n', () => {
  it('the default locale is supported and every locale has a default currency', () => {
    assert.ok(LOCALES.includes(DEFAULT_LOCALE));
    for (const locale of LOCALES) assert.ok(isDisplayCurrency(DEFAULT_CURRENCY_BY_LOCALE[locale]));
  });

  it('accepts only exact BCP 47 tags we support', () => {
    assert.equal(isLocale('en'), true);
    assert.equal(isLocale('pt-BR'), true);
    assert.equal(isLocale('pt'), false);
    assert.equal(isLocale('PT-br'), false);
    assert.equal(isLocale(undefined), false);
  });

  it('accepts only supported display currencies', () => {
    assert.equal(isDisplayCurrency('USD'), true);
    assert.equal(isDisplayCurrency('KRW'), false);
  });
});
