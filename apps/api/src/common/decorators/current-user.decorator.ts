import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AppRequest } from '../types/app-request';
import type { AuthUser } from '../types/auth-user';

/** Injects the authenticated user, or one of its fields: `@CurrentUser('id') userId: string`. */
export const CurrentUser = createParamDecorator(
  (field: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<AppRequest>().user;
    return field ? user?.[field] : user;
  },
);
