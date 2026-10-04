'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { type MapPoint, markerStyle } from './types';
import { useKindLabel } from './use-kind-label';

function MapLoading() {
  const t = useTranslations('map');
  return (
    <div className="grid h-full place-items-center bg-navy-50 text-sm text-navy-700" role="status">
      {t('loading')}
    </div>
  );
}

// Leaflet touches `window` on import, so the map only ever renders in the browser.
const LeafletMap = dynamic(() => import('./leaflet-map'), { ssr: false, loading: MapLoading });

/**
 * Interactive map plus a keyboard-friendly list of the same points. The list is the accessible way
 * to explore: every item links to its page and has a "Show on map" button that moves the map there.
 */
export function MapView({ points, label }: { points: MapPoint[]; label: string }) {
  const t = useTranslations('map');
  const kindLabel = useKindLabel();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  if (points.length === 0) return <p className="text-navy-700">{t('empty')}</p>;

  const kinds = [...new Set(points.map((point) => point.kind))];
  const show = (id: string) => {
    setSelectedId(id);
    // On small screens the map sits above the list: bring it into view.
    mapRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-3">
        <div
          ref={mapRef}
          role="region"
          aria-label={label}
          className="isolate h-80 overflow-hidden rounded-[var(--radius-card)] ring-1 ring-navy-100 sm:h-[28rem]"
        >
          <LeafletMap points={points} selectedId={selectedId} kindLabel={kindLabel} />
        </div>
        <ul aria-label={t('legend')} className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {kinds.map((kind) => (
            <li key={kind} className="flex items-center gap-1.5">
              <KindDot kind={kind} />
              {kindLabel(kind)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex min-h-0 flex-col">
        <h3 className="mb-2 font-semibold">{t('list')}</h3>
        <ul className="flex max-h-[28rem] flex-col divide-y divide-navy-100 overflow-y-auto rounded-[var(--radius-card)] ring-1 ring-navy-100">
          {points.map((point) => (
            <li
              key={point.id}
              className={`flex items-center gap-3 p-3 ${point.id === selectedId ? 'bg-navy-50' : ''}`}
            >
              <KindDot kind={point.kind} />
              <div className="min-w-0 flex-1">
                {point.href ? (
                  <Link href={point.href} className="block truncate font-medium hover:underline">
                    {point.name}
                  </Link>
                ) : (
                  <span className="block truncate font-medium">{point.name}</span>
                )}
                <span className="text-xs text-navy-700">{kindLabel(point.kind)}</span>
              </div>
              <button
                type="button"
                onClick={() => show(point.id)}
                aria-label={t('showOnMapLabel', { name: point.name })}
                aria-pressed={point.id === selectedId}
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-coral-600 ring-1 ring-coral-500/40 hover:bg-coral-50"
              >
                {t('showOnMap')}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KindDot({ kind }: { kind: MapPoint['kind'] }) {
  const { icon, color } = markerStyle(kind);
  return (
    <span
      aria-hidden="true"
      className="grid size-7 shrink-0 place-items-center rounded-full text-white"
      style={{ backgroundColor: color }}
    >
      <Icon name={icon} className="size-4" />
    </span>
  );
}
