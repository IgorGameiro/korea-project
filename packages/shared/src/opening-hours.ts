// Structured opening hours stored in Place.openingHours (JSON column).
// All times are local to Korea (Asia/Seoul). A range whose `close` is earlier than `open`
// runs past midnight (e.g. 18:00–02:00). "24:00" is allowed as a closing time.

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export interface TimeRange {
  /** "HH:MM", 00:00–23:59 */
  open: string;
  /** "HH:MM", 00:00–24:00 */
  close: string;
}

export interface OpeningHours {
  /** Every weekday is present; an empty list means closed that day. */
  days: Record<Weekday, TimeRange[]>;
  /** Free-text caveats shown to the user (holidays, seasonal changes, reservations). */
  notes?: string;
}

const OPEN_TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const CLOSE_TIME = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;

/** Returns a list of problems; an empty list means the value is a valid OpeningHours. */
export function validateOpeningHours(value: unknown): string[] {
  if (typeof value !== 'object' || value === null) return ['must be an object'];
  const { days, notes } = value as Partial<OpeningHours>;
  const errors: string[] = [];

  if (notes !== undefined && typeof notes !== 'string') errors.push('notes must be a string');
  if (typeof days !== 'object' || days === null) return [...errors, 'days must be an object'];

  for (const day of WEEKDAYS) {
    const ranges: unknown = days[day];
    if (!Array.isArray(ranges)) {
      errors.push(`days.${day} must be an array`);
      continue;
    }
    ranges.forEach((range: Partial<TimeRange>, i) => {
      if (typeof range.open !== 'string' || !OPEN_TIME.test(range.open)) {
        errors.push(`days.${day}[${i}].open must be HH:MM`);
      }
      if (typeof range.close !== 'string' || !CLOSE_TIME.test(range.close)) {
        errors.push(`days.${day}[${i}].close must be HH:MM or 24:00`);
      }
      if (range.open !== undefined && range.open === range.close) {
        errors.push(`days.${day}[${i}] open and close must differ`);
      }
    });
  }
  return errors;
}
