import { PHASE_PRODUCTION_BUILD } from 'next/constants';

/**
 * Runs once when the server starts (Next.js instrumentation hook). Only for the Docker image, whose
 * build has no API: on Vercel the build reaches the API, and serverless instances start per request.
 */
export async function register() {
  if (
    process.env.VERCEL ||
    process.env.NEXT_RUNTIME !== 'nodejs' ||
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD
  ) {
    return;
  }
  const { serverApiUrl } = await import('./lib/env');
  const { issueStartupToken, refreshAfterStartup } = await import('./lib/startup-refresh');
  const siteOrigin = `http://127.0.0.1:${process.env.PORT ?? 3000}`;
  // Not awaited: the server must start listening for the refresh to reach it.
  void refreshAfterStartup({ apiUrl: serverApiUrl, siteOrigin, token: issueStartupToken() }).then(
    (done) =>
      console.info(
        done
          ? 'Startup: prebuilt pages invalidated, they regenerate with live data.'
          : 'Startup: the API did not answer; prebuilt pages refresh at the end of their ISR window.',
      ),
  );
}
