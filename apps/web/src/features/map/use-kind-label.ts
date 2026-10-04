'use client';

import { useTranslations } from 'next-intl';
import type { MapPointKind } from './types';

export function useKindLabel() {
  const tc = useTranslations('categories');
  const ts = useTranslations('city.sections');
  return (kind: MapPointKind) => (kind === 'STAY' ? ts('stays') : tc(kind));
}
