import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('errors');

  return (
    <main
      id="main"
      className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center gap-4 px-6"
    >
      <h1 className="text-2xl font-bold">{t('notFoundTitle')}</h1>
      <p className="text-navy-700">{t('notFoundBody')}</p>
      <Link href="/" className="text-coral-500 font-semibold underline underline-offset-4">
        {t('backHome')}
      </Link>
    </main>
  );
}
