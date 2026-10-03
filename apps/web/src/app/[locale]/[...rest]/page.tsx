import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

export default async function CatchAll({ params }: PageProps<'/[locale]/[...rest]'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  notFound();
}
