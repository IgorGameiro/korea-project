import type { HTMLAttributes } from 'react';

/** Page-width wrapper with consistent side padding. */
export function Container({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`} {...props} />;
}
