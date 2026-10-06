import type { OpeningHours, Photo } from '@korea-project/shared';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { type ComponentProps, useState } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetSessionForTests, startSession } from '@/features/auth/session';
import { renderWithApp } from '@/test/render';
import { CostsAdmin } from './costs/costs-admin';
import { OpeningHoursEditor } from './places/opening-hours-editor';
import { PhotosEditor } from './places/photos-editor';
import { PlaceForm } from './places/place-form';
import { RatesAdmin } from './rates/rates-admin';
import { AdminRefreshStatus } from './refresh-status';
import { ReviewsAdmin } from './reviews/reviews-admin';
import { resetAdminDataForTests } from './use-admin-data';

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/admin',
  Link: ({ href, ...props }: Omit<ComponentProps<'a'>, 'href'> & { href: string }) => (
    <a href={href} {...props} />
  ),
}));

const calls: { method: string; path: string; body: unknown }[] = [];
type Handler = (method: string, path: string, body: unknown) => Response;
function installApi(handler: Handler) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      const url = new URL(request.url);
      const text = request.method === 'GET' ? '' : await request.text();
      const body = text ? JSON.parse(text) : undefined;
      calls.push({ method: request.method, path: url.pathname + url.search, body });
      return handler(request.method, url.pathname + url.search, body);
    }),
  );
}
const page = <T,>(data: T[]) =>
  Response.json({ data, meta: { page: 1, limit: 100, total: data.length, totalPages: 1 } });

const city = (id: string, name: string) => ({
  id,
  slug: name.toLowerCase(),
  nameKo: '도시',
  heroImageUrl: 'https://picsum.photos/x',
  latitude: 37,
  longitude: 127,
  isFeatured: false,
  sortOrder: 0,
  translations: { en: { name, description: 'd', bestTimeToVisit: 'b' } },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});
