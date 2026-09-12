CREATE TYPE "AutomationRunStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

CREATE TABLE "automation_runs" (
  "id" UUID NOT NULL,
  "job" TEXT NOT NULL,
  "status" "AutomationRunStatus" NOT NULL DEFAULT 'RUNNING',
  "triggeredBy" TEXT NOT NULL,
  "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMPTZ(3),
  "summary" JSONB,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "automation_runs_job_startedAt_idx" ON "automation_runs"("job", "startedAt" DESC);
CREATE INDEX "automation_runs_status_startedAt_idx" ON "automation_runs"("status", "startedAt" DESC);
