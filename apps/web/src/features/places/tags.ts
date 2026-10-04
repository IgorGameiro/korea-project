/**
 * Label of a tag key. Every seed tag has a translation (a test in the API seed checks it); a tag
 * created later without one is shown humanized ("street-food" -> "Street food") instead of raw.
 */
export function tagLabel(tag: string, t: { has: (key: string) => boolean; (key: string): string }) {
  if (t.has(tag)) return t(tag);
  const words = tag.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
