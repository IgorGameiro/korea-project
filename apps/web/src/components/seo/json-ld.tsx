import { type JsonLdObject, serializeJsonLd } from '@/lib/structured-data';

/**
 * Structured data for search engines. This is the ONLY place in the web app allowed to use
 * dangerouslySetInnerHTML (approved exception; `react/no-danger` forbids it everywhere else):
 * JSON-LD must be raw text inside <script>, and React would HTML-escape normal children, breaking
 * the JSON. The data comes only from our own API, and serializeJsonLd() escapes <, > and &, so no
 * value can close the <script> element.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const html = { __html: serializeJsonLd(data) };
  // eslint-disable-next-line react/no-danger -- the single approved exception (see above).
  return <script type="application/ld+json" dangerouslySetInnerHTML={html} />;
}
