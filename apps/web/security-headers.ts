// Security headers for every page, set in next.config.ts. Plain module (no Next imports) so it is
// unit-tested on its own.

/** The map tile host(s): Leaflet loads tiles as <img> straight from the provider. */
export function tileOrigins(tileUrl: string): string[] {
  try {
    // "{s}" subdomain templates (a.tile…, b.tile…) become a wildcard.
    const url = new URL(tileUrl.replace(/\{[a-z]\}/gi, (m) => (m === '{s}' ? 'subdomains' : '0')));
    const host = url.hostname.replace(/^subdomains\./, '*.');
    return [`${url.protocol}//${host}`];
  } catch {
    return [];
  }
}

/**
 * Content-Security-Policy. Pages are static (ISR), so a per-request nonce is impossible (Next.js
 * requires dynamic rendering for nonces, which would disable ISR); inline scripts — the React
 * Server Components payload Next.js writes into each page — therefore need 'unsafe-inline'.
 * Everything else is locked down: scripts, styles, fonts and connections only from this site,
 * images only from this site (next/image optimizes remote photos server-side) and the tile server,
 * no plugins, no framing, no form posts elsewhere. 'unsafe-eval' only in development (React needs it
 * there for error overlays; production never uses eval).
 */
export function contentSecurityPolicy({
  isDev,
  tileUrl,
  https,
}: {
  isDev: boolean;
  tileUrl: string;
  https: boolean;
}): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    // Inline style attributes: Leaflet positions tiles and markers with them.
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', ...tileOrigins(tileUrl)],
    'font-src': ["'self'"],
    // Same-origin API gateway; the dev server's hot reload uses a websocket.
    'connect-src': ["'self'", ...(isDev ? ['ws:', 'wss:'] : [])],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'frame-src': ["'none'"],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
  };
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`);
  if (https) policy.push('upgrade-insecure-requests');
  return policy.join('; ');
}

export function securityHeaders(options: {
  isDev: boolean;
  tileUrl: string;
  siteUrl: string;
}): { key: string; value: string }[] {
  const https = options.siteUrl.startsWith('https://');
  return [
    {
      key: 'Content-Security-Policy',
      value: contentSecurityPolicy({ isDev: options.isDev, tileUrl: options.tileUrl, https }),
    },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    },
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    // HSTS only makes sense (and is only honored) over HTTPS.
    ...(https
      ? [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ]
      : []),
  ];
}
