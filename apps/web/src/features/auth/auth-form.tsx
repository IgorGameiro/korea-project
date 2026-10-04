'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { type DefaultValues, type FieldValues, type Path, useForm } from 'react-hook-form';
import type { z } from 'zod';
import { buttonClasses } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { getPathname, Link } from '@/i18n/navigation';
import { login, register, AuthError, type AuthErrorCode } from './actions';
import { loginSchema, registerSchema } from './schemas';
import { safeNext } from './safe-next';

type Mode = 'login' | 'register';

interface Field<V> {
  name: Path<V>;
  type: string;
  autoComplete: string;
  hint?: boolean;
}

const FIELDS = {
  login: [
    { name: 'email', type: 'email', autoComplete: 'email' },
    { name: 'password', type: 'password', autoComplete: 'current-password' },
  ],
  register: [
    { name: 'name', type: 'text', autoComplete: 'name' },
    { name: 'email', type: 'email', autoComplete: 'email' },
    { name: 'password', type: 'password', autoComplete: 'new-password', hint: true },
  ],
} as const;

/** Login and sign-up form. On success it goes to ?next= (internal paths only) or home. */
export function AuthForm({ mode }: { mode: Mode }) {
  const t = useTranslations('auth');
  const tv = useTranslations('auth.validation');
  const locale = useLocale();
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));
  const [failure, setFailure] = useState<AuthErrorCode | null>(null);

  const schema = mode === 'login' ? loginSchema(tv) : registerSchema(tv);
  type Values = z.infer<typeof schema> & FieldValues;
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema as z.ZodType<Values, Values>),
    defaultValues: {} as DefaultValues<Values>,
  });

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    try {
      if (mode === 'login') await login(values as z.infer<ReturnType<typeof loginSchema>>);
      else await register(values as z.infer<ReturnType<typeof registerSchema>>);
      router.replace(next ?? getPathname({ href: '/', locale }));
    } catch (error) {
      setFailure(error instanceof AuthError ? error.code : 'UNKNOWN');
    }
  });

  const other = mode === 'login' ? '/register' : '/login';
  const fields = FIELDS[mode] as readonly Field<Values>[];

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {failure ? (
        <p role="alert" className="rounded-lg bg-coral-50 p-3 text-sm font-medium text-coral-700">
          {t(`errors.${failure}`)}
        </p>
      ) : null}
      {fields.map((item) => (
        <TextField
          key={item.name}
          label={t(item.name as 'name' | 'email' | 'password')}
          type={item.type}
          autoComplete={item.autoComplete}
          hint={item.hint ? t('passwordHint') : undefined}
          error={errors[item.name]?.message as string | undefined}
          {...field(item.name)}
        />
      ))}
      <button type="submit" disabled={isSubmitting} className={buttonClasses('primary', 'mt-2')}>
        {isSubmitting ? t('submitting') : t(mode === 'login' ? 'submitLogin' : 'submitRegister')}
      </button>
      <p className="text-sm text-navy-700">
        {t(mode === 'login' ? 'noAccount' : 'haveAccount')}{' '}
        <Link
          href={{ pathname: other, query: next ? { next } : {} }}
          className="font-semibold text-navy-900 underline underline-offset-4"
        >
          {t(mode === 'login' ? 'registerLink' : 'loginLink')}
        </Link>
      </p>
    </form>
  );
}
