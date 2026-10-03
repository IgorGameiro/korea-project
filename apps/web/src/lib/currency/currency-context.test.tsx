import { act, render, screen } from '@testing-library/react';
import { CurrencyProvider, type Rate, useCurrency } from './currency-context';

const rates: Rate[] = [
  { currency: 'USD', rate: 0.00072, updatedAt: '2026-10-01T00:00:00Z' },
  { currency: 'BRL', rate: 0.0039, updatedAt: '2026-10-01T00:00:00Z' },
];

function Probe() {
  const { currency, convert, setCurrency } = useCurrency();
  return (
    <>
      <p data-testid="currency">{currency}</p>
      <p data-testid="amount">{convert(100_000)}</p>
      <button onClick={() => setCurrency('BRL')}>BRL</button>
    </>
  );
}

const clearCookie = () => {
  document.cookie = 'currency=; Path=/; Max-Age=0';
};

describe('CurrencyProvider', () => {
  beforeEach(clearCookie);
  afterEach(clearCookie);

  it('defaults from the locale (en -> USD, pt-BR -> BRL)', () => {
    const { unmount } = render(
      <CurrencyProvider locale="en" rates={rates}>
        <Probe />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId('currency')).toHaveTextContent('USD');
    expect(screen.getByTestId('amount')).toHaveTextContent('72');
    unmount();

    render(
      <CurrencyProvider locale="pt-BR" rates={rates}>
        <Probe />
      </CurrencyProvider>,
    );
    expect(screen.getByTestId('currency')).toHaveTextContent('BRL');
  });

  it('applies the saved cookie after mount (server HTML stays the locale default)', () => {
    document.cookie = 'currency=BRL; Path=/';

    render(
      <CurrencyProvider locale="en" rates={rates}>
        <Probe />
      </CurrencyProvider>,
    );

    expect(screen.getByTestId('currency')).toHaveTextContent('BRL');
    expect(screen.getByTestId('amount')).toHaveTextContent('390');
  });

  it('ignores an invalid cookie value', () => {
    document.cookie = 'currency=EUR; Path=/';

    render(
      <CurrencyProvider locale="en" rates={rates}>
        <Probe />
      </CurrencyProvider>,
    );

    expect(screen.getByTestId('currency')).toHaveTextContent('USD');
  });

  it('saves the choice in a cookie', () => {
    render(
      <CurrencyProvider locale="en" rates={rates}>
        <Probe />
      </CurrencyProvider>,
    );

    act(() => screen.getByRole('button', { name: 'BRL' }).click());

    expect(screen.getByTestId('currency')).toHaveTextContent('BRL');
    expect(document.cookie).toContain('currency=BRL');
  });

  it('returns null instead of a wrong amount when no rate is available', () => {
    render(
      <CurrencyProvider locale="en" rates={[]}>
        <Probe />
      </CurrencyProvider>,
    );

    expect(screen.getByTestId('amount')).toBeEmptyDOMElement();
  });
});
