import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountView } from '@/features/account/account-view';
import { endSession, resetSessionForTests, startSession } from '@/features/auth/session';
import type { PlaceSummaryDto } from '@/lib/api/types';
import { renderWithApp } from '@/test/render';
import { FavoriteButton } from './favorite-button';
import { resetFavoritesForTests } from './favorites-store';

const replace = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/account',
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

const place = (n: number): PlaceSummaryDto => ({
  id: `p${n}`,
  slug: `place-${n}`,
  locale: 'en',
  category: 'ATTRACTION',
  name: `Place ${n}`,
  nameKo: '장소',
  description: 'A place.',
  cityId: 'c1',
  latitude: 37.5,
  longitude: 127,
  priceLevel: 1,
  averageSpendKRW: 0,
  ratingAvg: 0,
  ratingCount: 0,
  tags: [],
});

function installFavoritesApi({ favorites = ['p2'], failWrites = false } = {}) {
  const ids = new Set(favorites);
  const calls: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      const url = new URL(request.url);
      calls.push(`${request.method} ${url.pathname}`);
      if (url.pathname === '/api/v1/users/me/favorites/ids') {
        return Response.json({ placeIds: [...ids] });
      }
      if (url.pathname === '/api/v1/users/me/favorites') {
        const data = [...ids].map((id) => place(Number(id.slice(1))));
        return Response.json({
          data,
          meta: { page: 1, limit: 12, total: data.length, totalPages: 1 },
        });
      }
      if (url.pathname === '/api/v1/users/me/reviews') {
        return Response.json({
          data: [
            {
              id: 'r1',
              placeId: 'p9',
              rating: 5,
              title: 'Imperdível',
              comment: '…',
              locale: 'pt-BR',
              visitedAt: null,
              createdAt: '2026-10-01T12:00:00Z',
              updatedAt: '2026-10-01T12:00:00Z',
              author: { id: 'u1', name: 'Ana' },
              place: { id: 'p9', slug: 'place-9', name: 'Place 9' },
            },
          ],
          meta: { page: 1, limit: 12, total: 1, totalPages: 1 },
        });
      }
      const match = /^\/api\/v1\/places\/(\w+)\/favorite$/.exec(url.pathname);
      if (match?.[1]) {
        if (failWrites) return Response.json({ error: { code: 'INTERNAL' } }, { status: 500 });
        if (request.method === 'POST') ids.add(match[1]);
        else ids.delete(match[1]);
        return new Response(null, { status: 204 });
      }
      return Response.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
    }),
  );
  return { calls, idRequests: () => calls.filter((c) => c.endsWith('/favorites/ids')).length };
}

const signIn = () =>
  act(() => {
    startSession({
      accessToken: 'test-access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 'u1',
        name: 'Ana Souza',
        email: 'ana@example.com',
        role: 'USER',
        createdAt: '2026-01-15T00:00:00Z',
      },
    });
  });

beforeEach(() => {
  resetSessionForTests();
  resetFavoritesForTests();
  replace.mockReset();
});
afterEach(() => vi.unstubAllGlobals());

const hearts = () => (
  <>
    {[1, 2, 3].map((n) => (
      <FavoriteButton key={n} placeId={`p${n}`} placeName={`Place ${n}`} variant="card" />
    ))}
  </>
);

