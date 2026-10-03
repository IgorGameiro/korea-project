'use client';

import {
  DEFAULT_CURRENCY_BY_LOCALE,
  type DisplayCurrency,
  isDisplayCurrency,
  type Locale,
} from '@korea-project/shared';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { convertKRW } from '../format';

export const CURRENCY_COOKIE = 'currency';
const ONE_YEAR = 60 * 60 * 24 * 365;

export interface Rate {
  currency: DisplayCurrency;
  rate: number;
  updatedAt: string;
}

interface CurrencyState {
  currency: DisplayCurrency;
  setCurrency: (currency: DisplayCurrency) => void;
  /** KRW -> selected currency, or null when no rate is available (show KRW only). */
  convert: (amountKRW: number) => number | null;
  rate: Rate | undefined;
}

const CurrencyContext = createContext<CurrencyState | null>(null);

function readCurrencyCookie(): DisplayCurrency | undefined {
  const match = /(?:^|;\s*)currency=([^;]+)/.exec(document.cookie);
  const value = match?.[1] ? decodeURIComponent(match[1]) : undefined;
  return isDisplayCurrency(value) ? value : undefined;
}

/**
 * Display currency, kept in a cookie but read ONLY in the browser.
 *
 * Why: pages are statically generated (ISR) and shared by every visitor of a locale. Reading the
 * cookie on the server (cookies()) would make every route render per request. Instead the static
 * HTML uses the locale default (en -> USD, pt-BR -> BRL), and after hydration this provider swaps
 * to the visitor's saved choice. Rates come from the (ISR-cached) server render, so switching
 * currency needs no request.
 */
export function CurrencyProvider({
  locale,
  rates,
  children,
}: {
  locale: Locale;
  rates: Rate[];
  children: ReactNode;
}) {
  const [currency, setState] = useState<DisplayCurrency>(DEFAULT_CURRENCY_BY_LOCALE[locale]);

  useEffect(() => {
    const saved = readCurrencyCookie();
    // Reading external state (a cookie) once after hydration is the intended use of an effect here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setState(saved);
  }, []);

  const setCurrency = useCallback((next: DisplayCurrency) => {
    setState(next);
    document.cookie = `${CURRENCY_COOKIE}=${next}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`;
  }, []);

  const value = useMemo<CurrencyState>(() => {
    const rate = rates.find((r) => r.currency === currency);
    return {
      currency,
      setCurrency,
      rate,
      convert: (amountKRW) => (rate ? convertKRW(amountKRW, rate.rate) : null),
    };
  }, [currency, rates, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyState {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error('useCurrency must be used inside <CurrencyProvider>');
  return value;
}
