import { type OpeningHours, type TimeRange, type Weekday, WEEKDAYS } from '@korea-project/shared';

// "Open now" for a schedule in Korean time. Pure and clock-injected, so it is testable; the
// visitor's own time zone never matters (Intl converts the instant to Asia/Seoul).

export const PLACE_TIME_ZONE = 'Asia/Seoul';

const clockFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: PLACE_TIME_ZONE,
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Weekday and minutes since midnight in Seoul at `now`. */
export function seoulClock(now: Date): { day: Weekday; minutes: number } {
  const parts = Object.fromEntries(clockFormat.formatToParts(now).map((p) => [p.type, p.value]));
  return {
    day: String(parts.weekday).toLowerCase().slice(0, 3) as Weekday,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};
/** close earlier than open (18:00–02:00) runs into the next day; "24:00" is midnight. */
const overnight = (range: TimeRange) => toMinutes(range.close) < toMinutes(range.open);
export const isAllDay = (range: TimeRange) => range.open === '00:00' && range.close === '24:00';

const dayAt = (day: Weekday, offset: number): Weekday =>
  WEEKDAYS[(WEEKDAYS.indexOf(day) + offset + 7) % 7] as Weekday;

export type OpenStatus =
  | { open: true; allDay: true }
  | { open: true; allDay?: false; closesAt: string }
  | { open: false; opensAt: { day: Weekday; time: string; today: boolean } | null };

/** A period ending at 24:00 that the next day continues from 00:00 closes at that later time. */
function closingTime(range: TimeRange, day: Weekday, hours: OpeningHours): string {
  if (range.close !== '24:00') return range.close;
  const continued = hours.days[dayAt(day, 1)].find((next) => next.open === '00:00');
  return continued && !isAllDay(continued) ? continued.close : range.close;
}

export function openStatus(hours: OpeningHours, now: Date): OpenStatus {
  const { day, minutes } = seoulClock(now);
  const yesterday = dayAt(day, -1);

  // Yesterday's late period still running after midnight (e.g. Fri 18:00–02:00 at Sat 01:00).
  for (const range of hours.days[yesterday]) {
    if (overnight(range) && minutes < toMinutes(range.close)) {
      return { open: true, closesAt: range.close };
    }
  }
  for (const range of hours.days[day]) {
    const opens = toMinutes(range.open);
    if (isAllDay(range)) return { open: true, allDay: true };
    if (
      overnight(range) ? minutes >= opens : minutes >= opens && minutes < toMinutes(range.close)
    ) {
      return { open: true, closesAt: closingTime(range, day, hours) };
    }
  }

  // Closed: the next opening, today later or on one of the next 7 days.
  for (let offset = 0; offset <= 7; offset++) {
    const candidate = dayAt(day, offset);
    const next = [...hours.days[candidate]]
      .filter((range) => offset > 0 || toMinutes(range.open) > minutes)
      .sort((a, b) => toMinutes(a.open) - toMinutes(b.open))[0];
    if (next)
      return { open: false, opensAt: { day: candidate, time: next.open, today: offset === 0 } };
  }
  return { open: false, opensAt: null };
}
