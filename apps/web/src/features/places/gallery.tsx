import Image from 'next/image';
import { useTranslations } from 'next-intl';

/** Large first photo plus thumbnails. Every image has a meaningful alt text. */
export function Gallery({ name, images }: { name: string; images: string[] }) {
  const t = useTranslations('place');
  if (images.length === 0) return null;
  const [first, ...rest] = images;
  const alt = (index: number) => t('photo', { name, index: index + 1, total: images.length });
  return (
    <div className="grid gap-2 sm:grid-cols-[2fr_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-navy-50">
        <Image
          src={first!}
          alt={alt(0)}
          fill
          priority
          sizes="(min-width: 640px) 66vw, 100vw"
          className="object-cover"
        />
      </div>
      {rest.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          {rest.slice(0, 2).map((src, index) => (
            <li
              key={src}
              className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-navy-50"
            >
              <Image
                src={src}
                alt={alt(index + 1)}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
