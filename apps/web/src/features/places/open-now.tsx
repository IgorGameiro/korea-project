'use client';

import type { OpeningHours } from '@korea-project/shared';
import { useLocale, useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';
import { openStatus } from './opening-hours';
import { weekdayName } from './weekdays';

// The page is static, so "now" is only known in the browser: on the server (and during hydration)
// the clock is null and nothing is rendered; afterwards it ticks every 30 seconds.
const subscribe = (onChange: () => void) => {
  const timer = setInterval(onChange, 30_000);
  return () => clearInterval(timer);
};
const currentMinute = () => Math.floor(Date.now() / 60_000);
const noClock = () => null;

export function OpenNow({ hours }: { hours: OpeningHours }) {
  const t = useTranslations('place');
  const locale = useLocale();
  const minute = useSyncExternalStore(subscribe, currentMinute, noClock);
  if (minute === null) return null;

  const status = openStatus(hours, new Date(minute * 60_000));
  const detail = status.open
    ? status.allDay
      ? t('allDay')
      : t('closesAt', { time: status.closesAt })
    : status.opensAt
      ? status.opensAt.today
        ? t('opensToday', { time: status.opensAt.time })
        : t('opensOn', { day: weekdayName(status.opensAt.day, locale), time: status.opensAt.time })
      : null;

  return (
    <p role="status" className="flex flex-wrap items-center gap-2 text-sm">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold ${
          status.open ? 'bg-emerald-50 text-emerald-800' : 'bg-coral-50 text-coral-700'
        }`}
      >
        <span
          aria-hidden="true"
          className={`size-2 rounded-full ${status.open ? 'bg-emerald-600' : 'bg-coral-600'}`}
        />
        {status.open ? t('openNow') : t('closedNow')}
      </span>
      {detail ? <span>{detail}</span> : null}
    </p>
  );
}
