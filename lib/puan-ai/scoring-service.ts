import { getPrisma } from "@/lib/puan-ai/db";
import { DEFAULT_SCORE_WEIGHTS, validateWeights, type ScoreWeights } from "@/lib/puan-ai/decision-engine";

export async function getActiveScoreWeights(): Promise<ScoreWeights> {
  const record = await getPrisma().scoringConfiguration.findFirst({ where: { active: true }, orderBy: [{ version: "desc" }, { updatedAt: "desc" }] });
  if (!record) return { ...DEFAULT_SCORE_WEIGHTS };
  try { return validateWeights(record.weights as ScoreWeights); } catch { return { ...DEFAULT_SCORE_WEIGHTS }; }
}
