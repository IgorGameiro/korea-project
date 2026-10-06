'use client';

import {
  type OpeningHours,
  type TimeRange,
  type Weekday,
  validateOpeningHours,
  WEEKDAYS,
} from '@korea-project/shared';
import { useId } from 'react';
import { buttonClasses } from '@/components/ui/button';

const DAY_NAMES: Record<Weekday, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const ALL_DAY: TimeRange = { open: '00:00', close: '24:00' };
const DEFAULT_RANGE: TimeRange = { open: '09:00', close: '18:00' };
const isAllDay = (ranges: TimeRange[]) =>
  ranges.length === 1 && ranges[0]?.open === '00:00' && ranges[0]?.close === '24:00';

export const emptyWeek = (): OpeningHours => ({
  days: Object.fromEntries(
    WEEKDAYS.map((day) => [day, [{ ...DEFAULT_RANGE }]]),
  ) as OpeningHours['days'],
});

/** Problems with the schedule (the same rules the API applies), or [] when it is valid. */
export const openingHoursProblems = (value: OpeningHours | null) =>
  value === null ? [] : validateOpeningHours(value);

/**
 * Visual weekly schedule. `null` means "hours unknown" (nothing is shown on the site).
 * Times are Korea time, HH:MM; a closing time earlier than the opening time runs past midnight.
 */
export function OpeningHoursEditor({
  value,
  onChange,
}: {
  value: OpeningHours | null;
  onChange: (next: OpeningHours | null) => void;
}) {
  const id = useId();
  const problems = openingHoursProblems(value);

  const setDay = (day: Weekday, ranges: TimeRange[]) =>
    value && onChange({ days: { ...value.days, [day]: ranges } });

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          className="size-4 accent-navy-900"
          checked={value !== null}
          onChange={(event) => onChange(event.target.checked ? emptyWeek() : null)}
        />
        Opening hours are known
      </label>

      {value ? (
        <>
          <p id={`${id}-help`} className="text-xs text-navy-700">
            Korea time, HH:MM. A closing time earlier than the opening time runs past midnight
            (18:00–02:00). Use 24:00 to close at midnight.
          </p>
          <div>
            <button
              type="button"
              onClick={() =>
                onChange({
                  days: Object.fromEntries(
                    WEEKDAYS.map((day) => [day, value.days.mon.map((r) => ({ ...r }))]),
                  ) as OpeningHours['days'],
                })
              }
              className={buttonClasses('secondary')}
            >
              Copy Monday to every day
            </button>
          </div>
          <ul className="flex flex-col divide-y divide-navy-100 rounded-[var(--radius-card)] ring-1 ring-navy-100">
            {WEEKDAYS.map((day) => {
              const ranges = value.days[day];
              const closed = ranges.length === 0;
              const allDay = isAllDay(ranges);
              return (
                <li key={day} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-start">
                  <fieldset className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start">
                    <legend className="w-28 shrink-0 pt-1 text-sm font-semibold sm:float-left">
                      {DAY_NAMES[day]}
                    </legend>
                    <div className="flex flex-wrap gap-4 pt-1 text-sm">
                      <label className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          className="accent-navy-900"
                          checked={closed}
                          onChange={(e) =>
                            setDay(day, e.target.checked ? [] : [{ ...DEFAULT_RANGE }])
                          }
                        />
                        Closed
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          className="accent-navy-900"
                          checked={allDay}
                          onChange={(e) =>
                            setDay(
                              day,
                              e.target.checked ? [{ ...ALL_DAY }] : [{ ...DEFAULT_RANGE }],
                            )
                          }
                        />
                        24 hours
                      </label>
                    </div>
                    {!closed && !allDay ? (
                      <div className="flex flex-col gap-2 sm:ml-4">
                        {ranges.map((range, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <TimeInput
                              label={`${DAY_NAMES[day]} period ${index + 1} opens`}
                              value={range.open}
                              describedBy={`${id}-help`}
                              onChange={(open) =>
                                setDay(
                                  day,
                                  ranges.map((r, i) => (i === index ? { ...r, open } : r)),
                                )
                              }
                            />
                            <span aria-hidden="true">–</span>
                            <TimeInput
                              label={`${DAY_NAMES[day]} period ${index + 1} closes`}
                              value={range.close}
                              describedBy={`${id}-help`}
                              onChange={(close) =>
                                setDay(
                                  day,
                                  ranges.map((r, i) => (i === index ? { ...r, close } : r)),
                                )
                              }
                            />
                            {ranges.length > 1 ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setDay(
                                    day,
                                    ranges.filter((_, i) => i !== index),
                                  )
                                }
                                aria-label={`Remove ${DAY_NAMES[day]} period ${index + 1}`}
                                className="font-semibold text-coral-700 underline underline-offset-4"
                              >
                                Remove
                              </button>
                            ) : null}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setDay(day, [...ranges, { open: '18:00', close: '22:00' }])
                          }
                          className="self-start text-sm font-semibold underline underline-offset-4"
                        >
                          Add a period on {DAY_NAMES[day]}
                        </button>
                      </div>
                    ) : null}
                  </fieldset>
                </li>
              );
            })}
          </ul>
          {problems.length > 0 ? (
            <ul
              role="alert"
              className="list-disc rounded-lg bg-coral-50 p-3 pl-8 text-sm text-coral-700"
            >
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function TimeInput({
  label,
  value,
  describedBy,
  onChange,
}: {
  label: string;
  value: string;
  describedBy: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      aria-describedby={describedBy}
      placeholder="HH:MM"
      maxLength={5}
      value={value}
      onChange={(event) => onChange(event.target.value.trim())}
      className="w-20 rounded-lg border border-navy-200 bg-white px-2 py-1.5 text-center font-mono"
    />
  );
}
