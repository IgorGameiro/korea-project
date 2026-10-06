'use client';

import type { ReactNode } from 'react';

/** Labelled checkbox for admin forms. */
export function CheckboxField({
  label,
  hint,
  ...props
}: React.ComponentProps<'input'> & { label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input type="checkbox" className="mt-0.5 size-4 accent-navy-900" {...props} />
      <span>
        <span className="font-semibold">{label}</span>
        {hint ? <span className="block text-xs text-navy-700">{hint}</span> : null}
      </span>
    </label>
  );
}

/** A titled group of fields. */
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-[var(--radius-card)] p-5 ring-1 ring-navy-100">
      <legend className="px-1 text-base font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

/** Error banner for a form or list (role=alert, so it is announced). */
export function ErrorBanner({ message, extra }: { message: string | null; extra?: string[] }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-lg bg-coral-50 p-3 text-sm font-medium text-coral-700">
      <p>{message}</p>
      {extra && extra.length > 0 ? (
        <ul className="mt-1 list-disc pl-5 font-normal">
          {extra.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Success notice (role=status). */
export function Notice({ message }: { message: string | null }) {
  return (
    <p
      role="status"
      className={
        message ? 'rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800' : 'sr-only'
      }
    >
      {message}
    </p>
  );
}
