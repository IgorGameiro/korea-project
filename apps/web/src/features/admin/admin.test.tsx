import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { endSession, resetSessionForTests, startSession } from '@/features/auth/session';
import { renderWithApp } from '@/test/render';
import { AdminGuard } from './admin-guard';
import { CitiesList } from './cities/cities-list';
import { CityEditor } from './cities/city-editor';
import { type AdminCity, CityForm } from './cities/city-form';

const replace = vi.fn();
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/admin/cities',
  Link: ({ href, ...props }: Omit<ComponentProps<'a'>, 'href'> & { href: string }) => (
    <a href={href} {...props} />
  ),
}));

const seoul: AdminCity = {
  id: 'c1',
  slug: 'seoul',
  nameKo: '서울',
  heroImageUrl: 'https://picsum.photos/seed/seoul/1600/900',
  latitude: 37.5665,
  longitude: 126.978,
  population: 9_400_000,
  isFeatured: true,
  sortOrder: 1,
  translations: {
    en: { name: 'Seoul', description: 'Capital.', bestTimeToVisit: 'Spring.' },
    'pt-BR': { name: 'Seul', description: 'Capital.', bestTimeToVisit: 'Primavera.' },
  },
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
};

const signIn = (role: 'USER' | 'ADMIN') =>
  act(() =>
    startSession({
      accessToken: 'test-access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 'u1',
        name: 'Admin',
        email: 'a@example.com',
        role,
        createdAt: '2026-01-01T00:00:00Z',
      },
    }),
  );

type Handler = (request: Request, body: unknown) => Response | Promise<Response>;
const calls: { method: string; path: string; body: unknown }[] = [];
function installApi(handler: Handler) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      const url = new URL(request.url);
      const text = request.method === 'GET' ? '' : await request.text();
      const body = text ? JSON.parse(text) : undefined;
      calls.push({ method: request.method, path: url.pathname + url.search, body });
      return handler(request, body);
    }),
  );
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});
beforeEach(() => {
  resetSessionForTests();
  replace.mockReset();
  calls.length = 0;
});
afterEach(() => vi.unstubAllGlobals());

describe('AdminGuard', () => {
  const guarded = (
    <AdminGuard>
      <p>secret admin content</p>
    </AdminGuard>
  );

  it('shows nothing of the admin while the session restores', () => {
    renderWithApp(guarded);
    expect(screen.queryByText('secret admin content')).toBeNull();
  });

  it('sends anonymous visitors to the login page', async () => {
    act(() => endSession());
    renderWithApp(guarded);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith({ pathname: '/login', query: { next: '/' } }),
    );
    expect(screen.queryByText('secret admin content')).toBeNull();
  });

  it('denies signed-in users without the ADMIN role', () => {
    signIn('USER');
    renderWithApp(guarded);
    expect(screen.getByRole('alert')).toHaveTextContent('Access denied');
    expect(screen.queryByText('secret admin content')).toBeNull();
  });

  it('lets administrators in', () => {
    signIn('ADMIN');
    renderWithApp(guarded);
    expect(screen.getByText('secret admin content')).toBeInTheDocument();
  });
});

