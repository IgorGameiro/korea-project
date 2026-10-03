import type { Locale } from '@korea-project/shared';
import { getTranslations } from 'next-intl/server';
import { Icon } from '@/components/ui/icon';
import { getPathname } from '@/i18n/navigation';
import { SEARCH_MAX, SEARCH_MIN } from './search-params';

/**
 * A plain GET form: works without JavaScript, the results page is shareable, and the browser
 * enforces the same 2–100 character rule as the API (which validates again anyway).
 */
export async function SearchForm({
  locale,
  defaultValue = '',
}: {
  locale: Locale;
  defaultValue?: string;
}) {
  const t = await getTranslations({ locale, namespace: 'search' });
  return (
    <form
      action={getPathname({ href: '/search', locale })}
      method="get"
      role="search"
      className="w-full"
    >
      <label htmlFor="search-q" className="mb-2 block text-sm font-semibold">
        {t('label')}
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-navy-500"
          />
          <input
            id="search-q"
            name="q"
            type="search"
            required
            minLength={SEARCH_MIN}
            maxLength={SEARCH_MAX}
            defaultValue={defaultValue}
            placeholder={t('placeholder')}
            className="w-full rounded-full border border-navy-200 bg-white py-3 pr-4 pl-10 text-navy-900 placeholder:text-navy-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-coral-600 px-6 py-3 font-semibold text-white hover:bg-coral-700"
        >
          {t('submit')}
        </button>
      </div>
    </form>
  );
}
