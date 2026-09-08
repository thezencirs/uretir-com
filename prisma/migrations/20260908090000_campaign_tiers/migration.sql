CREATE TABLE "campaign_tiers" (
  "id" UUID NOT NULL,
  "campaignId" UUID NOT NULL,
  "minimumSpend" DECIMAL(14,2) NOT NULL,
  "maximumSpend" DECIMAL(14,2),
  "rewardAmount" DECIMAL(14,2) NOT NULL,
  "description" TEXT NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "campaign_tiers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "campaign_tiers_campaignId_minimumSpend_maximumSpend_idx"
  ON "campaign_tiers"("campaignId", "minimumSpend", "maximumSpend");

ALTER TABLE "campaign_tiers"
  ADD CONSTRAINT "campaign_tiers_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
