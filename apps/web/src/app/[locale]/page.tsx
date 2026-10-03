import type { Locale } from '@korea-project/shared';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ApiStatus } from '@/components/api-status';
import { getApiHealth } from '@/lib/api/health';
import { localeParams } from '@/lib/static-params';

export const generateStaticParams = localeParams;
export const revalidate = 60;

// Phase 4 block 1 placeholder: proves locale routing and the web -> API wiring.
// Replaced by the real Home in block 3.
export default async function Home({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations('placeholder');
  const status = await getTranslations('status');
  const health = await getApiHealth();

  return (
    <main
      id="main"
      className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6"
    >
      <p className="text-coral-500 text-sm font-semibold tracking-widest uppercase">
        korea-project
      </p>
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="text-navy-700">{t('body')}</p>
      <ApiStatus status={health} label={health === 'up' ? status('apiUp') : status('apiDown')} />
    </main>
  );
}
