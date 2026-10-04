import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { AuthPage, authMetadata } from '@/features/auth/auth-page';
import { localeParams } from '@/lib/static-params';

export const generateStaticParams = localeParams;

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/register'>): Promise<Metadata> {
  return authMetadata((await params).locale, 'register');
}

export default async function Page({ params }: PageProps<'/[locale]/register'>) {
  return <AuthPage locale={(await params).locale as Locale} mode="register" />;
}
