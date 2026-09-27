CREATE TABLE "property_listing_observations" (
  "id" UUID NOT NULL, "listingKey" TEXT NOT NULL, "sourceId" TEXT NOT NULL, "sourceName" TEXT NOT NULL,
  "sourceKind" TEXT NOT NULL, "externalId" TEXT, "listingType" TEXT NOT NULL, "propertyType" TEXT NOT NULL,
  "title" TEXT NOT NULL, "description" TEXT, "city" TEXT, "district" TEXT, "neighborhood" TEXT, "rooms" TEXT,
  "grossM2" DECIMAL(10,2), "netM2" DECIMAL(10,2), "price" DECIMAL(16,2), "currency" TEXT NOT NULL DEFAULT 'TRY',
  "pricePerM2" DECIMAL(14,2), "isPublicAuction" BOOLEAN NOT NULL DEFAULT false, "publishedAt" TIMESTAMPTZ(3),
  "sourceUrl" TEXT NOT NULL, "imageUrl" TEXT, "trustScore" INTEGER NOT NULL, "fetchedAt" TIMESTAMPTZ(3) NOT NULL,
  "fingerprint" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "property_listing_observations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "property_listing_observations_listingKey_fetchedAt_idx" ON "property_listing_observations"("listingKey","fetchedAt" DESC);
CREATE INDEX "property_listing_observations_city_district_listingType_propertyType_fetchedAt_idx" ON "property_listing_observations"("city","district","listingType","propertyType","fetchedAt" DESC);
CREATE INDEX "property_listing_observations_sourceId_fetchedAt_idx" ON "property_listing_observations"("sourceId","fetchedAt" DESC);
CREATE INDEX "property_listing_observations_isPublicAuction_fetchedAt_idx" ON "property_listing_observations"("isPublicAuction","fetchedAt" DESC);
