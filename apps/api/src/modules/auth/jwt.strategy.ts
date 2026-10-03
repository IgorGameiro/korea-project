import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from '../../config';
import type { AuthUser } from '../../common/types/auth-user';
import type { AccessTokenPayload } from './auth.types';

/** Validates `Authorization: Bearer <access token>` and attaches the user to the request. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(jwtConfig.KEY) config: ConfigType<typeof jwtConfig>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.accessSecret,
      algorithms: ['HS256'],
    });
  }

  validate(payload: AccessTokenPayload): AuthUser {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
