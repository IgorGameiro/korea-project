'use client';

import type { Locale } from '@korea-project/shared';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

/**
 * Links to the current page in every language (not a <select>: links are crawlable, work without
 * JavaScript and carry hrefLang). The current language is marked with aria-current.
 */
export function LanguageSwitcher() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  return (
    <nav aria-label={t('header.switchLanguage')}>
      <ul className="flex items-center gap-1 text-sm">
        {routing.locales.map((target) => (
          <li key={target}>
            <Link
              href={pathname}
              locale={target}
              hrefLang={target}
              lang={target}
              aria-current={target === locale ? 'true' : undefined}
              className={`rounded-full px-2.5 py-1 font-semibold ${
                target === locale ? 'bg-navy-900 text-white' : 'text-navy-700 hover:bg-navy-50'
              }`}
            >
              {target === 'en' ? 'EN' : 'PT'}
              <span className="sr-only"> — {t(`localeNames.${target}`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
