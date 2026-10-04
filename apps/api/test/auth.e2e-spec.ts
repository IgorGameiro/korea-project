import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './helpers';

const AUTH = '/api/v1/auth';

/** The refresh_token Set-Cookie header of a response, if any. */
const refreshCookie = (res: request.Response): string | undefined => {
  const raw = res.headers['set-cookie'] as unknown;
  const cookies = Array.isArray(raw) ? (raw as string[]) : [];
  return cookies.find((c) => c.startsWith('refresh_token='));
};
/** "refresh_token=<value>" ready to send back in a Cookie header. */
const cookiePair = (setCookie: string | undefined) => setCookie?.split(';')[0] ?? '';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  const unique = () => `user.${Date.now()}.${Math.random().toString(36).slice(2)}@example.com`;
  const register = (email = unique(), password = 'a-long-password') =>
    http().post(`${AUTH}/register`).send({ name: 'Test User', email, password });

  /** No response may contain a secret field or the stored hash of a token. */
  const expectNoSecrets = (res: request.Response) => {
    const body = JSON.stringify(res.body);
    expect(body).not.toMatch(/passwordHash|tokenHash|\$argon2/);
  };

  describe('register', () => {
    it('creates a USER, returns an access token and sets a secure refresh cookie', async () => {
      const email = unique();
      const res = await register(email).expect(201);

      expect(res.body).toEqual({
        accessToken: expect.any(String),
        tokenType: 'Bearer',
        expiresIn: 900,
        user: {
          id: expect.any(String),
          name: 'Test User',
          email,
          role: 'USER',
          createdAt: expect.any(String),
        },
      });
      expectNoSecrets(res);

      const cookie = refreshCookie(res);
      expect(cookie).toMatch(/HttpOnly/);
      expect(cookie).toMatch(/SameSite=Lax/);
      expect(cookie).toMatch(/Path=\/api\/v1\/auth/);
    });

    it('rejects a duplicate email (case-insensitive) with 409', async () => {
      const email = unique();
      await register(email).expect(201);

      const res = await register(email.toUpperCase()).expect(409);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
    });

    it('rejects unknown fields, so nobody can register as ADMIN', async () => {
      const res = await http()
        .post(`${AUTH}/register`)
        .send({ name: 'Mallory', email: unique(), password: 'a-long-password', role: 'ADMIN' })
        .expect(400);

      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('validates the payload', async () => {
      const res = await http()
        .post(`${AUTH}/register`)
        .send({ name: 'A', email: 'not-an-email', password: 'short' })
        .expect(400);

      const fields = (res.body.error.details as { field: string }[]).map((d) => d.field);
      expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password']));
    });
  });

  describe('login', () => {
    it('returns the same 401 for an unknown email and a wrong password', async () => {
      const email = unique();
      await register(email).expect(201);

      const wrongPassword = await http()
        .post(`${AUTH}/login`)
        .send({ email, password: 'not-the-password' })
        .expect(401);
      const unknownEmail = await http()
        .post(`${AUTH}/login`)
        .send({ email: unique(), password: 'not-the-password' })
        .expect(401);

      expect(wrongPassword.body).toEqual(unknownEmail.body);
      expect(wrongPassword.body).toEqual({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    });

    it('signs in a seeded user (email is case-insensitive)', async () => {
      const res = await http()
        .post(`${AUTH}/login`)
        .send({ email: 'Ana.Souza@Example.com', password: process.env.SEED_USER_PASSWORD })
        .expect(200);

      expect(res.body.user).toMatchObject({ email: 'ana.souza@example.com', role: 'USER' });
      expectNoSecrets(res);
      expect(refreshCookie(res)).toBeDefined();
    });
  });

  describe('me', () => {
    it('requires a valid access token', async () => {
      await http().get(`${AUTH}/me`).expect(401);
      const res = await http().get(`${AUTH}/me`).set('Authorization', 'Bearer nope').expect(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('returns the current user without secrets', async () => {
      const email = unique();
      const { body } = await register(email).expect(201);

      const res = await http()
        .get(`${AUTH}/me`)
        .set('Authorization', `Bearer ${body.accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({ email, role: 'USER' });
      expectNoSecrets(res);
    });

    it('does not accept a refresh token as an access token', async () => {
      const res = await register().expect(201);
      const refreshToken = cookiePair(refreshCookie(res)).split('=')[1];

      await http().get(`${AUTH}/me`).set('Authorization', `Bearer ${refreshToken}`).expect(401);
    });
  });

  describe('refresh-token rotation', () => {
    it('rotates the cookie and returns a new access token with the user (session restore)', async () => {
      const registered = await register().expect(201);
      const first = refreshCookie(registered);

      const res = await http().post(`${AUTH}/refresh`).set('Cookie', cookiePair(first)).expect(200);

      expect(res.body).toEqual({
        accessToken: expect.any(String),
        tokenType: 'Bearer',
        expiresIn: 900,
        user: registered.body.user,
      });
      expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|tokenHash/);
      const second = refreshCookie(res);
      expect(cookiePair(second)).not.toBe(cookiePair(first));
    });

    it('reusing a rotated token revokes the whole family', async () => {
      const registered = await register().expect(201);
      const first = cookiePair(refreshCookie(registered));

      // Legitimate rotation: first -> second.
      const rotated = await http().post(`${AUTH}/refresh`).set('Cookie', first).expect(200);
      const second = cookiePair(refreshCookie(rotated));

      // Replaying `first` (e.g. a stolen cookie) is detected...
      const reuse = await http().post(`${AUTH}/refresh`).set('Cookie', first).expect(401);
      expect(reuse.body.error.code).toBe('REFRESH_TOKEN_REUSED');

      // ...and the legitimate `second` no longer works either.
      await http().post(`${AUTH}/refresh`).set('Cookie', second).expect(401);

      const userId = registered.body.user.id as string;
      const active = await prisma.refreshToken.count({ where: { userId, revokedAt: null } });
      expect(active).toBe(0);
    });

    it('rejects a missing cookie', async () => {
      const res = await http().post(`${AUTH}/refresh`).expect(401);
      expect(res.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });

  describe('logout', () => {
    it('revokes the session and clears the cookie', async () => {
      const cookie = cookiePair(refreshCookie(await register().expect(201)));

      const res = await http().post(`${AUTH}/logout`).set('Cookie', cookie).expect(204);
      expect(refreshCookie(res)).toMatch(/Expires=Thu, 01 Jan 1970/);

      await http().post(`${AUTH}/refresh`).set('Cookie', cookie).expect(401);
    });

    it('is idempotent without a cookie', async () => {
      await http().post(`${AUTH}/logout`).expect(204);
    });
  });

  it('stores only token hashes in the database', async () => {
    const res = await register().expect(201);
    const token = cookiePair(refreshCookie(res)).split('=')[1];

    const rows = await prisma.refreshToken.findMany({
      where: { userId: res.body.user.id as string },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].tokenHash).not.toBe(token);
    expect(rows[0].tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
