import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { AuthPage, authMetadata } from '@/features/auth/auth-page';
import { localeParams } from '@/lib/static-params';

export const generateStaticParams = localeParams;

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/login'>): Promise<Metadata> {
  return authMetadata((await params).locale, 'login');
}

export default async function Page({ params }: PageProps<'/[locale]/login'>) {
  return <AuthPage locale={(await params).locale as Locale} mode="login" />;
}
