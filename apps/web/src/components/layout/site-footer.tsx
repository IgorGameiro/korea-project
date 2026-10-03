import { useTranslations } from 'next-intl';
import { Container } from '../ui/container';

export function SiteFooter() {
  const t = useTranslations();

  return (
    <footer className="mt-16 border-t border-navy-100 bg-sand-50 py-8 text-sm text-navy-700">
      <Container className="flex flex-col gap-2">
        <p className="font-semibold text-navy-900">{t('meta.siteName')}</p>
        <p>{t('footer.disclaimer')}</p>
        <p>
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline underline-offset-4 hover:text-coral-600"
          >
            {t('footer.mapData')}
          </a>
        </p>
      </Container>
    </footer>
  );
}
