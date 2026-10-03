import { type INestApplication, VersioningType } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { API_PREFIX, DEFAULT_API_VERSION, SWAGGER_PATH } from './common/constants';
import { appConfig } from './config';

/**
 * HTTP-level setup shared by main.ts and the e2e tests, so tests hit the same
 * prefix, versioning and middleware as production. Pipes, filters, guards and
 * interceptors are registered as providers in AppModule.
 */
export function configureApp(app: INestApplication): void {
  const cfg = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.setGlobalPrefix(API_PREFIX);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: DEFAULT_API_VERSION });
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: cfg.corsOrigins, credentials: true });
}

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('korea-project API')
    .setDescription('South Korea travel guide — REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refresh_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    jsonDocumentUrl: `${SWAGGER_PATH}-json`,
  });
}
