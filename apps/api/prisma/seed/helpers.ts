import {
  type OpeningHours,
  type Photo,
  type TimeRange,
  type Weekday,
  WEEKDAYS,
} from '@korea-project/shared';

/** "Hotel Shilla & Spa" -> "hotel-shilla-and-spa" */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Placeholder photos (no credit needed): deterministic per seed string, never broken. Used where no
// reviewed real photo exists (see data/photos.ts).
const picsum = (seed: string, width: number, height: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(`korea-project-${seed}`)}/${width}/${height}`;

export const heroImage = (citySlug: string) => picsum(`city-${citySlug}`, 1600, 900);

export const galleryImages = (slug: string, count = 3) =>
  Array.from({ length: count }, (_, i) => picsum(`${slug}-${i + 1}`, 1200, 800));

/** A place's photos: the reviewed real one (with its credit), or uncredited placeholders. */
export const placeImages = (slug: string, real: Photo | undefined): Photo[] =>
  real ? [real] : galleryImages(slug).map((url) => ({ url }));

// ---------------------------------------------------------------------------
// Opening hours builders (language-neutral; caveats go in the translated hoursNote)
// ---------------------------------------------------------------------------

const range = (open: string, close: string): TimeRange => ({ open, close });

function build(perDay: (day: Weekday) => TimeRange[]): OpeningHours {
  return {
    days: Object.fromEntries(WEEKDAYS.map((day) => [day, perDay(day)])) as OpeningHours['days'],
  };
}

/** Same hours every day. Overnight ranges (close < open) are allowed. */
export const everyDay = (open: string, close: string) => build(() => [range(open, close)]);

/** Same hours every day except the listed closing days. */
export const closedOn = (closed: Weekday[], open: string, close: string) =>
  build((day) => (closed.includes(day) ? [] : [range(open, close)]));

/** Lunch and dinner service with a break in between. */
export const splitShift = (
  lunch: [string, string],
  dinner: [string, string],
  closed: Weekday[] = [],
) => build((day) => (closed.includes(day) ? [] : [range(...lunch), range(...dinner)]));

/** Public spaces with free access at any time (streets, beaches, parks, trails). */
export const alwaysOpen = () => everyDay('00:00', '24:00');