describe('FavoriteButton', () => {
  it('is neutral while the session is restoring (no button, no link)', () => {
    installFavoritesApi();
    renderWithApp(hearts());
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('asks anonymous visitors to log in', () => {
    installFavoritesApi();
    act(() => endSession());
    renderWithApp(hearts());
    expect(
      screen.getByRole('link', { name: 'Log in to save Place 1 to favorites' }),
    ).toHaveAttribute('href', `/login?next=${encodeURIComponent('/')}`);
  });

  it('marks every heart on the page with a single request', async () => {
    const api = installFavoritesApi({ favorites: ['p2'] });
    signIn();
    renderWithApp(hearts());
    const saved = await screen.findByRole('button', { name: 'Save Place 2 to favorites' });
    expect(saved).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Save Place 1 to favorites' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(api.idRequests()).toBe(1);
  });

  it('toggles optimistically and keeps every heart of the same place in sync', async () => {
    const api = installFavoritesApi({ favorites: [] });
    signIn();
    renderWithApp(
      <>
        <FavoriteButton placeId="p1" placeName="Place 1" />
        <FavoriteButton placeId="p1" placeName="Place 1" variant="card" />
      </>,
    );
    const [full, card] = await screen.findAllByRole('button', {
      name: 'Save Place 1 to favorites',
    });
    fireEvent.click(full!);
    expect(full).toHaveAttribute('aria-pressed', 'true'); // before the API answers
    expect(card).toHaveAttribute('aria-pressed', 'true');
    // The visible text stays "Save": the state is announced by aria-pressed (and drawn by the heart).
    expect(full).toHaveTextContent('Save');
    await waitFor(() => expect(api.calls).toContain('POST /api/v1/places/p1/favorite'));

    fireEvent.click(card!);
    await waitFor(() => expect(api.calls).toContain('DELETE /api/v1/places/p1/favorite'));
    expect(full).toHaveAttribute('aria-pressed', 'false');
  });

  it('flips back and says so when the API refuses', async () => {
    installFavoritesApi({ favorites: [], failWrites: true });
    signIn();
    renderWithApp(<FavoriteButton placeId="p1" placeName="Place 1" />);
    const button = await screen.findByRole('button', { name: 'Save Place 1 to favorites' });
    fireEvent.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not update your favorites.');
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('forgets the previous user after logging out', async () => {
    installFavoritesApi({ favorites: ['p1'] });
    signIn();
    renderWithApp(<FavoriteButton placeId="p1" placeName="Place 1" />);
    expect(
      await screen.findByRole('button', { name: 'Save Place 1 to favorites' }),
    ).toHaveAttribute('aria-pressed', 'true');
    act(() => endSession());
    expect(
      await screen.findByRole('link', { name: 'Log in to save Place 1 to favorites' }),
    ).toBeInTheDocument();
  });
});

describe('AccountView', () => {
  it('sends anonymous visitors to the login page, back to /account afterwards', async () => {
    installFavoritesApi();
    act(() => endSession());
    renderWithApp(<AccountView />);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith({ pathname: '/login', query: { next: '/' } }),
    );
  });

  it('shows the profile, favorites and my reviews; an unfavorited place leaves the list', async () => {
    installFavoritesApi({ favorites: ['p1', 'p2'] });
    signIn();
    renderWithApp(<AccountView />, { locale: 'pt-BR' });

    expect(screen.getByRole('heading', { name: 'Minha conta', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Membro desde janeiro de 2026')).toBeInTheDocument();
    const favoritesPanel = screen.getByRole('tabpanel', { name: 'Favoritos' });
    expect(
      await within(favoritesPanel).findByRole('heading', { name: 'Place 1' }),
    ).toBeInTheDocument();

    fireEvent.click(
      await within(favoritesPanel).findByRole('button', { name: 'Salvar Place 1 nos favoritos' }),
    );
    await waitFor(() =>
      expect(within(favoritesPanel).queryByRole('heading', { name: 'Place 1' })).toBeNull(),
    );
    expect(within(favoritesPanel).getByRole('heading', { name: 'Place 2' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Minhas avaliações' }));
    const reviewsPanel = screen.getByRole('tabpanel', { name: 'Minhas avaliações' });
    expect(within(reviewsPanel).getByRole('link', { name: 'Sobre Place 9' })).toHaveAttribute(
      'href',
      '/places/place-9',
    );
    expect(within(reviewsPanel).getByText('Imperdível')).toHaveAttribute('lang', 'pt-BR');
  });
});
