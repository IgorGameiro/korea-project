import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { databaseConfig } from '../config';
import { PrismaClient } from '../generated/prisma/client';

/**
 * The only PrismaClient in the app (one connection pool per process).
 * Feature modules never inject it in controllers/services: they go through their own repository.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(databaseConfig.KEY) db: ConfigType<typeof databaseConfig>) {
    super({ adapter: new PrismaPg({ connectionString: db.url }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
