import type { PlaceCategory } from '@korea-project/shared';
import { type IconName, CATEGORY_META } from '@/lib/categories';

/** What a marker represents: a place category, or a stay (accommodation). */
export type MapPointKind = PlaceCategory | 'STAY';

/** Provider-agnostic map point: the MapView never exposes Leaflet types. */
export interface MapPoint {
  id: string;
  name: string;
  kind: MapPointKind;
  latitude: number;
  longitude: number;
  /** Detail page, when the point has one. */
  href?: string;
}

const STAY_STYLE = { icon: 'bed', color: '#45607d' } as const;

/** Every kind has an icon AND a color (and a text label in the list/legend): never color alone. */
export const markerStyle = (kind: MapPointKind): { icon: IconName; color: string } =>
  kind === 'STAY' ? STAY_STYLE : CATEGORY_META[kind];
