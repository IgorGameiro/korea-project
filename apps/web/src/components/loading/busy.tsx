'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

/**
 * Busy region announced once to screen readers; the shapes inside are decorative.
 * A client component on purpose: loading.tsx gets no route params, so a server-side
 * getTranslations() there would read the locale from the request headers — a dynamic API that
 * breaks static (ISR) pages rendered on demand (DYNAMIC_SERVER_USAGE). The client provider already
 * knows the locale.
 */
export function Busy({ children }: { children: ReactNode }) {
  const t = useTranslations('loading');
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('page')}</span>
      {children}
    </div>
  );
}
