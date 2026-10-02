import { SetMetadata } from '@nestjs/common';
import type { Role } from '@korea-project/shared';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given roles. Enforced by RolesGuard (Phase 3). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
