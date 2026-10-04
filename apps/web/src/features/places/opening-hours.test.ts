import type { OpeningHours, TimeRange, Weekday } from '@korea-project/shared';
import { describe, expect, it } from 'vitest';
import { openStatus, seoulClock } from './opening-hours';

// Korea has no daylight saving time: Seoul is always UTC+9.
// 2026-10-05 is a Monday. `kst('mon', '13:30')` is that instant expressed in UTC.
const DATES: Record<Weekday, string> = {
  mon: '2026-10-05',
  tue: '2026-10-06',
  wed: '2026-10-07',
  thu: '2026-10-08',
  fri: '2026-10-09',
  sat: '2026-10-10',
  sun: '2026-10-11',
};
const kst = (day: Weekday, time: string) => new Date(`${DATES[day]}T${time}:00+09:00`);

const week = (ranges: Partial<Record<Weekday, TimeRange[]>>, fallback: TimeRange[] = []) => ({
  days: Object.fromEntries(
    (Object.keys(DATES) as Weekday[]).map((day) => [day, ranges[day] ?? fallback]),
  ) as OpeningHours['days'],
});
const r = (open: string, close: string): TimeRange => ({ open, close });

describe('seoulClock', () => {
  it('converts any instant to Seoul time, whatever the machine time zone', () => {
    // 23:30 UTC on Sunday is 08:30 on Monday in Seoul.
    expect(seoulClock(new Date('2026-10-04T23:30:00Z'))).toEqual({ day: 'mon', minutes: 510 });
  });

  it('midnight is minute 0 of the new day', () => {
    expect(seoulClock(kst('tue', '00:00'))).toEqual({ day: 'tue', minutes: 0 });
  });
});

describe('openStatus', () => {
  const office = week({}, [r('09:00', '18:00')]);

  it('is open inside a period and says when it closes', () => {
    expect(openStatus(office, kst('wed', '09:00'))).toEqual({ open: true, closesAt: '18:00' });
    expect(openStatus(office, kst('wed', '17:59'))).toEqual({ open: true, closesAt: '18:00' });
  });

  it('is closed at the closing minute and says when it opens next', () => {
    expect(openStatus(office, kst('wed', '18:00'))).toEqual({
      open: false,
      opensAt: { day: 'thu', time: '09:00', today: false },
    });
    expect(openStatus(office, kst('wed', '08:00'))).toEqual({
      open: false,
      opensAt: { day: 'wed', time: '09:00', today: true },
    });
  });

  it('handles a closed day (empty list) and skips it for the next opening', () => {
    const closedMonday = week({ mon: [] }, [r('10:00', '20:00')]);
    expect(openStatus(closedMonday, kst('mon', '12:00'))).toEqual({
      open: false,
      opensAt: { day: 'tue', time: '10:00', today: false },
    });
    expect(openStatus(closedMonday, kst('sun', '21:00'))).toEqual({
      open: false,
      opensAt: { day: 'tue', time: '10:00', today: false },
    });
  });

  it('handles several periods a day (lunch and dinner)', () => {
    const shifts = week({}, [r('11:30', '15:00'), r('17:30', '22:00')]);
    expect(openStatus(shifts, kst('fri', '12:00'))).toEqual({ open: true, closesAt: '15:00' });
    expect(openStatus(shifts, kst('fri', '16:00'))).toEqual({
      open: false,
      opensAt: { day: 'fri', time: '17:30', today: true },
    });
    expect(openStatus(shifts, kst('fri', '21:00'))).toEqual({ open: true, closesAt: '22:00' });
  });

  it('a period past midnight keeps the place open into the next day (day rollover)', () => {
    const bar = week({ fri: [r('18:00', '02:00')], sat: [r('18:00', '02:00')] });
    expect(openStatus(bar, kst('fri', '23:00'))).toEqual({ open: true, closesAt: '02:00' });
    expect(openStatus(bar, kst('sat', '00:00'))).toEqual({ open: true, closesAt: '02:00' });
    expect(openStatus(bar, kst('sat', '01:59'))).toEqual({ open: true, closesAt: '02:00' });
    expect(openStatus(bar, kst('sat', '02:00'))).toEqual({
      open: false,
      opensAt: { day: 'sat', time: '18:00', today: true },
    });
    // Saturday's late period runs into Sunday, even though Sunday itself has no hours.
    expect(openStatus(bar, kst('sun', '01:00'))).toEqual({ open: true, closesAt: '02:00' });
    expect(openStatus(bar, kst('sun', '03:00'))).toEqual({
      open: false,
      opensAt: { day: 'fri', time: '18:00', today: false },
    });
  });

  it('closing at 24:00 closes at midnight', () => {
    const late = week({ thu: [r('20:00', '24:00')] });
    expect(openStatus(late, kst('thu', '23:59'))).toEqual({ open: true, closesAt: '24:00' });
    expect(openStatus(late, kst('fri', '00:00')).open).toBe(false);
  });

  it('24:00 followed by 00:00 the next day reads as one period', () => {
    const club = week({ fri: [r('22:00', '24:00')], sat: [r('00:00', '05:00')] });
    expect(openStatus(club, kst('fri', '23:00'))).toEqual({ open: true, closesAt: '05:00' });
    expect(openStatus(club, kst('sat', '04:00'))).toEqual({ open: true, closesAt: '05:00' });
  });

  it('open 24 hours', () => {
    const always = week({}, [r('00:00', '24:00')]);
    expect(openStatus(always, kst('tue', '00:00'))).toEqual({ open: true, allDay: true });
    expect(openStatus(always, kst('tue', '23:59'))).toEqual({ open: true, allDay: true });
  });

  it('never opens: no next opening', () => {
    expect(openStatus(week({}), kst('mon', '12:00'))).toEqual({ open: false, opensAt: null });
  });
});
