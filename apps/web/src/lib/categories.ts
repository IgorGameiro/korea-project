import { PlaceCategory } from '@korea-project/shared';

export type IconName =
  | 'utensils'
  | 'moon'
  | 'mountain'
  | 'landmark'
  | 'coffee'
  | 'shopping-bag'
  | 'temple'
  | 'leaf'
  | 'bed';

/**
 * Per-category presentation. Every category has its own ICON as well as a color, so badges and map
 * markers never rely on color alone (WCAG 1.4.1). `section` is the URL segment under /cities/[slug].
 */
export const CATEGORY_META: Record<
  PlaceCategory,
  { icon: IconName; color: string; section: string }
> = {
  RESTAURANT: { icon: 'utensils', color: '#c9353a', section: 'restaurants' },
  NIGHTLIFE: { icon: 'moon', color: '#6b3fa0', section: 'nightlife' },
  HIKING: { icon: 'mountain', color: '#2f6b3a', section: 'hiking' },
  ATTRACTION: { icon: 'landmark', color: '#16335c', section: 'attractions' },
  CAFE: { icon: 'coffee', color: '#8a5a2b', section: 'cafes' },
  SHOPPING: { icon: 'shopping-bag', color: '#b8336a', section: 'shopping' },
  CULTURE: { icon: 'temple', color: '#9a6b00', section: 'culture' },
  NATURE: { icon: 'leaf', color: '#1f7a6d', section: 'nature' },
};

export const CATEGORIES = Object.values(PlaceCategory);
