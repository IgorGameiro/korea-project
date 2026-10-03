import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppCacheModule } from './common/cache/app-cache.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LocaleInterceptor } from './common/i18n/locale.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { createValidationPipe } from './common/pipes/validation.pipe';
import { buildThrottlerOptions } from './common/throttler/throttler.options';
import { configNamespaces, throttleConfig, validateEnv } from './config';
import { ExchangeRatesModule } from './modules/exchange-rates/exchange-rates.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // Resolved from apps/api (pnpm runs scripts there). In Docker the vars come from the container.
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
      load: configNamespaces,
    }),
    ThrottlerModule.forRootAsync({
      inject: [throttleConfig.KEY],
      useFactory: (cfg: ConfigType<typeof throttleConfig>) => buildThrottlerOptions(cfg),
    }),
    AppCacheModule,
    PrismaModule,
    // Domain modules (one per bounded context) are registered below.
    HealthModule,
    ExchangeRatesModule,
  ],
  providers: [
    { provide: APP_PIPE, useFactory: createValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Order matters: logging wraps everything, serializer strips @Exclude() fields (e.g. passwordHash).
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: LocaleInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {}
