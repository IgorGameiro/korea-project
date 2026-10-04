import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetSessionForTests } from '@/features/auth/session';
import { renderWithApp } from '@/test/render';
import { CityCalculator } from './city-calculator';
import { PlanCalculator } from './plan-calculator';

const replace = vi.fn();
let search = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/pt/plan',
  useSearchParams: () => search,
}));

interface Body {
  citySlug: string;
  people: number;
  days: number;
  tier: string;
  currency: string;
}

const money = (krw: number) => ({ krw, amount: Math.round(krw * 0.00072 * 100) / 100 });
const answer = (body: Body) => {
  const nights = Math.max(1, body.days - 1);
  const rooms = Math.ceil(body.people / 2);
  const lodging = rooms * 100_000 * nights;
  const daily = body.people * body.days;
  const parts = {
    lodging,
    food: daily * 40_000,
    transport: daily * 10_000,
    activities: daily * 20_000,
  };
  const total = Object.values(parts).reduce((a, b) => a + b, 0);
  return {
    city: { slug: body.citySlug, name: body.citySlug, locale: 'en' },
    people: body.people,
    days: body.days,
    nights,
    rooms,
    tier: body.tier,
    currency: body.currency,
    exchangeRate: {
      base: 'KRW',
      currency: body.currency,
      rate: 0.00072,
      updatedAt: '2026-10-01T00:00:00Z',
    },
    breakdown: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, money(v)])),
    total: money(total),
    perDay: money(total / body.days),
    perPerson: money(total / body.people),
  };
};

const requests: { body: Body; signal: AbortSignal }[] = [];
let respond: (body: Body) => Response = (body) => Response.json(answer(body));

beforeEach(() => {
  resetSessionForTests();
  requests.length = 0;
  replace.mockReset();
  search = new URLSearchParams();
  respond = (body) => Response.json(answer(body));
  vi.stubGlobal(
    'fetch',
    vi.fn(async (request: Request) => {
      const body = (await request.clone().json()) as Body;
      requests.push({ body, signal: request.signal });
      // A slow network that honors cancellation.
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, 40);
        request.signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
      return respond(body);
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

const sleep = (ms: number) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));

describe('CityCalculator', () => {
  it('shows the estimate from the API with the breakdown, in the visitor currency and KRW', async () => {
    renderWithApp(<CityCalculator citySlug="seoul" />);
    expect(await screen.findByText('$792.00')).toBeInTheDocument(); // total
    expect(screen.getByText('₩1,100,000')).toBeInTheDocument();
    expect(screen.getByText('2 travelers · 5 days · 4 nights · 1 room')).toBeInTheDocument();
    expect(screen.getByText('Lodging')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Lodging: 36% of the total' })).toBeInTheDocument();
    expect(requests[0]?.body).toEqual({
      citySlug: 'seoul',
      people: 2,
      days: 5,
      tier: 'MID',
      currency: 'USD',
    });
  });

  it('debounces quick changes into one request', async () => {
    renderWithApp(<CityCalculator citySlug="seoul" />);
    await screen.findByText('$792.00');
    requests.length = 0;
    const more = screen.getByRole('button', { name: 'More travelers' });
    fireEvent.click(more);
    fireEvent.click(more);
    fireEvent.click(more);
    await waitFor(() =>
      expect(screen.getByText('5 travelers · 5 days · 4 nights · 3 rooms')).toBeInTheDocument(),
    );
    expect(requests.map((r) => r.body.people)).toEqual([5]);
  });

  it('cancels the request in flight when the input changes (an old answer never wins)', async () => {
    renderWithApp(<CityCalculator citySlug="seoul" />);
    await screen.findByText('$792.00');
    requests.length = 0;

    fireEvent.click(screen.getByRole('button', { name: 'More days' }));
    await sleep(350); // debounce passed: the request for 6 days is now in flight
    expect(requests).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'More days' }));

    await waitFor(() => expect(screen.getByText(/7 days · 6 nights/)).toBeInTheDocument());
    expect(requests[0]?.body.days).toBe(6);
    expect(requests[0]?.signal.aborted).toBe(true);
    expect(requests[1]?.body.days).toBe(7);
    expect(screen.queryByText(/6 days · 5 nights/)).toBeNull();
  });

  it('keeps people and days within the API limits', async () => {
    renderWithApp(<CityCalculator citySlug="seoul" />);
    const input = screen.getByLabelText('Travelers');
    fireEvent.change(input, { target: { value: '99' } });
    fireEvent.blur(input);
    expect(input).toHaveValue(20);
    expect(screen.getByRole('button', { name: 'More travelers' })).toBeDisabled();
  });

  it('explains a missing exchange rate instead of showing zero', async () => {
    respond = () =>
      Response.json({ error: { code: 'EXCHANGE_RATE_UNAVAILABLE' } }, { status: 503 });
    renderWithApp(<CityCalculator citySlug="seoul" />, { locale: 'pt-BR' });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O câmbio para BRL não está disponível agora.',
    );
    expect(screen.queryByText(/R\$\s?0,00/)).toBeNull();
  });
});

describe('PlanCalculator', () => {
  const cities = [
    { slug: 'seoul', name: 'Seul' },
    { slug: 'busan', name: 'Busan' },
  ];

  it('reads the plan from the URL, falling back to defaults for invalid values', async () => {
    search = new URLSearchParams('city=atlantis&people=0&days=4&tier=luxury');
    renderWithApp(<PlanCalculator cities={cities} />, { locale: 'pt-BR' });
    expect(screen.getByLabelText('Cidade')).toHaveValue('seoul');
    expect(screen.getByLabelText('Viajantes')).toHaveValue(2);
    expect(screen.getByLabelText('Dias')).toHaveValue(4);
    expect(screen.getByRole('radio', { name: /Luxo/ })).toBeChecked();
  });

  it('writes every change back to the URL (shareable)', () => {
    search = new URLSearchParams('city=seoul&people=2&days=5&tier=mid');
    renderWithApp(<PlanCalculator cities={cities} />, { locale: 'pt-BR' });
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'busan' } });
    expect(replace).toHaveBeenLastCalledWith('/pt/plan?city=busan&people=2&days=5&tier=mid', {
      scroll: false,
    });
  });
});
