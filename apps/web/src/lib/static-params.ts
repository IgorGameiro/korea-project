import 'server-only';
import { routing } from '@/i18n/routing';

export const localeParams = () => routing.locales.map((locale) => ({ locale }));

/**
 * generateStaticParams that never breaks the build: when the API is not reachable at build time
 * (e.g. the Docker image build, where no API is running) it returns [] and Next renders each page
 * on its first request and caches it (on-demand ISR). With the API up, pages are prebuilt.
 */
export async function staticParamsOrOnDemand<T>(build: () => Promise<T[]>): Promise<T[]> {
  try {
    return await build();
  } catch (error) {
    console.warn(
      `[static-params] API unavailable at build time; pages will be generated on first request (${
        error instanceof Error ? error.message : String(error)
      })`,
    );
    return [];
  }
}
