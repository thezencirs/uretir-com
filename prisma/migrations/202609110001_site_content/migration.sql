CREATE TABLE "site_content" (
  "id" TEXT NOT NULL,
  "draft" JSONB NOT NULL,
  "published" JSONB NOT NULL,
  "previous" JSONB,
  "revision" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "site_content_pkey" PRIMARY KEY ("id")
);
