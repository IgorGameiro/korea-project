import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { cacheConfig } from '../../config';

/**
 * Single place where the cache store is chosen. Services only inject CACHE_MANAGER
 * (`@Inject(CACHE_MANAGER) cache: Cache`), so swapping to Redis means adding
 * `stores: [new KeyvRedis(url)]` here and nothing else.
 */
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [cacheConfig.KEY],
      useFactory: (cfg: ConfigType<typeof cacheConfig>) => ({ ttl: cfg.ttlMs }),
    }),
  ],
  exports: [CacheModule],
})
export class AppCacheModule {}
