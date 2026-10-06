-- Photos carry their credit (Wikimedia Commons licenses require author + license).

-- Place.imageUrls (TEXT[]) -> Place.images (JSONB array of {"url": ...}), keeping the order.
ALTER TABLE "Place" ADD COLUMN "images" JSONB NOT NULL DEFAULT '[]';

UPDATE "Place"
SET "images" = COALESCE(
  (
    SELECT jsonb_agg(jsonb_build_object('url', u.url) ORDER BY u.position)
    FROM unnest("imageUrls") WITH ORDINALITY AS u(url, position)
  ),
  '[]'::jsonb
);

ALTER TABLE "Place" DROP COLUMN "imageUrls";

-- Credit of the city cover photo; NULL for placeholders.
ALTER TABLE "City" ADD COLUMN "heroImageCredit" JSONB;