describe('CityForm', () => {
  const fill = (label: string, value: string) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } });

  it('requires coordinates (an empty field is not 0) and validates the slug', async () => {
    const onSave = vi.fn<(body: unknown) => Promise<void>>(async () => undefined);
    renderWithApp(<CityForm onSave={onSave} />);
    fill('Slug', 'Jeju Island');
    fireEvent.click(screen.getByRole('button', { name: 'Create city' }));
    expect(
      await screen.findByText('Lowercase words separated by hyphens (e.g. "jeju").'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toHaveAttribute('aria-invalid', 'true');
    expect(onSave).not.toHaveBeenCalled();
  });

  it('a new city without Portuguese saves (hidden Portuguese fields never block)', async () => {
    const onSave = vi.fn<(body: unknown) => Promise<void>>(async () => undefined);
    renderWithApp(<CityForm onSave={onSave} />);
    fill('Slug', 'gyeongju');
    fill('Korean name', '경주');
    fill('Hero image URL', 'https://picsum.photos/seed/gyeongju/1600/900');
    fill('Latitude', '35.8562');
    fill('Longitude', '129.2247');
    const english = screen.getByRole('group', { name: 'English (required)' });
    fireEvent.change(within(english).getByLabelText('Name'), { target: { value: 'Gyeongju' } });
    fireEvent.change(within(english).getByLabelText('Description'), {
      target: { value: 'Old capital.' },
    });
    fireEvent.change(within(english).getByLabelText('Best time to visit'), {
      target: { value: 'Spring.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create city' }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0]?.[0]).toEqual({
      slug: 'gyeongju',
      nameKo: '경주',
      heroImageUrl: 'https://picsum.photos/seed/gyeongju/1600/900',
      latitude: 35.8562,
      longitude: 129.2247,
      isFeatured: false,
      sortOrder: 0,
      translations: {
        en: { name: 'Gyeongju', description: 'Old capital.', bestTimeToVisit: 'Spring.' },
      },
    });
  });

  it('Portuguese is optional, but all of it or nothing', async () => {
    const onSave = vi.fn<(body: unknown) => Promise<void>>(async () => undefined);
    renderWithApp(
      <CityForm city={{ ...seoul, translations: { en: seoul.translations.en } }} onSave={onSave} />,
    );
    fireEvent.click(screen.getByLabelText(/Has a Portuguese translation/));
    const portuguese = screen.getByRole('group', { name: 'Portuguese (pt-BR)' });
    fireEvent.change(within(portuguese).getByLabelText('Name'), { target: { value: 'Seul' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await within(portuguese).findAllByText('Required.')).toHaveLength(2);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('removing the Portuguese translation on edit sends pt-BR: null', async () => {
    const onSave = vi.fn<(body: unknown) => Promise<void>>(async () => undefined);
    renderWithApp(<CityForm city={seoul} onSave={onSave} />);
    fireEvent.click(screen.getByLabelText(/Has a Portuguese translation/));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({
      slug: 'seoul',
      latitude: 37.5665,
      population: 9_400_000,
      isFeatured: true,
      translations: { en: seoul.translations.en, 'pt-BR': null },
    });
  });

  it("puts the API's validation messages next to the matching fields", async () => {
    signIn('ADMIN');
    installApi(async (request) =>
      request.method === 'GET'
        ? Response.json(seoul)
        : Response.json(
            {
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                details: [
                  { field: 'translations.en.name', errors: ['name must be shorter'] },
                  { field: 'somethingElse', errors: ['unexpected'] },
                ],
              },
            },
            { status: 400 },
          ),
    );
    renderWithApp(<CityEditor id="c1" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Save changes' }));
    const english = screen.getByRole('group', { name: 'English (required)' });
    expect(await within(english).findByText('name must be shorter')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Some fields are invalid.');
    expect(screen.getByRole('alert')).toHaveTextContent('somethingElse: unexpected');
  });
});

describe('CitiesList', () => {
  it('deletes after confirmation and explains a refusal (related records)', async () => {
    signIn('ADMIN');
    installApi((request) =>
      request.method === 'GET'
        ? Response.json({ data: [seoul], meta: { page: 1, limit: 100, total: 1, totalPages: 1 } })
        : Response.json(
            { error: { code: 'CONFLICT', message: 'Related records exist' } },
            { status: 409 },
          ),
    );
    renderWithApp(<CitiesList />);
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Seoul' }));
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
    const dialog = screen.getByRole('dialog', { name: 'Delete Seoul?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete city' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('conflicts with existing data');
    expect(calls.find((c) => c.method === 'DELETE')?.path).toBe('/api/v1/admin/cities/c1');
  });
});

describe('Districts', () => {
  it('adds a district to the city being edited', async () => {
    signIn('ADMIN');
    let districts: unknown[] = [];
    installApi((request, body) => {
      const { pathname } = new URL(request.url);
      if (pathname === '/api/revalidate') return Response.json({ revalidated: true });
      if (pathname === '/api/v1/admin/cities/c1') return Response.json(seoul);
      if (request.method === 'POST') {
        districts = [
          { ...(body as object), id: 'd1', createdAt: seoul.createdAt, updatedAt: seoul.updatedAt },
        ];
        return Response.json(districts[0], { status: 201 });
      }
      return Response.json({
        data: districts,
        meta: { page: 1, limit: 100, total: districts.length, totalPages: 1 },
      });
    });
    renderWithApp(<CityEditor id="c1" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Add district' }));
    const form = screen.getByRole('heading', { name: 'New district' }).parentElement!;
    fireEvent.change(within(form).getByLabelText('Slug'), { target: { value: 'hongdae' } });
    fireEvent.change(within(form).getByLabelText('Korean name'), { target: { value: '홍대' } });
    fireEvent.change(within(form).getByLabelText('Latitude'), { target: { value: '37.5563' } });
    fireEvent.change(within(form).getByLabelText('Longitude'), { target: { value: '126.9236' } });
    fireEvent.change(within(form).getByLabelText('Name (English)'), {
      target: { value: 'Hongdae' },
    });
    fireEvent.change(within(form).getByLabelText('Description (English)'), {
      target: { value: 'Student area.' },
    });
    fireEvent.click(within(form).getByRole('button', { name: 'Add district' }));

    expect(await screen.findByText('Added Hongdae.')).toBeInTheDocument();
    expect(calls.find((c) => c.path === '/api/v1/admin/districts')?.body).toEqual({
      cityId: 'c1',
      slug: 'hongdae',
      nameKo: '홍대',
      latitude: 37.5563,
      longitude: 126.9236,
      translations: { en: { name: 'Hongdae', description: 'Student area.' } },
    });
    expect(await screen.findByRole('button', { name: 'Edit Hongdae' })).toBeInTheDocument();
    // The public site is asked to refresh after the change.
    expect(calls.some((c) => c.method === 'POST' && c.path === '/api/revalidate')).toBe(true);
  });
});
