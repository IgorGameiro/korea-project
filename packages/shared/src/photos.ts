// Photos with their credit. Real photos come from Wikimedia Commons, whose licenses (CC BY,
// CC BY-SA, …) require naming the author and the license; placeholders have no credit.

export type PhotoCredit = {
  /** As given on the file page (may be a username). */
  author: string;
  /** Short license name, e.g. "CC BY-SA 4.0" or "Public domain". */
  license: string;
  /** Link to the license text; absent for public domain. May be http (as some license sites are). */
  licenseUrl?: string | null;
  /** The file page the photo comes from. */
  sourceUrl: string;
};

// Declared as `type` (not `interface`) so values are assignable to JSON column inputs.
export type Photo = {
  url: string;
  credit?: PhotoCredit | null;
};

export const MAX_PHOTOS = 20;
const HTTPS = /^https:\/\/\S+$/;
/** Only for the license link: an outbound informational link, never loaded by the page. */
const HTTP_OR_HTTPS = /^https?:\/\/\S+$/;
const text = (value: unknown, max: number) =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= max;

/** Problems with a list of photos; an empty list means it is valid. */
export function validatePhotos(value: unknown): string[] {
  if (!Array.isArray(value)) return ['must be an array'];
  if (value.length > MAX_PHOTOS) return [`at most ${MAX_PHOTOS} photos`];
  const errors: string[] = [];
  value.forEach((photo: unknown, i) => {
    if (typeof photo !== 'object' || photo === null) {
      errors.push(`[${i}] must be an object`);
      return;
    }
    const { url, credit } = photo as Partial<Photo>;
    if (typeof url !== 'string' || !HTTPS.test(url) || url.length > 1000) {
      errors.push(`[${i}].url must be an https URL`);
    }
    if (credit === undefined || credit === null) return;
    if (typeof credit !== 'object') {
      errors.push(`[${i}].credit must be an object`);
      return;
    }
    if (!text(credit.author, 300)) errors.push(`[${i}].credit.author is required`);
    if (!text(credit.license, 100)) errors.push(`[${i}].credit.license is required`);
    if (typeof credit.sourceUrl !== 'string' || !HTTPS.test(credit.sourceUrl)) {
      errors.push(`[${i}].credit.sourceUrl must be an https URL`);
    }
    if (
      credit.licenseUrl !== undefined &&
      credit.licenseUrl !== null &&
      (typeof credit.licenseUrl !== 'string' || !HTTP_OR_HTTPS.test(credit.licenseUrl))
    ) {
      errors.push(`[${i}].credit.licenseUrl must be an http(s) URL`);
    }
  });
  return errors;
}
