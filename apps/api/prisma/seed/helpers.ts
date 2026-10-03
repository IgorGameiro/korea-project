import { type OpeningHours, type TimeRange, type Weekday, WEEKDAYS } from '@korea-project/shared';

/** "Palácio Gyeongbokgung" -> "palacio-gyeongbokgung" */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Placeholder photos: deterministic per seed string, never broken. Replace with real photos later.
const picsum = (seed: string, width: number, height: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(`korea-project-${seed}`)}/${width}/${height}`;

export const heroImage = (citySlug: string) => picsum(`city-${citySlug}`, 1600, 900);

export const galleryImages = (slug: string, count = 3) =>
  Array.from({ length: count }, (_, i) => picsum(`${slug}-${i + 1}`, 1200, 800));

// ---------------------------------------------------------------------------
// Opening hours builders
// ---------------------------------------------------------------------------

const range = (open: string, close: string): TimeRange => ({ open, close });

function build(perDay: (day: Weekday) => TimeRange[], notes?: string): OpeningHours {
  const days = Object.fromEntries(
    WEEKDAYS.map((day) => [day, perDay(day)]),
  ) as OpeningHours['days'];
  return notes ? { days, notes } : { days };
}

/** Same hours every day. Overnight ranges (close < open) are allowed. */
export const everyDay = (open: string, close: string, notes?: string) =>
  build(() => [range(open, close)], notes);

/** Same hours every day except the listed closing days. */
export const closedOn = (closed: Weekday[], open: string, close: string, notes?: string) =>
  build((day) => (closed.includes(day) ? [] : [range(open, close)]), notes);

/** Lunch and dinner service with a break in between. */
export const splitShift = (
  lunch: [string, string],
  dinner: [string, string],
  closed: Weekday[] = [],
  notes?: string,
) => build((day) => (closed.includes(day) ? [] : [range(...lunch), range(...dinner)]), notes);

/** Public spaces with free access at any time (streets, beaches, parks, trails). */
export const alwaysOpen = (notes?: string) => everyDay('00:00', '24:00', notes);
