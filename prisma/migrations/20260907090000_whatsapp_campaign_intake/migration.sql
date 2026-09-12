CREATE TYPE "CampaignSubmissionStatus" AS ENUM (
  'RECEIVED', 'URL_REQUIRED', 'VERIFYING', 'VERIFIED', 'NEEDS_REVIEW',
  'REJECTED', 'SOURCE_UNAVAILABLE', 'EXPIRED'
);

CREATE TABLE "campaign_submissions" (
  "id" UUID NOT NULL,
  "providerMessageId" TEXT NOT NULL,
  "channelId" TEXT,
  "senderId" TEXT,
  "rawText" TEXT NOT NULL,
  "sourceUrl" TEXT,
  "receivedAt" TIMESTAMPTZ(3) NOT NULL,
  "status" "CampaignSubmissionStatus" NOT NULL DEFAULT 'RECEIVED',
  "verification" JSONB,
  "normalizedDraft" JSONB,
  "error" TEXT,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMPTZ(3),
  "processedAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "campaign_submissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "campaign_submissions_providerMessageId_key" ON "campaign_submissions"("providerMessageId");
CREATE INDEX "campaign_submissions_status_nextAttemptAt_idx" ON "campaign_submissions"("status", "nextAttemptAt");
CREATE INDEX "campaign_submissions_receivedAt_idx" ON "campaign_submissions"("receivedAt" DESC);
