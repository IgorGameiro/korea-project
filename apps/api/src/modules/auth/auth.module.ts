import { Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../../config';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PasswordService } from './password.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    // Defaults are for access tokens; refresh tokens pass their own secret and lifetime.
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.accessSecret,
        signOptions: {
          algorithm: 'HS256',
          expiresIn: config.accessExpiresIn as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, RefreshTokensRepository, JwtStrategy],
})
export class AuthModule {}