const district = (id: string, cityId: string, name: string) => ({
  id,
  cityId,
  slug: name.toLowerCase(),
  nameKo: '동',
  latitude: 37,
  longitude: 127,
  translations: { en: { name, description: 'd' } },
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

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
  resetAdminDataForTests();
  calls.length = 0;
  act(() =>
    startSession({
      accessToken: 'test-access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: 'u1',
        name: 'Admin',
        email: 'a@example.com',
        role: 'ADMIN',
        createdAt: '2026-01-01T00:00:00Z',
      },
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

describe('OpeningHoursEditor', () => {
  function Harness({ onValue }: { onValue: (v: OpeningHours | null) => void }) {
    const [value, setValue] = useState<OpeningHours | null>(null);
    return (
      <OpeningHoursEditor
        value={value}
        onChange={(next) => {
          setValue(next);
          onValue(next);
        }}
      />
    );
  }

  it('builds a schedule with closed days, 24 hours, several periods and copies', () => {
    let last: OpeningHours | null = null;
    renderWithApp(<Harness onValue={(v) => (last = v)} />);
    fireEvent.click(screen.getByLabelText('Opening hours are known'));
    expect(last!.days.mon).toEqual([{ open: '09:00', close: '18:00' }]);

    const monday = screen.getByRole('group', { name: 'Monday' });
    fireEvent.click(within(monday).getByRole('button', { name: 'Add a period on Monday' }));
    fireEvent.change(screen.getByLabelText('Monday period 2 closes'), {
      target: { value: '02:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Copy Monday to every day' }));
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Tuesday' })).getByLabelText('Closed'),
    );
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Sunday' })).getByLabelText('24 hours'),
    );

    expect(last!.days.mon).toEqual([
      { open: '09:00', close: '18:00' },
      { open: '18:00', close: '02:00' },
    ]);
    expect(last!.days.fri).toEqual(last!.days.mon);
    expect(last!.days.tue).toEqual([]);
    expect(last!.days.sun).toEqual([{ open: '00:00', close: '24:00' }]);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('flags invalid times with the same rules as the API', () => {
    renderWithApp(<Harness onValue={() => undefined} />);
    fireEvent.click(screen.getByLabelText('Opening hours are known'));
    fireEvent.change(screen.getByLabelText('Wednesday period 1 opens'), {
      target: { value: '25:00' },
    });
    expect(screen.getByRole('alert')).toHaveTextContent('days.wed[0].open must be HH:MM');
  });
});

describe('PlaceForm', () => {
  beforeEach(() => {
    installApi((_method, path) => {
      if (path.startsWith('/api/v1/admin/cities'))
        return page([city('c1', 'Seoul'), city('c2', 'Busan')]);
      if (path.includes('cityId=c1')) return page([district('d1', 'c1', 'Hongdae')]);
      if (path.includes('cityId=c2')) return page([district('d2', 'c2', 'Haeundae')]);
      return page([]);
    });
  });

  const fill = (label: string, value: string) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } });

  async function fillBasics() {
    await screen.findByRole('option', { name: 'Seoul' });
    fill('City', 'c1');
    await screen.findByRole('option', { name: 'Hongdae' });
    fill('District', 'd1');
    fill('Slug', 'test-trail');
    fill('Korean name', '테스트');
    fill('Address', 'Somewhere, Seoul');
    fill('Latitude', '37.5');
    fill('Longitude', '127');
    const english = screen.getByRole('group', { name: 'English (required)' });
    fireEvent.change(within(english).getByLabelText('Name'), { target: { value: 'Test trail' } });
    fireEvent.change(within(english).getByLabelText('Description'), {
      target: { value: 'A walk.' },
    });
  }

  it('asks for trail facts only for hiking, and sends a clean body', async () => {
    const onSave = vi.fn<(body: unknown) => Promise<void>>(async () => undefined);
    renderWithApp(<PlaceForm onSave={onSave} />);
    await fillBasics();
    expect(screen.queryByRole('group', { name: 'Trail' })).toBeNull();
    fill('Category', 'HIKING');
    const trail = await screen.findByRole('group', { name: 'Trail' });
    fireEvent.click(screen.getByRole('button', { name: 'Create place' }));
    expect(await within(trail).findByText('Choose a difficulty.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(within(trail).getByLabelText('Difficulty'), { target: { value: 'MODERATE' } });
    fireEvent.change(within(trail).getByLabelText('Distance (km)'), { target: { value: '8.4' } });
    fireEvent.change(within(trail).getByLabelText('Duration (minutes)'), {
      target: { value: '270' },
    });
    fireEvent.change(within(trail).getByLabelText('Elevation gain (m)'), {
      target: { value: '700' },
    });
    const photos = screen.getByRole('group', { name: 'Photos' });
    fireEvent.click(within(photos).getByRole('button', { name: 'Add a photo' }));
    fireEvent.change(within(photos).getByLabelText('URL (https)'), {
      target: { value: 'https://picsum.photos/a' },
    });
    fill('Tags', 'hiking, views ,national-park');
    fireEvent.click(screen.getByRole('button', { name: 'Create place' }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0]?.[0]).toMatchObject({
      cityId: 'c1',
      districtId: 'd1',
      category: 'HIKING',
      website: null,
      images: [{ url: 'https://picsum.photos/a', credit: null }],
      tags: ['hiking', 'views', 'national-park'],
      openingHours: null,
      trail: { difficulty: 'MODERATE', distanceKm: 8.4, durationMinutes: 270, elevationGainM: 700 },
      translations: { en: { name: 'Test trail', description: 'A walk.', openingHoursNote: null } },
    });
  });

  it('rejects a photo that is not an https URL', async () => {
    const onSave = vi.fn<(body: unknown) => Promise<void>>(async () => undefined);
    renderWithApp(<PlaceForm onSave={onSave} />);
    await fillBasics();
    fill('Category', 'CAFE');
    const photos = screen.getByRole('group', { name: 'Photos' });
    fireEvent.click(within(photos).getByRole('button', { name: 'Add a photo' }));
    fireEvent.change(within(photos).getByLabelText('URL (https)'), {
      target: { value: 'http://insecure.example/a.jpg' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create place' }));
    expect(await within(photos).findByText('Photo 1.url must be an https URL')).toBeInTheDocument();
    expect(await screen.findByText('Fix the photos.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('changing the city clears a district of the previous city', async () => {
    renderWithApp(<PlaceForm onSave={async () => undefined} />);
    await fillBasics();
    expect(screen.getByLabelText('District')).toHaveValue('d1');
    fill('City', 'c2');
    await screen.findByRole('option', { name: 'Haeundae' });
    expect(screen.getByLabelText('District')).toHaveValue('');
  });
});

describe('CostsAdmin', () => {
  it('creates a missing travel style and updates an existing one', async () => {
    installApi((method, path, body) => {
      if (path.startsWith('/api/v1/admin/cities')) return page([city('c1', 'Seoul')]);
      if (method === 'GET') {
        return page([
          {
            id: 'e-mid',
            cityId: 'c1',
            tier: 'MID',
            lodgingPerRoomPerNightKRW: 150000,
            foodPerPersonPerDayKRW: 60000,
            transportPerPersonPerDayKRW: 15000,
            activitiesPerPersonPerDayKRW: 40000,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: '2026-01-01T00:00:00Z',
          },
        ]);
      }
      return Response.json(
        { id: 'new', ...(body as object) },
        { status: method === 'POST' ? 201 : 200 },
      );
    });
    renderWithApp(<CostsAdmin />);
    const budget = await screen.findByRole('region', { name: /Budget/ });
    expect(within(budget).getByText('not set')).toBeInTheDocument();
    for (const [label, value] of [
      ['Lodging per room per night (KRW)', '60000'],
      ['Food per person per day (KRW)', '30000'],
      ['Transport per person per day (KRW)', '8000'],
      ['Activities per person per day (KRW)', '15000'],
    ]) {
      fireEvent.change(within(budget).getByLabelText(label!), { target: { value } });
    }
    fireEvent.click(within(budget).getByRole('button', { name: 'Save Budget' }));
    expect(await within(budget).findByText('Budget saved.')).toBeInTheDocument();
    expect(calls.find((c) => c.method === 'POST')?.body).toEqual({
      cityId: 'c1',
      tier: 'BUDGET',
      lodgingPerRoomPerNightKRW: 60000,
      foodPerPersonPerDayKRW: 30000,
      transportPerPersonPerDayKRW: 8000,
      activitiesPerPersonPerDayKRW: 15000,
    });

    const comfort = screen.getByRole('region', { name: /Comfort/ });
    fireEvent.change(within(comfort).getByLabelText('Food per person per day (KRW)'), {
      target: { value: '1.5' },
    });
    fireEvent.click(within(comfort).getByRole('button', { name: 'Save Comfort' }));
    expect(await within(comfort).findByRole('alert')).toHaveTextContent('whole number of won');
    fireEvent.change(within(comfort).getByLabelText('Food per person per day (KRW)'), {
      target: { value: '65000' },
    });
    fireEvent.click(within(comfort).getByRole('button', { name: 'Save Comfort' }));
    await waitFor(() =>
      expect(calls.find((c) => c.method === 'PATCH')?.path).toBe(
        '/api/v1/admin/cost-estimates/e-mid',
      ),
    );
  });
});

describe('RatesAdmin', () => {
  it('validates and saves a rate as a number', async () => {
    installApi((method, _path, body) =>
      method === 'GET'
        ? Response.json({
            base: 'KRW',
            rates: [
              { currency: 'USD', rate: 0.00072, source: 'env', updatedAt: '2026-10-01T00:00:00Z' },
            ],
          })
        : Response.json({
            currency: 'BRL',
            ...(body as object),
            source: 'admin',
            updatedAt: '2026-10-06T00:00:00Z',
          }),
    );
    renderWithApp(<RatesAdmin />);
    const brl = await screen.findByRole('region', { name: 'KRW → BRL' });
    expect(within(brl).getByText(/Not set/)).toBeInTheDocument();
    fireEvent.change(within(brl).getByLabelText('1 KRW in BRL'), { target: { value: '0.0039' } });
    expect(within(brl).getByText('So 1 BRL ≈ ₩256.')).toBeInTheDocument();
    fireEvent.click(within(brl).getByRole('button', { name: 'Save BRL rate' }));
    expect(await within(brl).findByText('BRL rate saved.')).toBeInTheDocument();
    expect(calls.find((c) => c.method === 'PUT')).toEqual({
      method: 'PUT',
      path: '/api/v1/admin/exchange-rates/BRL',
      body: { rate: 0.0039 },
    });

    const usd = screen.getByRole('region', { name: 'KRW → USD' });
    fireEvent.change(within(usd).getByLabelText('1 KRW in USD'), { target: { value: '0' } });
    fireEvent.click(within(usd).getByRole('button', { name: 'Save USD rate' }));
    expect(await within(usd).findByRole('alert')).toHaveTextContent('A positive number');
  });
});

describe('ReviewsAdmin', () => {
  it('deletes a review only after confirmation', async () => {
    installApi((method) =>
      method === 'GET'
        ? page([
            {
              id: 'r1',
              placeId: 'p1',
              rating: 1,
              title: 'Spam',
              comment: 'Buy now',
              locale: 'en',
              visitedAt: null,
              createdAt: '2026-10-05T10:00:00Z',
              updatedAt: '2026-10-05T10:00:00Z',
              author: { id: 'u9', name: 'Spammer' },
              place: { id: 'p1', slug: 'namsan', name: 'Namsan' },
            },
          ])
        : Response.json({ placeRating: { ratingAvg: 0, ratingCount: 0 } }),
    );
    renderWithApp(<ReviewsAdmin />);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Delete the review by Spammer of Namsan' }),
    );
    expect(calls.some((c) => c.method === 'DELETE')).toBe(false);
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete review' }),
    );
    expect(await screen.findByText(/Deleted the review by Spammer/)).toBeInTheDocument();
    expect(calls.find((c) => c.method === 'DELETE')?.path).toBe('/api/v1/reviews/r1');
  });
});

describe('refreshing the public site', () => {
  it('refreshes the site after a save, and warns when that fails (the save stands)', async () => {
    let refreshStatus = 200;
    installApi((method, path, body) => {
      if (path === '/api/revalidate') return new Response(null, { status: refreshStatus });
      if (method === 'GET') {
        return Response.json({
          base: 'KRW',
          rates: [
            { currency: 'USD', rate: 0.00072, source: 'env', updatedAt: '2026-10-01T00:00:00Z' },
          ],
        });
      }
      return Response.json({
        currency: 'USD',
        ...(body as object),
        source: 'admin',
        updatedAt: '2026-10-06T00:00:00Z',
      });
    });
    renderWithApp(
      <>
        <AdminRefreshStatus />
        <RatesAdmin />
      </>,
    );
    const usd = await screen.findByRole('region', { name: 'KRW → USD' });
    fireEvent.click(within(usd).getByRole('button', { name: 'Save USD rate' }));
    expect(await within(usd).findByText('USD rate saved.')).toBeInTheDocument();
    const order = calls.filter((c) => c.method !== 'GET').map((c) => c.path);
    expect(order).toEqual(['/api/v1/admin/exchange-rates/USD', '/api/revalidate']);
    expect(screen.queryByText(/could not be refreshed/)).toBeNull();

    refreshStatus = 502;
    fireEvent.click(within(usd).getByRole('button', { name: 'Save USD rate' }));
    expect(
      await screen.findByText(/Saved, but the public pages could not be refreshed now/),
    ).toBeInTheDocument();
  });
});

describe('PhotosEditor', () => {
  function Harness({ onValue }: { onValue: (v: Photo[]) => void }) {
    const [value, setValue] = useState<Photo[]>([
      { url: 'https://picsum.photos/a' },
      { url: 'https://picsum.photos/b' },
    ]);
    return (
      <PhotosEditor
        value={value}
        onChange={(next) => {
          setValue(next);
          onValue(next);
        }}
      />
    );
  }

  it('reorders the cover and requires a complete credit once one is started', () => {
    let last: Photo[] = [];
    renderWithApp(<Harness onValue={(v) => (last = v)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Move Photo 2 up' }));
    expect(last.map((p) => p.url)).toEqual(['https://picsum.photos/b', 'https://picsum.photos/a']);
    expect(screen.queryByRole('alert')).toBeNull();

    const first = screen.getByRole('group', { name: 'Photo 1 (cover)' });
    fireEvent.change(within(first).getByLabelText('Author'), { target: { value: 'Jane Doe' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Photo 1.credit.license is required');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Photo 1.credit.sourceUrl must be an https URL',
    );

    fireEvent.change(within(first).getByLabelText('License (e.g. CC BY-SA 4.0)'), {
      target: { value: 'CC0' },
    });
    fireEvent.change(within(first).getByLabelText('Source page (e.g. the Commons file page)'), {
      target: { value: 'https://commons.wikimedia.org/wiki/File:B.jpg' },
    });
    expect(screen.queryByRole('alert')).toBeNull();
    expect(last[0]).toEqual({
      url: 'https://picsum.photos/b',
      credit: {
        author: 'Jane Doe',
        license: 'CC0',
        licenseUrl: null,
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:B.jpg',
      },
    });
  });
});
