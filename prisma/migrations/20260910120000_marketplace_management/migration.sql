CREATE TYPE "MarketplacePlatform" AS ENUM ('WEB', 'MOBILE');

CREATE TYPE "MarketplaceProductStatus" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "marketplace_products" (
  "id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "makerName" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "platform" "MarketplacePlatform" NOT NULL,
  "task" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "makerUrl" TEXT NOT NULL,
  "locationSourceUrl" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT '#769d32',
  "status" "MarketplaceProductStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "marketplace_products_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "marketplace_products_slug_key" ON "marketplace_products"("slug");
CREATE INDEX "marketplace_products_status_platform_updatedAt_idx" ON "marketplace_products"("status", "platform", "updatedAt" DESC);
CREATE INDEX "marketplace_products_makerName_city_idx" ON "marketplace_products"("makerName", "city");
