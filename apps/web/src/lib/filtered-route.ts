// Shared by the proxy and the filtered section route (no server-only imports).

/** Internal route segment for filtered section listings: /cities/[slug]/[section]/filtered. */
export const FILTERED_SEGMENT = 'filtered';

/** Set by the proxy on the rewrite; the filtered route is not reachable directly. */
export const FILTERED_HEADER = 'x-kp-filtered-section';
