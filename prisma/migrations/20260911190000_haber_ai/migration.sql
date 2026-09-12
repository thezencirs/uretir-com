CREATE TABLE "haber_articles" ("id" TEXT PRIMARY KEY,"published_at" TIMESTAMPTZ NOT NULL,"payload" JSONB NOT NULL);
CREATE INDEX "haber_articles_published_at_idx" ON "haber_articles"("published_at" DESC);
CREATE TABLE "haber_runs" ("id" TEXT PRIMARY KEY,"started_at" TIMESTAMPTZ NOT NULL,"payload" JSONB NOT NULL);