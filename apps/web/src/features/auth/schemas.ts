import { z } from 'zod';

// Same limits as the API's RegisterDto / LoginDto (the API validates again).
type T = (key: string) => string;

export const loginSchema = (t: T) =>
  z.object({
    email: z.string().trim().min(1, t('required')).max(254, t('emailMax')).email(t('email')),
    password: z.string().min(1, t('required')).max(128, t('passwordMax')),
  });

export const registerSchema = (t: T) =>
  z.object({
    name: z.string().trim().min(2, t('nameMin')).max(80, t('nameMax')),
    email: z.string().trim().min(1, t('required')).max(254, t('emailMax')).email(t('email')),
    password: z.string().min(8, t('passwordMin')).max(128, t('passwordMax')),
  });

export type LoginInput = z.infer<ReturnType<typeof loginSchema>>;
export type RegisterInput = z.infer<ReturnType<typeof registerSchema>>;
