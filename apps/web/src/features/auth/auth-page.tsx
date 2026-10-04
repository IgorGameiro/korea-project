import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthForm } from './auth-form';

type Mode = 'login' | 'register';

export async function authMetadata(locale: string, mode: Mode): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return {
    title: t(mode === 'login' ? 'loginMetaTitle' : 'registerMetaTitle'),
    robots: { index: false, follow: false },
  };
}

/** Static page shell; the form reads ?next= on the client, so it sits in a Suspense boundary. */
export async function AuthPage({ locale, mode }: { locale: Locale; mode: Mode }) {
  setRequestLocale(locale);
  const t = await getTranslations('auth');
  return (
    <Container className="flex justify-center py-12">
      <div className="w-full max-w-md rounded-[var(--radius-card)] p-6 ring-1 ring-navy-100 sm:p-8">
        <h1 className="mb-6 text-2xl font-bold">
          {t(mode === 'login' ? 'loginTitle' : 'registerTitle')}
        </h1>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <AuthForm mode={mode} />
        </Suspense>
      </div>
    </Container>
  );
}
