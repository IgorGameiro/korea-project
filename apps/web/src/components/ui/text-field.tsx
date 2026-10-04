import { type ComponentProps, forwardRef, useId } from 'react';

/** Labelled input with hint and error text wired to it (aria-describedby / aria-invalid). */
export const TextField = forwardRef<
  HTMLInputElement,
  ComponentProps<'input'> & { label: string; hint?: string; error?: string }
>(function TextField({ label, hint, error, id, ...props }, ref) {
  const generated = useId();
  const inputId = id ?? generated;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-sm font-semibold">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={`rounded-lg border bg-white px-3 py-2.5 text-navy-900 ${
          error ? 'border-coral-600' : 'border-navy-200'
        }`}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-xs text-navy-700">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-coral-600">
          {error}
        </p>
      ) : null}
    </div>
  );
});
