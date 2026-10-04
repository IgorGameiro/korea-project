import { useTranslations } from 'next-intl';
import { UserMenu } from '@/features/auth/user-menu';
import { Link } from '@/i18n/navigation';
import { Container } from '../ui/container';
import { CurrencySwitcher } from './currency-switcher';
import { LanguageSwitcher } from './language-switcher';

export function SiteHeader() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
        <Link href="/" aria-label={t('header.home')} className="flex items-center gap-2 font-bold">
          <span
            aria-hidden="true"
            className="grid size-8 place-items-center rounded-full bg-coral-500 text-white"
          >
            K
          </span>
          <span className="text-lg">{t('meta.siteName')}</span>
        </Link>

        <nav aria-label={t('header.mainNav')} className="order-last w-full sm:order-none sm:w-auto">
          <ul className="flex gap-4 text-sm font-semibold">
            <li>
              <Link href="/" className="hover:text-coral-600">
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link href={{ pathname: '/', hash: 'cities' }} className="hover:text-coral-600">
                {t('nav.cities')}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <CurrencySwitcher />
          <UserMenu />
        </div>
      </Container>
    </header>
  );
}
