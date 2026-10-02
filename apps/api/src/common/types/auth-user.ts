import type { Role } from '@korea-project/shared';

/** Shape attached to `request.user` by the JWT strategy (Phase 3). */
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
