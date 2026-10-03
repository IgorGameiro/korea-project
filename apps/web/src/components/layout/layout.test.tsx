import { fireEvent, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { vi } from 'vitest';
import { renderWithApp } from '@/test/render';
import { CurrencySwitcher } from './currency-switcher';
import { LanguageSwitcher } from './language-switcher';

// next-intl's navigation helpers need the Next router; emulate them: English has no prefix,
// Portuguese lives under /pt.
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/cities/seoul',
  Link: ({ href, locale, ...props }: ComponentProps<'a'> & { href: string; locale?: string }) => (
    <a href={locale === 'pt-BR' ? `/pt${href}` : href} {...props} />
  ),
}));

describe('LanguageSwitcher', () => {
  it('links to the current page in every language and marks the current one', () => {
    renderWithApp(<LanguageSwitcher />, { locale: 'pt-BR' });

    const en = screen.getByRole('link', { name: /English/ });
    const pt = screen.getByRole('link', { name: /Português/ });
    expect(en).toHaveAttribute('href', '/cities/seoul');
    expect(en).toHaveAttribute('hreflang', 'en');
    expect(pt).toHaveAttribute('href', '/pt/cities/seoul');
    expect(pt).toHaveAttribute('aria-current', 'true');
    expect(en).not.toHaveAttribute('aria-current');
  });
});

describe('CurrencySwitcher', () => {
  afterEach(() => {
    document.cookie = 'currency=; Path=/; Max-Age=0';
  });

  it('is a labelled select that saves the choice', () => {
    renderWithApp(<CurrencySwitcher />);
    const select = screen.getByRole('combobox', { name: 'Change currency' });

    expect(select).toHaveValue('USD');
    fireEvent.change(select, { target: { value: 'BRL' } });
    expect(select).toHaveValue('BRL');
    expect(document.cookie).toContain('currency=BRL');
  });
});
