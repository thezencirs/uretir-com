import { afterEach, expect, it, vi } from "vitest";
import OpenAI from "openai";
import { streamGroundedExplanation } from "@/lib/puan-ai/ai-service";
import { evaluateCampaigns } from "@/lib/puan-ai/rule-engine";
import { campaignFixture } from "./support/puan-ai-fixture";

vi.mock("openai", () => ({ default: vi.fn() }));
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

it("does not create a paid API client even when a key exists unless explicitly enabled", async () => {
  vi.stubEnv("OPENAI_API_KEY", "test-not-a-real-key");
  vi.stubEnv("PUANAI_PAID_AI_ENABLED", "false");
  const campaigns = evaluateCampaigns([campaignFixture()], "market 1500 TL", new Date("2026-07-25T09:00:00Z"));
  expect(campaigns.length).toBeGreaterThan(0);
  let answer = "";
  for await (const part of streamGroundedExplanation("market 1500 TL", campaigns)) answer += part;
  expect(answer).toContain("doğrulanmış");
  expect(OpenAI).not.toHaveBeenCalled();
});
