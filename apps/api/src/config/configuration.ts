import { registerAs } from '@nestjs/config';
import { NodeEnv, validateEnv } from './env.validation';

// Typed config namespaces. Inject with `@Inject(appConfig.KEY) cfg: ConfigType<typeof appConfig>`.
// Each factory re-parses process.env through the same validator, so types and defaults
// have a single source of truth (EnvironmentVariables).

export const appConfig = registerAs('app', () => {
  const env = validateEnv(process.env);
  return {
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === NodeEnv.Production,
    port: env.API_PORT,
    corsOrigins: env.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
    cookieSecure: env.COOKIE_SECURE,
    swaggerEnabled: env.SWAGGER_ENABLED,
  };
});

export const databaseConfig = registerAs('database', () => ({
  url: validateEnv(process.env).DATABASE_URL,
}));

export const jwtConfig = registerAs('jwt', () => {
  const env = validateEnv(process.env);
  return {
    accessSecret: env.JWT_ACCESS_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  };
});

export const throttleConfig = registerAs('throttle', () => {
  const env = validateEnv(process.env);
  return {
    ttlMs: env.THROTTLE_TTL_MS,
    limit: env.THROTTLE_LIMIT,
    authTtlMs: env.THROTTLE_AUTH_TTL_MS,
    authLimit: env.THROTTLE_AUTH_LIMIT,
    searchLimit: env.THROTTLE_SEARCH_LIMIT,
  };
});

export const cacheConfig = registerAs('cache', () => ({
  ttlMs: validateEnv(process.env).CACHE_TTL_MS,
}));

export const configNamespaces = [appConfig, databaseConfig, jwtConfig, throttleConfig, cacheConfig];
