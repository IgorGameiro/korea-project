/** Lowercase ASCII words separated by single hyphens: "gyeongbokgung-palace". */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SLUG_MESSAGE = 'must be lowercase words separated by hyphens (e.g. "seoul-forest")';

/** "true"/"false" query strings to booleans (anything else is left for validation to reject). */
export const toBooleanQuery = ({ value }: { value: unknown }) =>
  value === 'true' ? true : value === 'false' ? false : value;
