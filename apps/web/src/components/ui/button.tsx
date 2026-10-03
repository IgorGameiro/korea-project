import type { ButtonHTMLAttributes, ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-navy-900 text-white hover:bg-navy-800',
  secondary: 'bg-white text-navy-900 ring-1 ring-navy-200 hover:bg-navy-50',
  ghost: 'text-navy-900 hover:bg-navy-50',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export function buttonClasses(variant: Variant = 'primary', className = '') {
  return `${base} ${VARIANTS[variant]} ${className}`.trim();
}

export function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}

/** A link styled as a button (locale-aware). */
export function ButtonLink({
  variant = 'primary',
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
