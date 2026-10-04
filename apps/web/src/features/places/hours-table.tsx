import { type OpeningHours, WEEKDAYS } from '@korea-project/shared';
import { useLocale, useTranslations } from 'next-intl';
import { isAllDay } from './opening-hours';
import { weekdayName } from './weekdays';

/** The weekly schedule as a table (static: the same for every visitor). */
export function HoursTable({ hours }: { hours: OpeningHours }) {
  const t = useTranslations('place');
  const locale = useLocale();
  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{t('hours')}</caption>
      <tbody>
        {WEEKDAYS.map((day) => {
          const ranges = hours.days[day];
          return (
            <tr key={day} className="border-b border-navy-100 last:border-0">
              <th scope="row" className="py-1.5 pr-4 text-left font-medium first-letter:uppercase">
                {weekdayName(day, locale)}
              </th>
              <td className="py-1.5 text-right">
                {ranges.length === 0
                  ? t('closed')
                  : ranges.some(isAllDay)
                    ? t('allDay')
                    : ranges.map((range) => `${range.open}–${range.close}`).join(', ')}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
