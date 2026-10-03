'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

/**
 * Shown when a page cannot be rendered, typically because the API is down or timing out.
 * (In production Next.js hides the error message from the client, so the copy stays generic.)
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-2xl font-bold">{t('unavailableTitle')}</h1>
      <p className="text-navy-700">{t('unavailableBody')}</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-navy-900 px-5 py-2.5 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-500"
      >
        {t('retry')}
      </button>
    </div>
  );
}
