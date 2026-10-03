import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp, setupSwagger } from '../src/setup-app';

/** The full application, configured exactly like main.ts, against the *_test database. */
export async function createTestApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>({ logger: false });
  configureApp(app);
  setupSwagger(app);
  await app.init();
  return app;
}

/** Access token of a seeded account (passwords come from the SEED_* env vars). */
export async function loginAs(app: INestApplication<App>, who: 'admin' | 'user'): Promise<string> {
  const credentials =
    who === 'admin'
      ? { email: 'admin@example.com', password: process.env.SEED_ADMIN_PASSWORD }
      : { email: 'ana.souza@example.com', password: process.env.SEED_USER_PASSWORD };
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send(credentials)
    .expect(200);
  return (res.body as { accessToken: string }).accessToken;
}

/** A unique, valid slug for records created by a test. */
export const testSlug = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Registers a fresh USER and returns its id and access token. */
export async function registerUser(
  app: INestApplication<App>,
  name = 'Test Reviewer',
): Promise<{ id: string; token: string }> {
  const email = `${testSlug('user')}@example.com`;
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send({ name, email, password: 'a-long-password' })
    .expect(201);
  const body = res.body as { accessToken: string; user: { id: string } };
  return { id: body.user.id, token: body.accessToken };
}
