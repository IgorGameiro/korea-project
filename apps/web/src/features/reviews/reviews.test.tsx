import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetSessionForTests, startSession, endSession } from '@/features/auth/session';
import type { ReviewDto } from '@/lib/api/types';
import { renderWithApp } from '@/test/render';
import { LiveRating } from './live-rating';
import { resetPlaceRatingsForTests } from './place-rating-store';
import { ReviewsSection } from './reviews-section';

vi.mock('@/i18n/navigation', () => ({
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

const PLACE = '01a10284-0000-7000-8000-0000000000aa';
const ME = { id: '01a10284-0000-7000-8000-0000000000u1', name: 'Ana Souza' };

const review = (n: number, extra: Partial<ReviewDto> = {}): ReviewDto => ({
  id: `r${n}`,
  placeId: PLACE,
  rating: 4,
  title: `Review ${n}`,
  comment: `Comment ${n}`,
  locale: 'en',
  visitedAt: null,
  createdAt: new Date(Date.UTC(2026, 8, 30) - n * 3_600_000).toISOString(),
  updatedAt: new Date(Date.UTC(2026, 8, 30) - n * 3_600_000).toISOString(),
  author: { id: `u${n}`, name: `Traveler ${n}` },
  ...extra,
});

/** In-memory reviews API: the place's reviews and the visitor's own one. */
function installReviewsApi({ others = 7, mine = null as ReviewDto | null } = {}) {
  let reviews = [
    ...(mine ? [mine] : []),
    ...Array.from({ length: others }, (_, i) => review(i + 1)),
  ];
  const calls: { method: string; path: string; body?: unknown }[] = [];
  let createStatus = 201;
  const rating = () => ({
    ratingAvg: reviews.length
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 100) / 100
      : 0,
    ratingCount: reviews.length,
  });

  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      const url = new URL(request.url);
      const body =
        request.method === 'GET' || request.method === 'DELETE' ? undefined : await request.json();
      calls.push({ method: request.method, path: url.pathname + url.search, body });
      const own = () => reviews.find((r) => r.author.id === ME.id);

      if (url.pathname === '/api/v1/users/me/reviews') {
        const found = own();
        return Response.json({
          data: found ? [found] : [],
          meta: { page: 1, limit: 1, total: found ? 1 : 0, totalPages: found ? 1 : 0 },
        });
      }
      if (url.pathname === '/api/v1/places/gyeongbokgung-palace/reviews') {
        const page = Number(url.searchParams.get('page'));
        const limit = Number(url.searchParams.get('limit'));
        return Response.json({
          data: reviews.slice((page - 1) * limit, page * limit),
          meta: {
            page,
            limit,
            total: reviews.length,
            totalPages: Math.ceil(reviews.length / limit),
          },
        });
      }
      if (url.pathname === `/api/v1/places/${PLACE}/reviews` && request.method === 'POST') {
        if (createStatus === 409) {
          reviews = [review(99, { author: ME, title: 'Written in another tab' }), ...reviews];
          return Response.json({ error: { code: 'REVIEW_ALREADY_EXISTS' } }, { status: 409 });
        }
        const created = { ...review(0), ...(body as object), id: 'mine', author: ME };
        reviews = [created, ...reviews];
        return Response.json({ ...created, placeRating: rating() }, { status: 201 });
      }
      if (url.pathname.startsWith('/api/v1/reviews/')) {
        const id = url.pathname.split('/').pop();
        if (request.method === 'PATCH') {
          reviews = reviews.map((r) => (r.id === id ? { ...r, ...(body as object) } : r));
          return Response.json({ ...reviews.find((r) => r.id === id), placeRating: rating() });
        }
        reviews = reviews.filter((r) => r.id !== id);
        return Response.json({ placeRating: rating() });
      }
      return Response.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
    }),
  );
  return {
    calls,
    initial: reviews.slice(0, 5),
    total: reviews.length,
    failNextCreateWithConflict: () => {
      createStatus = 409;
    },
  };
}

function renderSection(api: ReturnType<typeof installReviewsApi>, initialAvg = 4) {
  return renderWithApp(
    <>
      <LiveRating placeId={PLACE} initial={{ ratingAvg: initialAvg, ratingCount: api.total }} />
      <ReviewsSection
        placeId={PLACE}
        placeSlug="gyeongbokgung-palace"
        initialReviews={api.initial}
        initialTotal={api.total}
      />
    </>,
  );
}

