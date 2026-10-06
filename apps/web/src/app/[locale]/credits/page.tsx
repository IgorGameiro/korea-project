import type { Locale, Photo } from '@korea-project/shared';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PhotoCredit } from '@/components/photos/photo-credit';
import { Container } from '@/components/ui/container';
import { Link } from '@/i18n/navigation';
import { loadAtBuildOr, serverApi } from '@/lib/api/server';
import { alternatesFor } from '@/lib/seo';
import { localeParams } from '@/lib/static-params';

export const revalidate = 3600;
export const generateStaticParams = localeParams;

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/credits'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'photos' });
  return {
    title: t('creditsMetaTitle'),
    description: t('creditsIntro'),
    alternates: alternatesFor('/credits', locale as Locale),
  };
}

/** Every credited photo with its author, license and source (what the free licenses require). */
export default async function CreditsPage({ params }: PageProps<'/[locale]/credits'>) {
  const locale = (await params).locale as Locale;
  setRequestLocale(locale);
  const t = await getTranslations('photos');
  const credits = await loadAtBuildOr(
    serverApi(3600).GET('/api/v1/credits', { params: { query: { locale } } }),
    null,
  );

  return (
    <Container className="flex max-w-4xl flex-col gap-8 py-10">
      <div>
        <h1 className="text-3xl font-bold">{t('creditsTitle')}</h1>
        <p className="mt-2 text-navy-700">{t('creditsIntro')}</p>
      </div>
      {credits ? (
        <>
          <section aria-labelledby="credits-cities">
            <h2 id="credits-cities" className="text-xl font-bold">
              {t('cities')}
            </h2>
            <ul className="mt-3 divide-y divide-navy-100">
              {credits.cities.map((city) => (
                <CreditRow
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  name={city.name}
                  photo={city.photo as Photo}
                />
              ))}
            </ul>
          </section>
          <section aria-labelledby="credits-places">
            <h2 id="credits-places" className="text-xl font-bold">
              {t('places')}
            </h2>
            <ul className="mt-3 divide-y divide-navy-100">
              {credits.places.flatMap((place) =>
                (place.photos as Photo[]).map((photo) => (
                  <CreditRow
                    key={photo.url}
                    href={`/places/${place.slug}`}
                    name={place.name}
                    detail={t('in', { city: place.cityName })}
                    photo={photo}
                  />
                )),
              )}
            </ul>
          </section>
        </>
      ) : (
        <p role="status" className="rounded-[var(--radius-card)] bg-navy-50 p-4">
          {t('unavailable')}
        </p>
      )}
    </Container>
  );
}

function CreditRow({
  href,
  name,
  detail,
  photo,
}: {
  href: string;
  name: string;
  detail?: string;
  photo: Photo;
}) {
  return (
    <li className="flex items-center gap-4 py-3">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-navy-50">
        <Image src={photo.url} alt="" fill sizes="64px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-col">
        <Link href={href} className="font-semibold hover:underline">
          {name}
        </Link>
        {detail ? <span className="text-sm text-navy-700">{detail}</span> : null}
        {photo.credit ? <PhotoCredit credit={photo.credit} /> : null}
      </div>
    </li>
  );
}
