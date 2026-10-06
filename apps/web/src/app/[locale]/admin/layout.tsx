import type { Locale } from '@korea-project/shared';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/container';
import { AdminGuard } from '@/features/admin/admin-guard';
import { AdminNav } from '@/features/admin/admin-nav';
import { redirect } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
};

// The admin is an internal tool in English only (content is still edited in every language).
export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== 'en') redirect({ href: '/admin', locale: 'en' });
  setRequestLocale(locale as Locale);
  return (
    <Container className="flex flex-col gap-6 py-8">
      <AdminGuard>
        <AdminNav />
        {children}
      </AdminGuard>
    </Container>
  );
}
