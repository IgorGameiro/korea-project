import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface NewRefreshToken {
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}

/** RefreshToken rows belong to the auth domain; only hashes are ever stored. */
@Injectable()
export class RefreshTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: NewRefreshToken) {
    return this.prisma.refreshToken.create({ data });
  }

  findByHash(tokenHash: string) {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  /**
   * Atomically retires `oldId` and stores its successor. Returns null when `oldId` was already
   * revoked (e.g. a concurrent refresh with the same token won the race): the caller treats it as reuse.
   */
  rotate(oldId: string, next: NewRefreshToken) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({ data: next });
      const { count } = await tx.refreshToken.updateMany({
        where: { id: oldId, revokedAt: null },
        data: { revokedAt: new Date(), replacedById: created.id },
      });
      if (count !== 1) {
        await tx.refreshToken.delete({ where: { id: created.id } });
        return null;
      }
      return created;
    });
  }

  /** Revokes every still-active token issued from the same login. */
  revokeFamily(familyId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
