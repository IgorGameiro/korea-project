import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installFakeApi, PASSWORD, USER } from '@/test/fake-auth-api';
import { renderWithApp } from '@/test/render';
import { AuthForm } from './auth-form';
import { login } from './actions';
import { resetSessionForTests } from './session';
import { SessionRestorer } from './session-restorer';
import { UserMenu } from './user-menu';

const replace = vi.fn();
let search = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => search,
}));
vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/cities/seoul',
  getPathname: ({ href, locale }: { href: string; locale: string }) =>
    locale === 'pt-BR' ? `/pt${href === '/' ? '' : href}` : href,
  Link: ({
    href,
    ...props
  }: Omit<ComponentProps<'a'>, 'href'> & {
    href: string | { pathname: string; query?: Record<string, string> };
  }) => (
    <a
      href={
        typeof href === 'string'
          ? href
          : `${href.pathname}?${new URLSearchParams(href.query ?? {}).toString()}`
      }
      {...props}
    />
  ),
}));

beforeEach(() => {
  resetSessionForTests();
  installFakeApi();
  replace.mockReset();
  search = new URLSearchParams();
});
afterEach(() => vi.unstubAllGlobals());

describe('UserMenu', () => {
  it('shows a neutral placeholder while restoring, then the user after a reload', async () => {
    await login({ email: USER.email, password: PASSWORD });
    resetSessionForTests(); // page reload

    renderWithApp(
      <>
        <SessionRestorer />
        <UserMenu />
      </>,
    );
    // Neutral: neither "Log in" nor the user yet.
    expect(screen.getByRole('status', { name: 'Checking your session' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Log in' })).toBeNull();

    expect(await screen.findByText(USER.name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('offers "Log in" (back to this page afterwards) when there is no session', async () => {
    renderWithApp(
      <>
        <SessionRestorer />
        <UserMenu />
      </>,
    );
    const link = await screen.findByRole('link', { name: 'Log in' });
    expect(link.getAttribute('href')).toBe(`/login?next=${encodeURIComponent('/')}`);
  });

  it('logs out', async () => {
    await login({ email: USER.email, password: PASSWORD });
    renderWithApp(<UserMenu />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    });
    expect(await screen.findByRole('link', { name: 'Log in' })).toBeInTheDocument();
  });
});

describe('AuthForm', () => {
  const fill = (label: string, value: string) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } });

  it('validates on the client with translated messages linked to the fields', async () => {
    renderWithApp(<AuthForm mode="register" />, { locale: 'pt-BR' });
    fill('Nome', 'A');
    fill('E-mail', 'not-an-email');
    fill('Senha', 'short');
    fireEvent.click(screen.getByRole('button', { name: 'Criar conta' }));

    expect(await screen.findByText('Use pelo menos 2 caracteres.')).toBeInTheDocument();
    expect(screen.getByText('Digite um e-mail válido.')).toBeInTheDocument();
    const password = screen.getByLabelText('Senha');
    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(password.getAttribute('aria-describedby')).toContain(
      screen.getByText('Use pelo menos 8 caracteres.').id,
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it('explains wrong credentials without saying which one was wrong', async () => {
    renderWithApp(<AuthForm mode="login" />);
    fill('Email', USER.email);
    fill('Password', 'wrong password');
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Wrong email or password.');
  });

  it('goes to a safe ?next= after logging in', async () => {
    search = new URLSearchParams({ next: '/pt/cities/seoul?x=1' });
    renderWithApp(<AuthForm mode="login" />);
    fill('Email', USER.email);
    fill('Password', PASSWORD);
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/pt/cities/seoul?x=1'));
  });

  it('ignores an unsafe ?next= and goes home', async () => {
    search = new URLSearchParams({ next: '/\\evil.example' });
    renderWithApp(<AuthForm mode="login" />, { locale: 'pt-BR' });
    fill('E-mail', USER.email);
    fill('Senha', PASSWORD);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/pt'));
  });
});
