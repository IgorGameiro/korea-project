-- i18n: move translatable text into <Entity>Translation tables (one row per entity + locale).
-- Generated with `prisma migrate diff`, then reordered by hand so existing content is preserved:
-- it was written in Portuguese, so it is copied as the "pt-BR" translation before the old
-- columns are dropped. The seed then adds/updates the "en" rows.

-- ---------------------------------------------------------------------------
-- 1. Translation tables
-- ---------------------------------------------------------------------------

CREATE TABLE "CityTranslation" (
    "id" UUID NOT NULL,
    "cityId" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bestTimeToVisit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CityTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DistrictTranslation" (
    "id" UUID NOT NULL,
    "districtId" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistrictTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlaceTranslation" (
    "id" UUID NOT NULL,
    "placeId" UUID NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "openingHoursNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlaceTranslation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CityTranslation_cityId_locale_key" ON "CityTranslation"("cityId", "locale");
CREATE UNIQUE INDEX "DistrictTranslation_districtId_locale_key" ON "DistrictTranslation"("districtId", "locale");
CREATE UNIQUE INDEX "PlaceTranslation_placeId_locale_key" ON "PlaceTranslation"("placeId", "locale");

ALTER TABLE "CityTranslation" ADD CONSTRAINT "CityTranslation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DistrictTranslation" ADD CONSTRAINT "DistrictTranslation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlaceTranslation" ADD CONSTRAINT "PlaceTranslation_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- 2. Copy existing (Portuguese) content. uuidv7() requires PostgreSQL 18+.
-- ---------------------------------------------------------------------------

INSERT INTO "CityTranslation" ("id", "cityId", "locale", "name", "description", "bestTimeToVisit", "updatedAt")
SELECT uuidv7(), "id", 'pt-BR', "name", "description", "bestTimeToVisit", CURRENT_TIMESTAMP FROM "City";

INSERT INTO "DistrictTranslation" ("id", "districtId", "locale", "name", "description", "updatedAt")
SELECT uuidv7(), "id", 'pt-BR', "name", "description", CURRENT_TIMESTAMP FROM "District";

-- Opening-hours notes were free text inside the JSON; they become a translatable column.
INSERT INTO "PlaceTranslation" ("id", "placeId", "locale", "name", "description", "openingHoursNote", "updatedAt")
SELECT uuidv7(), "id", 'pt-BR', "name", "description", "openingHours"->>'notes', CURRENT_TIMESTAMP FROM "Place";

UPDATE "Place" SET "openingHours" = "openingHours" - 'notes' WHERE "openingHours" ? 'notes';

-- Existing reviews were written in Portuguese. New reviews must always state their locale.
ALTER TABLE "Review" ADD COLUMN "locale" VARCHAR(10) NOT NULL DEFAULT 'pt-BR';
ALTER TABLE "Review" ALTER COLUMN "locale" DROP DEFAULT;

-- ---------------------------------------------------------------------------
-- 3. Drop the old single-language columns
-- ---------------------------------------------------------------------------

ALTER TABLE "City" DROP COLUMN "bestTimeToVisit",
DROP COLUMN "description",
DROP COLUMN "name";

ALTER TABLE "District" DROP COLUMN "description",
DROP COLUMN "name";

ALTER TABLE "Place" DROP COLUMN "description",
DROP COLUMN "name";

-- ---------------------------------------------------------------------------
-- 4. CHECK constraints: supported locales (keep in sync with packages/shared/src/i18n.ts)
-- ---------------------------------------------------------------------------

ALTER TABLE "CityTranslation" ADD CONSTRAINT "CityTranslation_locale_check" CHECK ("locale" IN ('en', 'pt-BR'));
ALTER TABLE "DistrictTranslation" ADD CONSTRAINT "DistrictTranslation_locale_check" CHECK ("locale" IN ('en', 'pt-BR'));
ALTER TABLE "PlaceTranslation" ADD CONSTRAINT "PlaceTranslation_locale_check" CHECK ("locale" IN ('en', 'pt-BR'));
ALTER TABLE "Review" ADD CONSTRAINT "Review_locale_check" CHECK ("locale" IN ('en', 'pt-BR'));
