'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { FavoriteError, toggleFavorite, useFavorites } from './favorites-store';

/**
 * Heart toggle. A real button with aria-pressed and a stable name ("Save X to favorites"), so
 * screen readers announce "pressed" when saved. Anonymous visitors get a link to log in instead.
 * `variant="card"` is the round icon over a card image; `"full"` shows the text too.
 */
export function FavoriteButton({
  placeId,
  placeName,
  variant = 'full',
}: {
  placeId: string;
  placeName: string;
  variant?: 'card' | 'full';
}) {
  const t = useTranslations('favorites');
  const favorites = useFavorites();
  const [failed, setFailed] = useState(false);
  const saved = favorites.isFavorite(placeId);

  const shape =
    variant === 'card'
      ? 'grid size-10 place-items-center rounded-full bg-white/95 shadow-md'
      : 'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-navy-200';

  if (favorites.restoring || (favorites.signedIn && !favorites.ready)) {
    // Neutral while we cannot know yet; same size, so nothing jumps.
    return (
      <span aria-hidden="true" className={`${shape} text-navy-200`}>
        <Icon name="heart" className="size-5" />
        {variant === 'full' ? t('saveShort') : null}
      </span>
    );
  }

  if (!favorites.signedIn) {
    const next = typeof window === 'undefined' ? '/' : window.location.pathname;
    return (
      <Link
        href={{ pathname: '/login', query: { next } }}
        aria-label={t('loginToSave', { name: placeName })}
        className={`${shape} text-navy-700 hover:text-coral-600`}
      >
        <Icon name="heart" className="size-5" />
        {variant === 'full' ? t('saveShort') : null}
      </Link>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        aria-pressed={saved}
        aria-label={t('save', { name: placeName })}
        onClick={async () => {
          setFailed(false);
          try {
            await toggleFavorite(placeId);
          } catch (error) {
            if (error instanceof FavoriteError) setFailed(true);
          }
        }}
        className={`${shape} ${saved ? 'text-coral-600' : 'text-navy-700 hover:text-coral-600'}`}
      >
        <Icon name="heart" filled={saved} className="size-5" />
        {variant === 'full' ? (saved ? t('saved') : t('saveShort')) : null}
      </button>
      {failed ? (
        <span role="alert" className="rounded bg-white px-1 text-xs font-medium text-coral-700">
          {t('error')}
        </span>
      ) : null}
    </span>
  );
}
