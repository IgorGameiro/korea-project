import type { Role } from '@korea-project/shared';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface RefreshTokenPayload {
  sub: string;
  /** Family: every token rotated from the same login shares it. */
  fam: string;
  /** Unique per token, so two tokens issued in the same second still differ. */
  jti: string;
}

/** Client metadata stored with a refresh token (helps users review their sessions later). */
export interface SessionMeta {
  userAgent?: string;
  ip?: string;
}

export interface IssuedSession {
  accessToken: string;
  /** Access token lifetime in seconds. */
  expiresIn: number;
  refreshToken: string;
  refreshExpiresAt: Date;
}
