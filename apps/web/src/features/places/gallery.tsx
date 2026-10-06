import type { Photo } from '@korea-project/shared';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { PhotoCredit } from '@/components/photos/photo-credit';

/**
 * Large first photo plus thumbnails, each with a meaningful alt text and, for real photos, the
 * author and license their free license requires. Placeholders are marked as illustrative.
 */
export function Gallery({ name, photos }: { name: string; photos: Photo[] }) {
  const t = useTranslations('place');
  const tp = useTranslations('photos');
  if (photos.length === 0) return null;
  const alt = (index: number) => t('photo', { name, index: index + 1, total: photos.length });
  const caption = (photo: Photo) =>
    photo.credit ? (
      <PhotoCredit credit={photo.credit} />
    ) : (
      <span className="text-xs text-navy-700">{tp('placeholder')}</span>
    );
  const [first, ...rest] = photos;

  return (
    <div className={`grid gap-2 ${rest.length > 0 ? 'sm:grid-cols-[2fr_1fr]' : ''}`}>
      <figure className="flex flex-col gap-1">
        <div
          className={`relative overflow-hidden rounded-[var(--radius-card)] bg-navy-50 ${
            rest.length > 0 ? 'aspect-[4/3]' : 'aspect-[16/9]'
          }`}
        >
          <Image
            src={first!.url}
            alt={alt(0)}
            fill
            loading="eager"
            fetchPriority="high"
            sizes={rest.length > 0 ? '(min-width: 640px) 66vw, 100vw' : '100vw'}
            className="object-cover"
          />
        </div>
        <figcaption>{caption(first!)}</figcaption>
      </figure>
      {rest.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          {rest.slice(0, 2).map((photo, index) => (
            <li key={photo.url}>
              <figure className="flex flex-col gap-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-navy-50">
                  <Image
                    src={photo.url}
                    alt={alt(index + 1)}
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <figcaption>{caption(photo)}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
