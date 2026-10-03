import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_KR } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { loadOr, serverApi } from '@/lib/api/server';
import { CurrencyProvider } from '@/lib/currency/currency-context';
import { siteUrl } from '@/lib/env';
import { alternatesFor } from '@/lib/seo';
import { localeParams } from '@/lib/static-params';
import '../globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap', variable: '--font-inter' });

// Korean names only. Google Fonts splits Hangul into ~100 unicode-range slices; without preloading,
// the browser downloads just the slices for the characters actually on the page.
const notoSansKr = Noto_Sans_KR({
  weight: ['400', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-noto-kr',
});

export const generateStaticParams = localeParams;

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL(siteUrl),
    title: { default: t('title'), template: `%s · ${t('siteName')}` },
    description: t('description'),
    alternates: alternatesFor('/', locale as Locale),
    openGraph: { siteName: t('siteName'), locale, type: 'website' },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Enables static rendering: next-intl would otherwise read the locale from request headers.
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'nav' });
  // Non-essential: without rates, prices are shown in KRW only.
  const { rates } = await loadOr(serverApi(3600).GET('/api/v1/exchange-rates'), {
    base: 'KRW',
    rates: [],
  });

  return (
    <html lang={locale} className={`${inter.variable} ${notoSansKr.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider>
          <CurrencyProvider
            locale={locale}
            rates={rates.map((r) => ({ ...r, updatedAt: String(r.updatedAt) }))}
          >
            {children}
          </CurrencyProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
