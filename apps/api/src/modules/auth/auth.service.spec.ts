import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import type { PasswordService } from './password.service';
import type { RefreshTokensRepository } from './refresh-tokens.repository';

const config = {
  accessSecret: 'a'.repeat(32),
  accessExpiresIn: '15m',
  refreshSecret: 'r'.repeat(32),
  refreshExpiresIn: '7d',
};
const user = {
  id: 'user-1',
  name: 'Ana',
  email: 'ana@example.com',
  role: 'USER' as const,
  passwordHash: 'hash',
  createdAt: new Date(),
  updatedAt: new Date(),
};

function setup() {
  const users = {
    findByEmailWithSecret: jest.fn(),
    findById: jest.fn().mockResolvedValue(user),
    create: jest.fn().mockResolvedValue(user),
  };
  const passwords = { verify: jest.fn(), hash: jest.fn().mockResolvedValue('hash') };
  const tokens = {
    create: jest.fn().mockResolvedValue({}),
    findByHash: jest.fn(),
    rotate: jest.fn().mockResolvedValue({ id: 'next' }),
    revokeFamily: jest.fn().mockResolvedValue({ count: 2 }),
  };
  const jwt = new JwtService({ secret: config.accessSecret, signOptions: { expiresIn: '15m' } });
  const service = new AuthService(
    users as unknown as UsersService,
    passwords as unknown as PasswordService,
    tokens as unknown as RefreshTokensRepository,
    jwt,
    config,
  );
  return { service, users, passwords, tokens, jwt };
}

const errorBody = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(UnauthorizedException);
    return (error as UnauthorizedException).getResponse();
  }
  throw new Error('expected the call to fail');
};

describe('AuthService', () => {
  describe('login', () => {
    it('fails identically for an unknown email and a wrong password', async () => {
      const { service, users, passwords } = setup();

      users.findByEmailWithSecret.mockResolvedValueOnce(null);
      passwords.verify.mockResolvedValueOnce(false);
      const unknownEmail = await errorBody(
        service.login({ email: 'x@example.com', password: 'p' }, {}),
      );

      users.findByEmailWithSecret.mockResolvedValueOnce(user);
      passwords.verify.mockResolvedValueOnce(false);
      const wrongPassword = await errorBody(
        service.login({ email: user.email, password: 'p' }, {}),
      );

      expect(unknownEmail).toEqual(wrongPassword);
      expect(unknownEmail).toEqual({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
      // The password check runs even when the user does not exist (constant work).
      expect(passwords.verify).toHaveBeenNthCalledWith(1, undefined, 'p');
    });

    it('starts a session with a new family on success', async () => {
      const { service, users, passwords, tokens } = setup();
      users.findByEmailWithSecret.mockResolvedValue(user);
      passwords.verify.mockResolvedValue(true);

      const { user: dto, session } = await service.login({ email: user.email, password: 'ok' }, {});

      expect(dto).not.toHaveProperty('passwordHash');
      expect(session.expiresIn).toBe(15 * 60);
      expect(tokens.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        }),
      );
      // Only the hash is stored, never the token itself.
      const stored = tokens.create.mock.calls[0][0] as { tokenHash: string };
      expect(stored.tokenHash).not.toBe(session.refreshToken);
    });
  });

  describe('refresh', () => {
    async function issued() {
      const ctx = setup();
      ctx.users.findByEmailWithSecret.mockResolvedValue(user);
      ctx.passwords.verify.mockResolvedValue(true);
      const { session } = await ctx.service.login({ email: user.email, password: 'ok' }, {});
      const stored = ctx.tokens.create.mock.calls[0][0] as { familyId: string; tokenHash: string };
      return { ...ctx, session, stored };
    }

    it('rotates an active token', async () => {
      const { service, tokens, session, stored } = await issued();
      tokens.findByHash.mockResolvedValue({
        id: 'old',
        userId: user.id,
        familyId: stored.familyId,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });

      const next = await service.refresh(session.refreshToken, {});

      expect(tokens.rotate).toHaveBeenCalledWith(
        'old',
        expect.objectContaining({ familyId: stored.familyId }),
      );
      expect(next.session.refreshToken).not.toBe(session.refreshToken);
      expect(next.user).toEqual(expect.objectContaining({ id: user.id }));
      expect(next.user).not.toHaveProperty('passwordHash');
    });

    it('revokes the whole family when a rotated token is reused', async () => {
      const { service, tokens, session, stored } = await issued();
      tokens.findByHash.mockResolvedValue({
        id: 'old',
        userId: user.id,
        familyId: stored.familyId,
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });

      const body = await errorBody(service.refresh(session.refreshToken, {}));

      expect(body).toMatchObject({ code: 'REFRESH_TOKEN_REUSED' });
      expect(tokens.revokeFamily).toHaveBeenCalledWith(stored.familyId);
      expect(tokens.rotate).not.toHaveBeenCalled();
    });

    it('treats losing a concurrent rotation as reuse', async () => {
      const { service, tokens, session, stored } = await issued();
      tokens.findByHash.mockResolvedValue({
        id: 'old',
        userId: user.id,
        familyId: stored.familyId,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      tokens.rotate.mockResolvedValueOnce(null);

      await expect(service.refresh(session.refreshToken, {})).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(tokens.revokeFamily).toHaveBeenCalledWith(stored.familyId);
    });

    it('rejects missing, forged and access tokens', async () => {
      const { service, jwt, session } = await issued();

      for (const token of [undefined, 'garbage', session.accessToken, jwt.sign({ sub: 'x' })]) {
        expect(await errorBody(service.refresh(token, {}))).toMatchObject({
          code: 'INVALID_REFRESH_TOKEN',
        });
      }
    });
  });
});
