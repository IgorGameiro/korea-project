import { convertKRW, formatMoney } from './format';

// Intl output uses non-breaking spaces in some locales; normalize them for readable assertions.
const plain = (s: string) => s.replace(/ | /g, ' ');

describe('formatMoney', () => {
  it('formats KRW without decimals', () => {
    expect(plain(formatMoney(1_250_000, 'KRW', 'en'))).toBe('₩1,250,000');
  });

  it('formats USD and BRL with cents, in the reader locale', () => {
    expect(plain(formatMoney(2037.6, 'USD', 'en'))).toBe('$2,037.60');
    expect(plain(formatMoney(11037, 'BRL', 'pt-BR'))).toBe('R$ 11.037,00');
  });
});

describe('convertKRW', () => {
  it('rounds to cents like the API', () => {
    expect(convertKRW(1_000_000, 0.00072)).toBe(720);
    expect(convertKRW(404_285.71, 0.00072)).toBe(291.09);
  });
});
