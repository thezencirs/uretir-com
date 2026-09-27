CREATE TABLE "vehicle_price_observations" (
  "id" UUID NOT NULL,
  "brand" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "trim" TEXT,
  "modelYear" INTEGER,
  "fuel" TEXT,
  "transmission" TEXT,
  "listPrice" DECIMAL(14,2) NOT NULL,
  "campaignPrice" DECIMAL(14,2),
  "currency" TEXT NOT NULL DEFAULT 'TRY',
  "sourceUrl" TEXT NOT NULL,
  "sourceName" TEXT NOT NULL,
  "fetchedAt" TIMESTAMPTZ(3) NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vehicle_price_observations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "vehicle_price_observations_brand_model_fetchedAt_idx" ON "vehicle_price_observations"("brand","model","fetchedAt" DESC);
CREATE INDEX "vehicle_price_observations_fetchedAt_idx" ON "vehicle_price_observations"("fetchedAt" DESC);

CREATE TABLE "vehicle_campaign_observations" (
  "id" UUID NOT NULL,
  "brand" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "validFrom" TIMESTAMPTZ(3),
  "validUntil" TIMESTAMPTZ(3),
  "sourceUrl" TEXT NOT NULL,
  "sourceName" TEXT NOT NULL,
  "fetchedAt" TIMESTAMPTZ(3) NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vehicle_campaign_observations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "vehicle_campaign_observations_brand_active_validUntil_idx" ON "vehicle_campaign_observations"("brand","active","validUntil");
CREATE INDEX "vehicle_campaign_observations_fetchedAt_idx" ON "vehicle_campaign_observations"("fetchedAt" DESC);
