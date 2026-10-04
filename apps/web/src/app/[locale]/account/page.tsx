import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { AccountView } from '@/features/account/account-view';
import { localeParams } from '@/lib/static-params';

export const generateStaticParams = localeParams;

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/account'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'account' });
  return { title: t('metaTitle'), robots: { index: false, follow: false } };
}

// A static shell: the visitor's data is loaded in the browser with their in-memory token.
export default async function AccountPage({ params }: PageProps<'/[locale]/account'>) {
  setRequestLocale((await params).locale as Locale);
  return (
    <Container className="py-10">
      <AccountView />
    </Container>
  );
}
