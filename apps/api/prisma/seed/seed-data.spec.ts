import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LOCALES, validateOpeningHours } from '@korea-project/shared';
import { CostTier, PlaceCategory } from '../../src/generated/prisma/enums';
import { cities, favorites, reviews, users } from './data';
import { galleryImages, slugify } from './helpers';
import type { Localized } from './types';

// Guards the quality of the demo data: these checks run without a database.

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAIN_CATEGORIES = [
  PlaceCategory.RESTAURANT,
  PlaceCategory.NIGHTLIFE,
  PlaceCategory.HIKING,
  PlaceCategory.ATTRACTION,
  PlaceCategory.CAFE,
];
const EXTRA_CATEGORIES = [PlaceCategory.SHOPPING, PlaceCategory.CULTURE, PlaceCategory.NATURE];

const places = cities.flatMap((city) => city.places.map((place) => ({ city, place })));
const placeSlugs = new Set(places.map(({ place }) => place.slug));
const userEmails = new Set(users.map((u) => u.email));

/** Great-circle distance in km. */
function distanceKm(a: { latitude: number; longitude: number }, b: typeof a): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const duplicates = (values: string[]) => values.filter((v, i) => values.indexOf(v) !== i);

/** Every locale present, with non-empty strings. */
function expectComplete<T extends object>(text: Localized<T>, required: (keyof T)[]) {
  for (const locale of LOCALES) {
    for (const field of required) {
      expect(String(text[locale][field] ?? '').trim()).not.toBe('');
    }
  }
}

