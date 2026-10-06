import { type JsonLdObject, serializeJsonLd } from '@/lib/structured-data';

/**
 * Structured data for search engines. This is the ONLY place in the web app allowed to use
 * dangerouslySetInnerHTML (approved exception; `react/no-danger` forbids it everywhere else):
 * JSON-LD must be raw text inside <script>, and React would HTML-escape normal children, breaking
 * the JSON. The data comes only from our own API, and serializeJsonLd() escapes <, > and &, so no
 * value can close the <script> element.
 *
 * Several objects are rendered as one <script> each (every one with its own @context) rather than a
 * top-level array: both are valid JSON-LD, but some readers (browser extensions among them) expect
 * an object and fail on an array.
 */
export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const items = Array.isArray(data) ? data : [data];
  return items.map((item, index) => {
    const html = { __html: serializeJsonLd(item) };
    // eslint-disable-next-line react/no-danger -- the single approved exception (see above).
    return <script key={index} type="application/ld+json" dangerouslySetInnerHTML={html} />;
  });
}
