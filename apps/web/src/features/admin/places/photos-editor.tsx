'use client';

import { MAX_PHOTOS, type Photo, validatePhotos } from '@korea-project/shared';
import { buttonClasses } from '@/components/ui/button';

/** Problems with the list (the same rules the API applies), or [] when it is valid. */
export const photosProblems = (photos: Photo[]) => validatePhotos(photos);

const field = 'rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm';

/**
 * Ordered photo list (the first one is the cover). A real photo needs its credit: Wikimedia Commons
 * licenses require the author and the license. Leaving every credit field empty means "no credit"
 * (a placeholder); filling any of them makes author, license and source required.
 */
export function PhotosEditor({
  value,
  onChange,
}: {
  value: Photo[];
  onChange: (next: Photo[]) => void;
}) {
  const problems = photosProblems(value);

  const update = (index: number, patch: Partial<Record<CreditField | 'url', string>>) =>
    onChange(
      value.map((photo, i) => {
        if (i !== index) return photo;
        const url = patch.url ?? photo.url;
        const credit = { ...emptyCredit, ...(photo.credit ?? {}) };
        for (const key of CREDIT_FIELDS) if (patch[key] !== undefined) credit[key] = patch[key];
        const hasCredit = CREDIT_FIELDS.some((key) => (credit[key] ?? '').trim() !== '');
        return {
          url,
          credit: hasCredit
            ? { ...credit, licenseUrl: credit.licenseUrl?.trim() ? credit.licenseUrl : null }
            : null,
        };
      }),
    );

  const move = (index: number, by: -1 | 1) => {
    const next = [...value];
    const [photo] = next.splice(index, 1);
    next.splice(index + by, 0, photo!);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-navy-700">
        The first photo is the cover. Hosts must be allowed in next.config.ts. Credit is required
        for real photos (author, license, source page); leave it empty for a placeholder.
      </p>
      {value.length === 0 ? <p className="text-sm text-navy-700">No photos.</p> : null}
      <ol className="flex flex-col gap-3">
        {value.map((photo, index) => {
          const credit = photo.credit ?? emptyCredit;
          const label = `Photo ${index + 1}`;
          return (
            <li key={index} className="rounded-lg p-3 ring-1 ring-navy-100">
              <fieldset className="flex flex-col gap-2">
                <legend className="text-sm font-semibold">
                  {label}
                  {index === 0 ? ' (cover)' : ''}
                </legend>
                <label className="flex flex-col gap-1 text-sm">
                  URL (https)
                  <input
                    className={field}
                    value={photo.url}
                    onChange={(e) => update(index, { url: e.target.value.trim() })}
                  />
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CREDIT_FIELDS.map((key) => (
                    <label key={key} className="flex flex-col gap-1 text-sm">
                      {CREDIT_LABELS[key]}
                      <input
                        className={field}
                        value={credit[key] ?? ''}
                        onChange={(e) => update(index, { [key]: e.target.value })}
                      />
                    </label>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move ${label} up`}
                    className="font-semibold underline underline-offset-4 disabled:opacity-40"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    disabled={index === value.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move ${label} down`}
                    className="font-semibold underline underline-offset-4 disabled:opacity-40"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                    aria-label={`Remove ${label}`}
                    className="font-semibold text-coral-700 underline underline-offset-4"
                  >
                    Remove
                  </button>
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        disabled={value.length >= MAX_PHOTOS}
        onClick={() => onChange([...value, { url: '', credit: null }])}
        className={buttonClasses('secondary', 'self-start')}
      >
        Add a photo
      </button>
      {problems.length > 0 ? (
        <ul
          role="alert"
          className="list-disc rounded-lg bg-coral-50 p-3 pl-8 text-sm text-coral-700"
        >
          {problems.map((problem) => (
            <li key={problem}>
              {problem.replace(/^\[(\d+)\]/, (_, i) => `Photo ${Number(i) + 1}`)}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const CREDIT_FIELDS = ['author', 'license', 'licenseUrl', 'sourceUrl'] as const;
type CreditField = (typeof CREDIT_FIELDS)[number];
const CREDIT_LABELS: Record<CreditField, string> = {
  author: 'Author',
  license: 'License (e.g. CC BY-SA 4.0)',
  licenseUrl: 'License URL (optional for public domain)',
  sourceUrl: 'Source page (e.g. the Commons file page)',
};
const emptyCredit = { author: '', license: '', licenseUrl: '', sourceUrl: '' };
