import * as shared from '@korea-project/shared';
import * as prisma from '../generated/prisma/enums';

// The web app only knows the enums from @korea-project/shared; the database uses the Prisma ones.
// If they drift, filters and badges silently break, so keep them identical.
const pairs = [
  ['PlaceCategory', shared.PlaceCategory, prisma.PlaceCategory],
  ['CostTier', shared.CostTier, prisma.CostTier],
  ['AccommodationType', shared.AccommodationType, prisma.AccommodationType],
  ['TrailDifficulty', shared.TrailDifficulty, prisma.TrailDifficulty],
  ['Role', shared.Role, prisma.Role],
] as const;

describe('enum parity between Prisma schema and @korea-project/shared', () => {
  it.each(pairs)('%s has the same values', (_name, sharedEnum, prismaEnum) => {
    expect(Object.values(sharedEnum).sort()).toEqual(Object.values(prismaEnum).sort());
  });
});
