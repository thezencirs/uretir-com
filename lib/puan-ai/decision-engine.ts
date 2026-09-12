export type BenefitKind = "DIRECT_DISCOUNT" | "CASHBACK" | "REWARD_POINTS" | "SHIPPING";

export type MonetaryBenefit = {
  kind: BenefitKind;
  amount: number;
  label: string;
  verified: boolean;
};

export type ScoreWeights = {
  price: number;
  campaign: number;
  reward: number;
  installment: number;
  preference: number;
  merchantReliability: number;
  dataConfidence: number;
  risk: number;
};

export type DecisionInput = {
  price: number | null;
  shippingCost?: number;
  installmentCost?: number;
  benefits: MonetaryBenefit[];
  installmentCount?: number | null;
  campaignMatch?: number;
  preferenceMatch?: number;
  merchantReliability?: number;
  dataConfidence?: number;
  risk?: number;
};

export const DEFAULT_SCORE_WEIGHTS: Readonly<ScoreWeights> = Object.freeze({
  price: 30,
  campaign: 25,
  reward: 15,
  installment: 10,
  preference: 10,
  merchantReliability: 5,
  dataConfidence: 5,
  risk: 10,
});

function ratio(value: number | undefined) {
  return Math.min(1, Math.max(0, value ?? 0));
}

export function validateWeights(weights: ScoreWeights) {
  const positive = weights.price + weights.campaign + weights.reward + weights.installment + weights.preference + weights.merchantReliability + weights.dataConfidence;
  if (positive !== 100) throw new Error("Pozitif skor ağırlıkları toplamı 100 olmalıdır.");
  if (Object.values(weights).some((weight) => !Number.isFinite(weight) || weight < 0)) throw new Error("Skor ağırlıkları negatif veya geçersiz olamaz.");
  return weights;
}

export function calculateDecision(input: DecisionInput, weights: ScoreWeights = { ...DEFAULT_SCORE_WEIGHTS }) {
  validateWeights(weights);
  const verified = input.benefits.filter((benefit) => benefit.verified && benefit.amount > 0);
  const directDiscount = verified.filter((benefit) => benefit.kind === "DIRECT_DISCOUNT" || benefit.kind === "SHIPPING").reduce((sum, benefit) => sum + benefit.amount, 0);
  const cashback = verified.filter((benefit) => benefit.kind === "CASHBACK").reduce((sum, benefit) => sum + benefit.amount, 0);
  const rewardValue = verified.filter((benefit) => benefit.kind === "REWARD_POINTS").reduce((sum, benefit) => sum + benefit.amount, 0);
  const validPrice = input.price !== null && Number.isFinite(input.price) && input.price >= 0;
  const effectiveCashCost = validPrice ? Math.max(0, input.price! + (input.shippingCost ?? 0) + (input.installmentCost ?? 0) - directDiscount - cashback) : null;
  const effectiveValueCost = effectiveCashCost === null ? null : Math.max(0, effectiveCashCost - rewardValue);
  const totalBenefitRatio = validPrice && input.price! > 0 ? ratio((directDiscount + cashback + rewardValue) / input.price!) : 0;
  const components = {
    price: totalBenefitRatio * weights.price,
    campaign: ratio(input.campaignMatch) * weights.campaign,
    reward: ratio(validPrice && input.price! > 0 ? rewardValue / input.price! : 0) * weights.reward,
    installment: ratio((input.installmentCount ?? 0) / 12) * weights.installment,
    preference: ratio(input.preferenceMatch) * weights.preference,
    merchantReliability: ratio(input.merchantReliability) * weights.merchantReliability,
    dataConfidence: ratio(input.dataConfidence) * weights.dataConfidence,
    riskPenalty: ratio(input.risk) * weights.risk,
  };
  const positiveScore = components.price + components.campaign + components.reward + components.installment + components.preference + components.merchantReliability + components.dataConfidence;
  const score = Math.round(Math.min(100, Math.max(0, positiveScore - components.riskPenalty)));
  return {
    score,
    components,
    price: input.price,
    effectiveCashCost,
    effectiveValueCost,
    directDiscount,
    cashback,
    rewardValue,
    totalVerifiedBenefit: directDiscount + cashback + rewardValue,
    unverifiedBenefits: input.benefits.filter((benefit) => !benefit.verified),
  };
}
