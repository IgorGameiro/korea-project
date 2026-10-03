import 'reflect-metadata';
import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/** Seconds ("900") or a duration understood by jsonwebtoken ("15m", "12h", "7d"). */
const DURATION = /^\d+(s|m|h|d|w)?$/;

const toBoolean = ({ value }: { value: unknown }) =>
  value === true || value === 'true' || value === '1';

/**
 * Every environment variable the API reads. Validated once at startup:
 * a missing or malformed value aborts the boot instead of failing later at runtime.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  API_PORT = 3001;

  @IsString()
  @Matches(/^postgres(ql)?:\/\//, { message: 'DATABASE_URL must be a postgresql:// URL' })
  DATABASE_URL: string;

  /** Comma-separated list of allowed origins. */
  @IsString()
  @IsNotEmpty()
  CORS_ORIGINS = 'http://localhost:3000';

  @IsString()
  @MinLength(32)
  JWT_ACCESS_SECRET: string;

  @IsString()
  @Matches(DURATION, { message: 'JWT_ACCESS_EXPIRES_IN must look like 900, 15m, 12h or 7d' })
  JWT_ACCESS_EXPIRES_IN = '15m';

  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET: string;

  @IsString()
  @Matches(DURATION, { message: 'JWT_REFRESH_EXPIRES_IN must look like 900, 15m, 12h or 7d' })
  JWT_REFRESH_EXPIRES_IN = '7d';

  @Transform(toBoolean)
  @IsBoolean()
  COOKIE_SECURE = false;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  THROTTLE_TTL_MS = 60_000;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  THROTTLE_LIMIT = 100;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  THROTTLE_AUTH_TTL_MS = 60_000;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  THROTTLE_AUTH_LIMIT = 10;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  THROTTLE_SEARCH_LIMIT = 30;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  CACHE_TTL_MS = 60_000;

  @Transform(toBoolean)
  @IsBoolean()
  SWAGGER_ENABLED = true;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  // Conversions are explicit (@Type/@Transform) so they don't depend on emitted decorator metadata.
  const env = plainToInstance(EnvironmentVariables, config);
  const errors = validateSync(env, { skipMissingProperties: false });

  if (errors.length > 0) {
    const details = errors
      .map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return env;
}
