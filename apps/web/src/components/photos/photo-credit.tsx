import type { PhotoCredit as Credit } from '@korea-project/shared';
import { useTranslations } from 'next-intl';

/**
 * "Photo: Author · CC BY-SA 4.0" — what the free licenses of Wikimedia Commons require: the author
 * (linked to the file page, which names the source), and the license (linked to its text).
 */
export function PhotoCredit({
  credit,
  tone = 'dark',
  className = '',
}: {
  credit: Credit;
  /** "light" for text over a dark photo (the city hero). */
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const t = useTranslations('photos');
  const link = 'underline decoration-1 underline-offset-2 hover:text-coral-600';
  return (
    <span
      className={`text-xs ${tone === 'light' ? 'text-white/85' : 'text-navy-700'} ${className}`}
    >
      <a href={credit.sourceUrl} target="_blank" rel="noopener noreferrer" className={link}>
        {t('credit', { author: credit.author })}
      </a>
      {' · '}
      {credit.licenseUrl ? (
        <a
          href={credit.licenseUrl}
          target="_blank"
          rel="license noopener noreferrer"
          className={link}
        >
          {credit.license}
        </a>
      ) : (
        credit.license
      )}
    </span>
  );
}