const signIn = () =>
  act(() => {
    startSession({
      accessToken: 'test-access-token',
      tokenType: 'Bearer',
      expiresIn: 900,
      user: { ...ME, email: 'ana@example.com', role: 'USER', createdAt: '2026-01-01T00:00:00Z' },
    });
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
  resetPlaceRatingsForTests();
});
afterEach(() => vi.unstubAllGlobals());

describe('ReviewsSection', () => {
  it('invites anonymous visitors to log in and come back to the reviews', () => {
    const api = installReviewsApi();
    act(() => endSession());
    renderSection(api);
    const link = screen.getByRole('link', { name: 'Log in to write a review' });
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toBe('/login?next=/#reviews-title');
    expect(screen.getByText('7 reviews')).toBeInTheDocument();
  });

  it('validates the form before sending anything', async () => {
    const api = installReviewsApi();
    signIn();
    renderSection(api);
    fireEvent.click(await screen.findByRole('button', { name: 'Publish review' }));
    expect(await screen.findByText('Choose from 1 to 5 stars.')).toBeInTheDocument();
    expect(screen.getByText('Give your review a title.')).toBeInTheDocument();
    expect(api.calls.some((call) => call.method === 'POST')).toBe(false);
  });

  it('publishes a review and updates the rating right away for its author', async () => {
    const api = installReviewsApi();
    signIn();
    renderSection(api);
    expect(screen.getByRole('img', { name: 'Rated 4 out of 5, 7 reviews' })).toBeInTheDocument();

    fireEvent.click(await screen.findByLabelText('1 star'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Too crowded' } });
    fireEvent.change(screen.getByLabelText('Your review'), { target: { value: 'Go early.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publish review' }));

    expect(await screen.findByText('Thanks! Your review is published.')).toBeInTheDocument();
    expect(api.calls.find((call) => call.method === 'POST')?.body).toEqual({
      rating: 1,
      title: 'Too crowded',
      comment: 'Go early.',
      locale: 'en',
    });
    // (7 × 4 + 1) / 8 = 3.625 → 3.63, from the API's answer, not from the stale static HTML.
    expect(screen.getByRole('img', { name: 'Rated 3.63 out of 5, 8 reviews' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('8 reviews')).toBeInTheDocument());
    expect(screen.getAllByRole('heading', { name: 'Too crowded' }).length).toBeGreaterThan(0);
  });

  it('shows the visitor their existing review with edit and delete', async () => {
    const api = installReviewsApi({
      mine: review(50, { author: ME, rating: 5, title: 'Loved it' }),
    });
    signIn();
    renderSection(api, 4.13);

    expect(await screen.findByRole('heading', { name: 'Your review' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Publish review' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Title')).toHaveValue('Loved it');
    fireEvent.click(screen.getByLabelText('3 stars'));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Your review was updated.')).toBeInTheDocument();
    expect(api.calls.find((call) => call.method === 'PATCH')?.path).toBe('/api/v1/reviews/r50');
    // 7 × 4 + 3 = 31 / 8 = 3.875 → 3.88
    expect(screen.getByRole('img', { name: 'Rated 3.88 out of 5, 8 reviews' })).toBeInTheDocument();
  });

  it('deletes after confirmation and updates the rating', async () => {
    const api = installReviewsApi({ mine: review(50, { author: ME, rating: 1 }) });
    signIn();
    renderSection(api, 3.63);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog', { name: 'Delete your review?' });
    expect(api.calls.some((call) => call.method === 'DELETE')).toBe(false);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete review' }));

    expect(await screen.findByText('Your review was deleted.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Rated 4 out of 5, 7 reviews' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Publish review' })).toBeInTheDocument();
  });

  it('a duplicate (reviewed in another tab) shows a clear message and that review', async () => {
    const api = installReviewsApi();
    signIn();
    renderSection(api);
    api.failNextCreateWithConflict();

    fireEvent.click(await screen.findByLabelText('5 stars'));
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Great' } });
    fireEvent.change(screen.getByLabelText('Your review'), { target: { value: 'Great place.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publish review' }));

    expect(await screen.findByText(/You have already reviewed this place/)).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: 'Written in another tab' }),
    ).toBeInTheDocument();
  });

  it('loads more reviews on demand', async () => {
    const api = installReviewsApi();
    act(() => endSession());
    renderSection(api);
    expect(screen.getAllByRole('heading', { name: /^Review \d$/ })).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: 'Show more reviews' }));
    await waitFor(() =>
      expect(screen.getAllByRole('heading', { name: /^Review \d$/ })).toHaveLength(7),
    );
    expect(screen.queryByRole('button', { name: 'Show more reviews' })).toBeNull();
  });
});
