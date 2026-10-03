import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { type OpeningHours, validateOpeningHours, WEEKDAYS } from './opening-hours.ts';

const everyDay = (open: string, close: string): OpeningHours['days'] =>
  Object.fromEntries(WEEKDAYS.map((d) => [d, [{ open, close }]])) as OpeningHours['days'];

describe('validateOpeningHours', () => {
  it('accepts regular, overnight, 24h and closed days', () => {
    const days = everyDay('11:00', '02:00');
    days.mon = [];
    days.sat = [{ open: '00:00', close: '24:00' }];
    days.sun = [
      { open: '11:30', close: '15:00' },
      { open: '17:30', close: '22:00' },
    ];

    assert.deepEqual(validateOpeningHours({ days, notes: 'Fecha em feriados' }), []);
  });

  it('requires every weekday', () => {
    const { tue: _removed, ...days } = everyDay('09:00', '18:00');

    assert.deepEqual(validateOpeningHours({ days }), ['days.tue must be an array']);
  });

  it('rejects malformed times and empty ranges', () => {
    const days = everyDay('09:00', '18:00');
    days.wed = [{ open: '9:00', close: '25:00' }];
    days.thu = [{ open: '10:00', close: '10:00' }];

    assert.deepEqual(validateOpeningHours({ days }), [
      'days.wed[0].open must be HH:MM',
      'days.wed[0].close must be HH:MM or 24:00',
      'days.thu[0] open and close must differ',
    ]);
  });

  it('rejects non-objects', () => {
    assert.deepEqual(validateOpeningHours(null), ['must be an object']);
    assert.deepEqual(validateOpeningHours({ notes: 1 }), [
      'notes must be a string',
      'days must be an object',
    ]);
  });
});
