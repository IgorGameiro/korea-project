'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { browserApi } from '@/features/auth/browser-api';
import type { CostCalculationDto } from '@/lib/api/types';
import { useCurrency } from '@/lib/currency/currency-context';
import type { CalculatorInput } from './params';

export type CalculatorErrorCode =
  'EXCHANGE_RATE_UNAVAILABLE' | 'COST_ESTIMATE_NOT_FOUND' | 'TOO_MANY_REQUESTS' | 'API_UNAVAILABLE';

type Settled =
  | { key: string; data: CostCalculationDto; error?: undefined }
  | { key: string; data?: undefined; error: CalculatorErrorCode };

export interface CostEstimateState {
  /** The last answer (kept while a newer one loads, so the result does not flicker). */
  data?: CostCalculationDto;
  error?: CalculatorErrorCode;
  loading: boolean;
}

const KNOWN: CalculatorErrorCode[] = [
  'EXCHANGE_RATE_UNAVAILABLE',
  'COST_ESTIMATE_NOT_FOUND',
  'TOO_MANY_REQUESTS',
];

/**
 * Asks the API for an estimate, debounced. A newer input cancels the request still in flight
 * (AbortController), so an older, slower answer can never overwrite a newer one.
 */
export function useCostEstimate(input: CalculatorInput, delayMs = 300): CostEstimateState {
  const { currency } = useCurrency();
  const locale = useLocale() as 'en' | 'pt-BR';
  const key = JSON.stringify([
    input.citySlug,
    input.people,
    input.days,
    input.tier,
    currency,
    locale,
  ]);
  const [settled, setSettled] = useState<Settled | null>(null);
  const [lastData, setLastData] = useState<CostCalculationDto | undefined>(undefined);

  useEffect(() => {
    if (!input.citySlug) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const { data, error, response } = await browserApi().POST(
          '/api/v1/cost-estimates/calculate',
          {
            params: { query: { locale } },
            body: { ...input, currency },
            signal: controller.signal,
          },
        );
        if (controller.signal.aborted) return;
        if (data) {
          setSettled({ key, data });
          setLastData(data);
        } else {
          const code = (error as { error?: { code?: string } } | undefined)?.error?.code;
          setSettled({
            key,
            error:
              KNOWN.find((known) => known === code) ??
              (response.status === 429 ? 'TOO_MANY_REQUESTS' : 'API_UNAVAILABLE'),
          });
        }
      } catch {
        if (!controller.signal.aborted) setSettled({ key, error: 'API_UNAVAILABLE' });
      }
    }, delayMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // `key` captures every input that changes the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, delayMs]);

  const current = settled?.key === key ? settled : null;
  return {
    data: current?.data ?? (current?.error ? undefined : lastData),
    error: current?.error,
    loading: current === null,
  };
}
