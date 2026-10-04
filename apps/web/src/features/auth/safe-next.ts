const BASE = 'http://site.invalid';
const AUTH_PAGES = /^(\/pt)?\/(login|register)(\/|$)/;

/**
 * The ?next= target after signing in: only a path on this site. Rejects absolute URLs,
 * protocol-relative "//host", "/\host" (browsers treat "\" like "/"), control characters (the URL
 * parser strips tabs/newlines, turning "/\t/host" into "//host") and the auth pages themselves.
 */
export function safeNext(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/')) return null;
  if (value.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(value)) return null;
  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return null;
  }
  if (url.origin !== BASE || AUTH_PAGES.test(url.pathname)) return null;
  return `${url.pathname}${url.search}${url.hash}`;
}