describe('seed data', () => {
  describe('cities and districts', () => {
    it('has the 4 required cities with unique kebab-case slugs', () => {
      const slugs = cities.map((c) => c.slug);
      expect(slugs).toEqual(expect.arrayContaining(['seoul', 'busan', 'jeju', 'incheon']));
      expect(duplicates(slugs)).toEqual([]);
      slugs.forEach((slug) => expect(slug).toMatch(KEBAB));
    });

    it.each(cities)('$slug has 3–5 districts with unique slugs and full translations', (city) => {
      expect(city.districts.length).toBeGreaterThanOrEqual(3);
      expect(city.districts.length).toBeLessThanOrEqual(5);
      expect(duplicates(city.districts.map((d) => d.slug))).toEqual([]);
      expectComplete(city.text, ['name', 'description', 'bestTimeToVisit']);
      for (const district of city.districts) {
        expect(district.slug).toMatch(KEBAB);
        expectComplete(district.text, ['name', 'description']);
        expect(distanceKm(city, district)).toBeLessThan(60);
      }
    });

    it.each(cities)('$slug has a cost estimate for every tier', (city) => {
      for (const tier of Object.values(CostTier)) {
        const estimate = city.costEstimates[tier];
        Object.values(estimate).forEach((value) => expect(value).toBeGreaterThan(0));
      }
      // Pricier tiers must cost more, otherwise the calculator would be misleading.
      expect(city.costEstimates.BUDGET.lodgingPerRoomPerNightKRW).toBeLessThan(
        city.costEstimates.MID.lodgingPerRoomPerNightKRW,
      );
      expect(city.costEstimates.MID.lodgingPerRoomPerNightKRW).toBeLessThan(
        city.costEstimates.LUXURY.lodgingPerRoomPerNightKRW,
      );
    });
  });

  describe('places', () => {
    it('slugs are globally unique, kebab-case and English-only (ASCII)', () => {
      const slugs = places.map(({ place }) => place.slug);
      expect(duplicates(slugs)).toEqual([]);
      slugs.forEach((slug) => expect(slug).toMatch(KEBAB));
    });

    it.each(cities)('$slug has 4–6 places per main category and 2–4 per extra one', (city) => {
      // Collect violations so a failure names the category and its count.
      const outOfRange = (categories: PlaceCategory[], min: number, max: number) =>
        categories
          .map((category) => [category, city.places.filter((p) => p.category === category).length])
          .filter(([, count]) => (count as number) < min || (count as number) > max);
      expect(outOfRange(MAIN_CATEGORIES, 4, 6)).toEqual([]);
      expect(outOfRange(EXTRA_CATEGORIES, 2, 4)).toEqual([]);
    });

    it.each(places.map(({ city, place }) => [place.slug, city, place] as const))(
      '%s is consistent',
      (_slug, city, place) => {
        // Location: inside South Korea and near its city (catches swapped or mistyped coordinates).
        expect(place.latitude).toBeGreaterThan(33);
        expect(place.latitude).toBeLessThan(38.7);
        expect(place.longitude).toBeGreaterThan(124.5);
        expect(place.longitude).toBeLessThan(131);
        expect(distanceKm(city, place)).toBeLessThan(60);

        if (place.district) {
          expect(city.districts.map((d) => d.slug)).toContain(place.district);
        }

        expect(place.priceLevel).toBeGreaterThanOrEqual(1);
        expect(place.priceLevel).toBeLessThanOrEqual(4);
        expect(place.averageSpendKRW).toBeGreaterThanOrEqual(0);
        expect(place.nameKo).toMatch(/[가-힣]/); // contains Hangul
        expect(place.address).not.toMatch(/\bSeul\b/); // addresses are romanized/English
        if (place.website) expect(place.website).toMatch(/^https:\/\//);

        if (place.openingHours) expect(validateOpeningHours(place.openingHours)).toEqual([]);

        // Trail metrics exist exactly for hiking places.
        expect(Boolean(place.trail)).toBe(place.category === PlaceCategory.HIKING);

        // Tags are English keys; their labels are translated in the web app.
        expect(place.tags.length).toBeGreaterThan(0);
        place.tags.forEach((tag) => expect(tag).toMatch(KEBAB));
        expect(duplicates(place.tags)).toEqual([]);

        // Translations: complete, actually translated, and notes present in all or no locales.
        expectComplete(place.text, ['name', 'description']);
        expect(place.text['pt-BR'].description).not.toBe(place.text.en.description);
        const notes = LOCALES.map((locale) => Boolean(place.text[locale].hoursNote));
        expect(new Set(notes).size).toBe(1);
      },
    );
  });

  describe('accommodations', () => {
    it('generated slugs are globally unique', () => {
      const slugs = cities.flatMap((c) => c.accommodations.map((a) => slugify(a.name)));
      expect(duplicates(slugs)).toEqual([]);
    });

    it.each(cities)('$slug has 3 accommodations per tier, priced by tier', (city) => {
      for (const tier of Object.values(CostTier)) {
        expect(city.accommodations.filter((a) => a.tier === tier)).toHaveLength(3);
      }
      const maxBudget = Math.max(
        ...city.accommodations.filter((a) => a.tier === 'BUDGET').map((a) => a.pricePerNightKRW),
      );
      const minLuxury = Math.min(
        ...city.accommodations.filter((a) => a.tier === 'LUXURY').map((a) => a.pricePerNightKRW),
      );
      expect(maxBudget).toBeLessThan(minLuxury);
      for (const a of city.accommodations) {
        if (a.district) expect(city.districts.map((d) => d.slug)).toContain(a.district);
        expect(distanceKm(city, a)).toBeLessThan(60);
      }
    });
  });

  describe('users, reviews and favorites', () => {
    it('has unique emails and exactly one admin', () => {
      expect(duplicates(users.map((u) => u.email))).toEqual([]);
      expect(users.filter((u) => u.role === 'ADMIN')).toHaveLength(1);
      users.forEach((u) => expect(u.email).toMatch(/@example\.com$/));
    });

    it('reviews reference existing users and places, once per user and place', () => {
      for (const review of reviews) {
        expect(userEmails).toContain(review.userEmail);
        expect(placeSlugs).toContain(review.placeSlug);
        expect(LOCALES).toContain(review.locale);
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
        expect(Number.isNaN(Date.parse(`${review.visitedAt}T00:00:00Z`))).toBe(false);
      }
      expect(duplicates(reviews.map((r) => `${r.userEmail}|${r.placeSlug}`))).toEqual([]);
    });

    it('has reviews in every locale', () => {
      for (const locale of LOCALES) {
        expect(reviews.some((r) => r.locale === locale)).toBe(true);
      }
    });

    it('favorites reference existing users and places, without duplicates', () => {
      for (const favorite of favorites) {
        expect(userEmails).toContain(favorite.userEmail);
        expect(placeSlugs).toContain(favorite.placeSlug);
      }
      expect(duplicates(favorites.map((f) => `${f.userEmail}|${f.placeSlug}`))).toEqual([]);
    });
  });
});

describe('seed helpers', () => {
  it('slugify strips accents, apostrophes and symbols', () => {
    expect(slugify('Palácio Gyeongbokgung')).toBe('palacio-gyeongbokgung');
    expect(slugify("O'sulloc Tea Museum")).toBe('osulloc-tea-museum');
    expect(slugify('RYSE, Autograph Collection')).toBe('ryse-autograph-collection');
    expect(slugify('Hotel A & B')).toBe('hotel-a-and-b');
  });

  it('gallery images are deterministic per slug', () => {
    expect(galleryImages('x', 2)).toEqual(galleryImages('x', 2));
    expect(galleryImages('x', 2)).toHaveLength(2);
    expect(galleryImages('x')[0]).not.toBe(galleryImages('y')[0]);
  });
});

describe('tag labels in the web app', () => {
  // Tags are language-neutral keys; the web app translates them (apps/web/src/messages). A seed
  // tag without a label would show up as a raw key, so this fails until both locales have it.
  const messages = (locale: string) =>
    JSON.parse(
      readFileSync(join(__dirname, '../../../web/src/messages', `${locale}.json`), 'utf8'),
    ) as { tags?: Record<string, string> };
  const seedTags = [...new Set(places.flatMap(({ place }) => place.tags))].sort();

  it.each(LOCALES)('every seed tag has a %s label', (locale) => {
    const labels = messages(locale).tags ?? {};
    const missing = seedTags.filter((tag) => !labels[tag]?.trim());
    expect(missing).toEqual([]);
  });
});
