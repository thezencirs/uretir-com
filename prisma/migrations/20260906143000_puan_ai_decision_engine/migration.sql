ALTER TYPE "CampaignStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';
ALTER TYPE "CampaignStatus" ADD VALUE IF NOT EXISTS 'UPCOMING';
ALTER TYPE "CampaignStatus" ADD VALUE IF NOT EXISTS 'SUSPENDED';
ALTER TYPE "CampaignStatus" ADD VALUE IF NOT EXISTS 'UNVERIFIED';
ALTER TYPE "CampaignStatus" ADD VALUE IF NOT EXISTS 'SOURCE_UNAVAILABLE';
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'SOURCE_UNAVAILABLE';
ALTER TYPE "VerificationStatus" ADD VALUE IF NOT EXISTS 'CONFLICT';

CREATE TYPE "SourceKind" AS ENUM ('OFFICIAL_BANK', 'OFFICIAL_CARD_PROGRAM', 'OFFICIAL_MERCHANT', 'OFFICIAL_BRAND', 'TRUSTED_MARKETPLACE', 'COMPARISON_SITE', 'USER_SUBMITTED', 'OTHER');
CREATE TYPE "SourceHealth" AS ENUM ('ONLINE', 'UNAVAILABLE', 'BLOCKED', 'INVALID_CONTENT');
CREATE TYPE "PriceAvailability" AS ENUM ('IN_STOCK', 'OUT_OF_STOCK', 'UNKNOWN');

CREATE TABLE "card_programs" (
  "id" UUID NOT NULL, "bankId" UUID NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL,
  "websiteUrl" TEXT, "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "card_programs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "card_programs_slug_key" ON "card_programs"("slug");
CREATE INDEX "card_programs_bankId_status_idx" ON "card_programs"("bankId", "status");
ALTER TABLE "card_programs" ADD CONSTRAINT "card_programs_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cards" ADD COLUMN "cardProgramId" UUID;
CREATE INDEX "cards_cardProgramId_idx" ON "cards"("cardProgramId");
ALTER TABLE "cards" ADD CONSTRAINT "cards_cardProgramId_fkey" FOREIGN KEY ("cardProgramId") REFERENCES "card_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "official_sources" ADD COLUMN "sourceKind" "SourceKind" NOT NULL DEFAULT 'OTHER';
ALTER TABLE "official_sources" ADD COLUMN "trustScore" INTEGER NOT NULL DEFAULT 40;
ALTER TABLE "official_sources" ADD COLUMN "health" "SourceHealth" NOT NULL DEFAULT 'ONLINE';
ALTER TABLE "official_sources" ADD COLUMN "lastVerifiedAt" TIMESTAMPTZ(3);
ALTER TABLE "official_sources" ADD COLUMN "validFrom" TIMESTAMPTZ(3);
ALTER TABLE "official_sources" ADD COLUMN "validUntil" TIMESTAMPTZ(3);

CREATE TABLE "campaign_conflicts" (
  "id" UUID NOT NULL, "campaignId" UUID NOT NULL, "field" TEXT NOT NULL, "values" JSONB NOT NULL,
  "sourceIds" TEXT[] DEFAULT ARRAY[]::TEXT[], "resolved" BOOLEAN NOT NULL DEFAULT false, "resolution" TEXT,
  "detectedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "resolvedAt" TIMESTAMPTZ(3),
  CONSTRAINT "campaign_conflicts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "campaign_conflicts_campaignId_resolved_idx" ON "campaign_conflicts"("campaignId", "resolved");
ALTER TABLE "campaign_conflicts" ADD CONSTRAINT "campaign_conflicts_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "price_observations" (
  "id" UUID NOT NULL, "productKey" TEXT NOT NULL, "productName" TEXT NOT NULL, "merchantName" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL, "currency" TEXT NOT NULL DEFAULT 'TRY', "shippingAmount" DECIMAL(14,2),
  "availability" "PriceAvailability" NOT NULL DEFAULT 'UNKNOWN', "sourceUrl" TEXT NOT NULL, "sourceName" TEXT NOT NULL,
  "sourceKind" "SourceKind" NOT NULL, "trustScore" INTEGER NOT NULL, "fetchedAt" TIMESTAMPTZ(3) NOT NULL,
  "lastVerifiedAt" TIMESTAMPTZ(3) NOT NULL, "fingerprint" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "price_observations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "price_observations_productKey_fetchedAt_idx" ON "price_observations"("productKey", "fetchedAt" DESC);

CREATE TABLE "scoring_configurations" (
  "id" UUID NOT NULL, "key" TEXT NOT NULL, "weights" JSONB NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  "version" INTEGER NOT NULL DEFAULT 1, "updatedBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "scoring_configurations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "scoring_configurations_key_key" ON "scoring_configurations"("key");
