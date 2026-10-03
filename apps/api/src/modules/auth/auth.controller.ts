import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser, Public } from '../../common/decorators';
import type { AppRequest } from '../../common/types/app-request';
import { appConfig } from '../../config';
import { UserDto } from '../users/dto/user.response';
import { AuthService } from './auth.service';
import type { IssuedSession, SessionMeta } from './auth.types';
import { AuthResponseDto, LoginDto, RefreshResponseDto, RegisterDto } from './dto/auth.dto';
import { REFRESH_COOKIE, refreshCookieOptions } from './refresh-cookie';

const sessionMeta = (req: AppRequest): SessionMeta => ({
  userAgent: req.headers['user-agent'],
  ip: req.ip,
});

const readRefreshCookie = (req: AppRequest): string | undefined => {
  const value: unknown = (req.cookies as Record<string, unknown> | undefined)?.[REFRESH_COOKIE];
  return typeof value === 'string' ? value : undefined;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    @Inject(appConfig.KEY) private readonly config: ConfigType<typeof appConfig>,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create an account; sets the refresh-token cookie' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({ description: 'EMAIL_ALREADY_REGISTERED' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { user, session } = await this.auth.register(dto, sessionMeta(req));
    return { ...this.respond(res, session), user };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in; sets the refresh-token cookie' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({
    description: 'INVALID_CREDENTIALS (same for unknown email and wrong password)',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { user, session } = await this.auth.login(dto, sessionMeta(req));
    return { ...this.respond(res, session), user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({ summary: 'Rotate the refresh-token cookie and get a new access token' })
  @ApiOkResponse({ type: RefreshResponseDto })
  @ApiUnauthorizedResponse({ description: 'INVALID_REFRESH_TOKEN or REFRESH_TOKEN_REUSED' })
  async refresh(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    try {
      const session = await this.auth.refresh(readRefreshCookie(req), sessionMeta(req));
      return this.respond(res, session);
    } catch (error) {
      res.clearCookie(REFRESH_COOKIE, refreshCookieOptions(this.config.cookieSecure));
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOperation({ summary: 'Revoke the current session and clear the cookie' })
  @ApiNoContentResponse()
  async logout(@Req() req: AppRequest, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(readRefreshCookie(req));
    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions(this.config.cookieSecure));
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'The authenticated user' })
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse({ description: 'UNAUTHORIZED' })
  me(@CurrentUser('id') userId: string): Promise<UserDto> {
    return this.auth.me(userId);
  }

  /** Sets the refresh cookie and returns the access-token part of the response. */
  private respond(res: Response, session: IssuedSession): RefreshResponseDto {
    res.cookie(REFRESH_COOKIE, session.refreshToken, {
      ...refreshCookieOptions(this.config.cookieSecure),
      expires: session.refreshExpiresAt,
    });
    return { accessToken: session.accessToken, tokenType: 'Bearer', expiresIn: session.expiresIn };
  }
}
