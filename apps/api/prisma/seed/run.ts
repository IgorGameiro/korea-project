import { Prisma, type PrismaClient } from '../../src/generated/prisma/client';
import { CostTier } from '../../src/generated/prisma/enums';
import { galleryImages, heroImage, slugify } from './helpers';
import type { CitySeed, FavoriteSeed, ReviewSeed, UserSeed } from './types';

export interface SeedInput {
  cities: CitySeed[];
  users: UserSeed[];
  reviews: ReviewSeed[];
  favorites: FavoriteSeed[];
  /** argon2 hash per user email, computed before the transaction (hashing is slow). */
  passwordHashes: Map<string, string>;
  /** How many BRL one KRW buys. */
  krwToBrl: number;
}

export type SeedSummary = Record<
  | 'cities'
  | 'districts'
  | 'places'
  | 'accommodations'
  | 'costEstimates'
  | 'users'
  | 'reviews'
  | 'favorites',
  number
>;

const must = <T>(value: T | undefined, what: string): T => {
  if (value === undefined) throw new Error(`Seed data references an unknown ${what}`);
  return value;
};

/**
 * Idempotent: every row is upserted by its natural key (slug, email, composite unique), so running
 * it again updates the data instead of duplicating it. Runs in one transaction: all or nothing.
 */
export async function runSeed(prisma: PrismaClient, input: SeedInput): Promise<SeedSummary> {
  return prisma.$transaction(
    async (tx) => {
      const placeIds = new Map<string, string>();

      for (const { districts, costEstimates, places, accommodations, ...city } of input.cities) {
        const cityData = { ...city, heroImageUrl: heroImage(city.slug) };
        const { id: cityId } = await tx.city.upsert({
          where: { slug: city.slug },
          create: cityData,
          update: cityData,
        });

        const districtIds = new Map<string, string>();
        for (const district of districts) {
          const { id } = await tx.district.upsert({
            where: { cityId_slug: { cityId, slug: district.slug } },
            create: { ...district, cityId },
            update: district,
          });
          districtIds.set(district.slug, id);
        }
        const districtId = (slug?: string) =>
          slug ? must(districtIds.get(slug), `district "${slug}" in ${city.slug}`) : null;

        for (const tier of Object.values(CostTier)) {
          const data = costEstimates[tier];
          await tx.costEstimate.upsert({
            where: { cityId_tier: { cityId, tier } },
            create: { ...data, cityId, tier },
            update: data,
          });
        }

        for (const { trail, district, openingHours, website, ...place } of places) {
          const slug = slugify(place.name);
          const data = {
            ...place,
            cityId,
            districtId: districtId(district),
            openingHours: openingHours ?? Prisma.JsonNull,
            website: website ?? null,
            imageUrls: galleryImages(slug),
            difficulty: trail?.difficulty ?? null,
            distanceKm: trail?.distanceKm ?? null,
            durationMinutes: trail?.durationMinutes ?? null,
            elevationGainM: trail?.elevationGainM ?? null,
          };
          const { id } = await tx.place.upsert({
            where: { slug },
            create: { ...data, slug },
            update: data,
          });
          placeIds.set(slug, id);
        }

        for (const { district, ...accommodation } of accommodations) {
          const slug = slugify(accommodation.name);
          const data = {
            ...accommodation,
            cityId,
            districtId: districtId(district),
            imageUrls: galleryImages(slug, 2),
          };
          await tx.accommodation.upsert({
            where: { slug },
            create: { ...data, slug },
            update: data,
          });
        }
      }

      const userIds = new Map<string, string>();
      for (const user of input.users) {
        const email = user.email.toLowerCase();
        const data = {
          name: user.name,
          role: user.role,
          passwordHash: must(input.passwordHashes.get(email), `password hash for ${email}`),
        };
        const { id } = await tx.user.upsert({
          where: { email },
          create: { ...data, email },
          update: data,
        });
        userIds.set(email, id);
      }

      const ref = (seed: { userEmail: string; placeSlug: string }) => ({
        userId: must(userIds.get(seed.userEmail.toLowerCase()), `user "${seed.userEmail}"`),
        placeId: must(placeIds.get(seed.placeSlug), `place "${seed.placeSlug}"`),
      });

      for (const { userEmail, placeSlug, visitedAt, ...review } of input.reviews) {
        const key = ref({ userEmail, placeSlug });
        const data = { ...review, visitedAt: new Date(`${visitedAt}T00:00:00Z`) };
        await tx.review.upsert({
          where: { userId_placeId: key },
          create: { ...data, ...key },
          update: data,
        });
      }

      for (const favorite of input.favorites) {
        const key = ref(favorite);
        await tx.favorite.upsert({ where: { userId_placeId: key }, create: key, update: {} });
      }

      await tx.exchangeRate.upsert({
        where: { base_target: { base: 'KRW', target: 'BRL' } },
        create: { base: 'KRW', target: 'BRL', rate: String(input.krwToBrl), source: 'env' },
        update: { rate: String(input.krwToBrl), source: 'env' },
      });

      // Denormalized rating columns, derived from the reviews (never typed by hand).
      await tx.place.updateMany({ data: { ratingAvg: 0, ratingCount: 0 } });
      const stats = await tx.review.groupBy({
        by: ['placeId'],
        _avg: { rating: true },
        _count: { _all: true },
      });
      for (const { placeId, _avg, _count } of stats) {
        await tx.place.update({
          where: { id: placeId },
          data: {
            ratingAvg: Math.round((_avg.rating ?? 0) * 100) / 100,
            ratingCount: _count._all,
          },
        });
      }

      return {
        cities: await tx.city.count(),
        districts: await tx.district.count(),
        places: await tx.place.count(),
        accommodations: await tx.accommodation.count(),
        costEstimates: await tx.costEstimate.count(),
        users: await tx.user.count(),
        reviews: await tx.review.count(),
        favorites: await tx.favorite.count(),
      };
    },
    { maxWait: 10_000, timeout: 120_000 },
  );
}
