import { type Weekday, WEEKDAYS } from '@korea-project/shared';

// 2026-10-05 is a Monday; noon UTC keeps every locale on the same calendar day.
const REFERENCE = (day: Weekday) => new Date(Date.UTC(2026, 9, 5 + WEEKDAYS.indexOf(day), 12));

export const weekdayName = (day: Weekday, locale: string, style: 'long' | 'short' = 'long') =>
  new Intl.DateTimeFormat(locale, { weekday: style, timeZone: 'UTC' }).format(REFERENCE(day));
