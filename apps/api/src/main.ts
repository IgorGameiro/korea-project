import { Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { API_PREFIX, DEFAULT_API_VERSION, SWAGGER_PATH } from './common/constants';
import { appConfig } from './config';
import { configureApp, setupSwagger } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  configureApp(app);
  if (cfg.swaggerEnabled) setupSwagger(app);

  // Closes the HTTP server and the Prisma pool cleanly on SIGTERM/SIGINT (docker stop).
  app.enableShutdownHooks();

  await app.listen(cfg.port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`API listening on http://localhost:${cfg.port}/${API_PREFIX}/v${DEFAULT_API_VERSION}`);
  if (cfg.swaggerEnabled) logger.log(`Swagger at http://localhost:${cfg.port}/${SWAGGER_PATH}`);
}

void bootstrap();
