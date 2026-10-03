import { createHash, randomUUID } from 'node:crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import type { Role } from '@korea-project/shared';
import { jwtConfig } from '../../config';
import { toUserDto, type UserDto } from '../users/dto/user.response';
import { UsersService } from '../users/users.service';
import type {
  AccessTokenPayload,
  IssuedSession,
  RefreshTokenPayload,
  SessionMeta,
} from './auth.types';
import { PasswordService } from './password.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

// One message for unknown email and wrong password, so the response never reveals which accounts exist.
const invalidCredentials = () =>
  new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
const invalidRefreshToken = () =>
  new UnauthorizedException({
    code: 'INVALID_REFRESH_TOKEN',
    message: 'Invalid or expired session',
  });
const reusedRefreshToken = () =>
  new UnauthorizedException({
    code: 'REFRESH_TOKEN_REUSED',
    message: 'This session was already used and has been revoked; please sign in again',
  });

interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly passwords: PasswordService,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly jwt: JwtService,
    @Inject(jwtConfig.KEY) private readonly config: ConfigType<typeof jwtConfig>,
  ) {}

  async register(
    input: { name: string; email: string; password: string },
    meta: SessionMeta,
  ): Promise<{ user: UserDto; session: IssuedSession }> {
    const passwordHash = await this.passwords.hash(input.password);
    const user = await this.users.create({ name: input.name, email: input.email, passwordHash });
    return { user: toUserDto(user), session: await this.startSession(user, meta) };
  }

  async login(
    input: { email: string; password: string },
    meta: SessionMeta,
  ): Promise<{ user: UserDto; session: IssuedSession }> {
    const user = await this.users.findByEmailWithSecret(input.email);
    // Always verify (against a dummy hash when the user is unknown) so timing does not leak either.
    const valid = await this.passwords.verify(user?.passwordHash, input.password);
    if (!user || !valid) throw invalidCredentials();
    return { user: toUserDto(user), session: await this.startSession(user, meta) };
  }

  /**
   * Rotates a refresh token. Presenting a token that was already rotated means it leaked (or was
   * replayed): the whole family is revoked, logging out every device of that login.
   */
  async refresh(refreshToken: string | undefined, meta: SessionMeta): Promise<IssuedSession> {
    if (!refreshToken) throw invalidRefreshToken();
    const payload = await this.verifyRefreshToken(refreshToken);
    const record = await this.refreshTokens.findByHash(hashToken(refreshToken));
    if (!record || record.userId !== payload.sub || record.familyId !== payload.fam) {
      throw invalidRefreshToken();
    }
    if (record.revokedAt) {
      await this.refreshTokens.revokeFamily(record.familyId);
      throw reusedRefreshToken();
    }
    if (record.expiresAt <= new Date()) throw invalidRefreshToken();

    const user = await this.users.findById(record.userId);
    if (!user) throw invalidRefreshToken();

    const {
      refreshToken: nextToken,
      data,
      refreshExpiresAt,
    } = await this.signRefreshToken(user.id, record.familyId, meta);
    const rotated = await this.refreshTokens.rotate(record.id, data);
    if (!rotated) {
      await this.refreshTokens.revokeFamily(record.familyId);
      throw reusedRefreshToken();
    }
    return { ...(await this.signAccessToken(user)), refreshToken: nextToken, refreshExpiresAt };
  }

  /** Ends the session of the presented refresh token (its whole family). Idempotent. */
  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    const record = await this.refreshTokens.findByHash(hashToken(refreshToken));
    if (record) await this.refreshTokens.revokeFamily(record.familyId);
  }

  async me(userId: string): Promise<UserDto> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Authentication required' });
    }
    return toUserDto(user);
  }

  // -------------------------------------------------------------------------

  private async startSession(user: SessionUser, meta: SessionMeta): Promise<IssuedSession> {
    const { refreshToken, data, refreshExpiresAt } = await this.signRefreshToken(
      user.id,
      randomUUID(),
      meta,
    );
    await this.refreshTokens.create(data);
    return { ...(await this.signAccessToken(user)), refreshToken, refreshExpiresAt };
  }

  private async signAccessToken(user: SessionUser) {
    const payload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);
    const { exp, iat } = this.jwt.decode<{ exp: number; iat: number }>(accessToken);
    return { accessToken, expiresIn: exp - iat };
  }

  private async signRefreshToken(userId: string, familyId: string, meta: SessionMeta) {
    const payload: RefreshTokenPayload = { sub: userId, fam: familyId, jti: randomUUID() };
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.refreshSecret,
      expiresIn: this.config.refreshExpiresIn as JwtSignOptions['expiresIn'],
    });
    const { exp } = this.jwt.decode<{ exp: number }>(refreshToken);
    const refreshExpiresAt = new Date(exp * 1000);
    return {
      refreshToken,
      refreshExpiresAt,
      data: {
        userId,
        familyId,
        tokenHash: hashToken(refreshToken),
        expiresAt: refreshExpiresAt,
        userAgent: meta.userAgent?.slice(0, 255),
        ip: meta.ip,
      },
    };
  }

  private async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      return await this.jwt.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.config.refreshSecret,
        algorithms: ['HS256'],
      });
    } catch {
      throw invalidRefreshToken();
    }
  }
}
