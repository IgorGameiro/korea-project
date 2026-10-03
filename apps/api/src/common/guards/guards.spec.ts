import { type ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@korea-project/shared';
import { redactSecrets } from '../interceptors/redact-secrets.interceptor';
import { RolesGuard } from './roles.guard';

const contextFor = (roles: Role[] | undefined, userRole?: Role) => {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(roles);
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ user: userRole ? { id: '1', email: 'x', role: userRole } : undefined }),
    }),
  } as unknown as ExecutionContext;
  return { guard: new RolesGuard(reflector), context };
};

describe('RolesGuard', () => {
  it('lets routes without @Roles through', () => {
    const { guard, context } = contextFor(undefined, 'USER');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a matching role', () => {
    const { guard, context } = contextFor(['ADMIN'], 'ADMIN');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects USER on ADMIN routes with 403 FORBIDDEN', () => {
    const { guard, context } = contextFor(['ADMIN'], 'USER');
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

describe('redactSecrets', () => {
  it('removes secret fields at any depth and keeps everything else', () => {
    const createdAt = new Date();
    const input = {
      user: { id: '1', passwordHash: 'x', createdAt },
      tokens: [{ tokenHash: 'y', familyId: 'f' }],
      data: [1, 'a', null],
    };

    expect(redactSecrets(input)).toEqual({
      user: { id: '1', createdAt },
      tokens: [{ familyId: 'f' }],
      data: [1, 'a', null],
    });
  });
});
