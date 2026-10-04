import type { ReactNode } from 'react';

const fieldClass =
  'rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 focus-visible:outline-2';

/** Labelled native <select>. The first option (value "") is the default and is never submitted. */
export function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string | undefined;
  options: { value: string; label: string }[];
}) {
  const id = `filter-${name}`;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <select id={id} name={name} defaultValue={value ?? ''} className={fieldClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Checkbox group in a fieldset, so the group label is announced with each option. */
export function CheckboxGroup({
  name,
  legend,
  options,
  checked,
}: {
  name: string;
  legend: string;
  options: { value: string; label: ReactNode }[];
  checked: string[];
}) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 text-sm font-semibold">{legend}</legend>
      <div className="flex gap-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-2.5 py-2 text-sm has-[:checked]:border-navy-900 has-[:checked]:bg-navy-900 has-[:checked]:text-white"
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              defaultChecked={checked.includes(option.value)}
              className="size-4 accent-navy-900"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
