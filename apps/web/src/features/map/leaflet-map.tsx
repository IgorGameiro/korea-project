'use client';

import 'leaflet/dist/leaflet.css';
import { divIcon, latLngBounds, type Marker as LeafletMarker } from 'leaflet';
import { useTranslations } from 'next-intl';
import { type RefObject, useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { ICON_PATHS } from '@/components/ui/icon';
import { Link } from '@/i18n/navigation';
import { mapTiles } from '@/lib/env';
import { type MapPoint, type MapPointKind, markerStyle } from './types';

// The only file that knows about Leaflet: swapping to another provider (e.g. Mapbox GL JS)
// means writing another component with the same props.

const iconCache = new Map<MapPointKind, ReturnType<typeof divIcon>>();

/** Round marker with the category's icon on its color (the icon tells kinds apart, not color). */
function markerIcon(kind: MapPointKind) {
  let icon = iconCache.get(kind);
  if (!icon) {
    const style = markerStyle(kind);
    icon = divIcon({
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
      html: `<span class="grid size-8 place-items-center rounded-full text-white shadow-md ring-2 ring-white" style="background-color:${style.color}"><svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICON_PATHS[style.icon]}"/></svg></span>`,
    });
    iconCache.set(kind, icon);
  }
  return icon;
}

/** Moves the map to the point chosen in the list and opens its popup. */
function FlyToSelected({
  selectedId,
  markers,
}: {
  selectedId: string | null;
  markers: RefObject<Map<string, LeafletMarker>>;
}) {
  const map = useMap();
  useEffect(() => {
    const marker = selectedId ? markers.current.get(selectedId) : undefined;
    if (!marker) return;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.6 });
    marker.openPopup();
  }, [map, markers, selectedId]);
  return null;
}

function FitToPoints({ points }: { points: MapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) {
      const [point] = points;
      if (point) map.setView([point.latitude, point.longitude], 15);
      return;
    }
    map.fitBounds(latLngBounds(points.map((p) => [p.latitude, p.longitude])), {
      padding: [32, 32],
    });
  }, [map, points]);
  return null;
}

export default function LeafletMap({
  points,
  selectedId,
  kindLabel,
}: {
  points: MapPoint[];
  selectedId: string | null;
  kindLabel: (kind: MapPointKind) => string;
}) {
  const t = useTranslations('map');
  const markers = useRef(new Map<string, LeafletMarker>());
  const first = points[0];
  const center = useMemo(
    () => (first ? ([first.latitude, first.longitude] as [number, number]) : undefined),
    [first],
  );

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer url={mapTiles.url} attribution={mapTiles.attribution} />
      <FitToPoints points={points} />
      <FlyToSelected selectedId={selectedId} markers={markers} />
      {points.map((point) => {
        const label = `${point.name} — ${kindLabel(point.kind)}`;
        return (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={markerIcon(point.kind)}
            title={label}
            ref={(marker) => {
              if (marker) markers.current.set(point.id, marker);
              else markers.current.delete(point.id);
            }}
            eventHandlers={{
              // Leaflet makes markers focusable buttons; give them a spoken name.
              add: (event) => event.target.getElement()?.setAttribute('aria-label', label),
            }}
          >
            <Popup>
              <strong className="block">{point.name}</strong>
              <span className="block text-xs">{kindLabel(point.kind)}</span>
              {point.href ? (
                <Link href={point.href} className="mt-1 block font-semibold">
                  {t('viewDetails')}
                </Link>
              ) : null}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
