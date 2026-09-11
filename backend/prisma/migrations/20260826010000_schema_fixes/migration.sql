-- Phase 1: Schema fixes migration
-- 1.1 PostGIS, 1.2 Booking reference, 1.3 Review default, 1.4 changes_requested status

-- ═══════════════════════════════════════════════════════════
-- 1.1 PostGIS geography columns
-- ═══════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography columns to providers
ALTER TABLE "providers" ADD COLUMN "location" geography(Point, 4326);

-- Populate from existing lat/lng
UPDATE "providers"
SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

-- Add GIST index for spatial queries
CREATE INDEX "providers_location_idx" ON "providers" USING GIST ("location");

-- Add geography column to destinations
ALTER TABLE "destinations" ADD COLUMN "location" geography(Point, 4326);

-- Populate from existing lat/lng
UPDATE "destinations"
SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

-- Add GIST index for spatial queries
CREATE INDEX "destinations_location_idx" ON "destinations" USING GIST ("location");

-- ═══════════════════════════════════════════════════════════
-- 1.2 Human-readable booking reference
-- ═══════════════════════════════════════════════════════════

ALTER TABLE "bookings" ADD COLUMN "reference" TEXT;

-- Backfill existing bookings with generated references
UPDATE "bookings"
SET "reference" = 'ST-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 6))
WHERE "reference" IS NULL;

-- Now make it NOT NULL and UNIQUE
ALTER TABLE "bookings" ALTER COLUMN "reference" SET NOT NULL;
CREATE UNIQUE INDEX "bookings_reference_key" ON "bookings" ("reference");

-- ═══════════════════════════════════════════════════════════
-- 1.3 Fix review default status
-- ═══════════════════════════════════════════════════════════

ALTER TABLE "reviews" ALTER COLUMN "status" SET DEFAULT 'published';

-- ═══════════════════════════════════════════════════════════
-- 1.4 Add changes_requested to ProviderStatus enum
-- ═══════════════════════════════════════════════════════════

ALTER TYPE "ProviderStatus" ADD VALUE IF NOT EXISTS 'changes_requested' AFTER 'under_review';
