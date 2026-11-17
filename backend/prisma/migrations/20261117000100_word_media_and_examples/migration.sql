ALTER TABLE "words"
  ADD COLUMN "image_urls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "image_credits" JSONB,
  ADD COLUMN "example_en" TEXT,
  ADD COLUMN "example_es" TEXT;
