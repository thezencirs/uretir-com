export const searchIntentKinds = [
  "ne",
  "kim",
  "nerede",
  "öğrenme",
  "nasıl yapılır",
  "neden",
  "karşılaştırma",
  "maliyet",
  "gereksinimler",
  "uygunluk",
  "faydalar",
  "riskler",
  "avantajlar",
  "dezavantajlar",
  "örnekler",
  "en iyi uygulamalar",
  "rehber",
  "hazırlık",
  "doğrulama",
  "sektör rehberi",
  "şirket profili",
  "şirket rehberi",
  "teknoloji rehberi",
  "yatırım rehberi",
  "üretim rehberi",
  "tedarik zinciri",
  "ihracat rehberi",
  "AI rehberi",
] as const;

export type SearchIntentKind = typeof searchIntentKinds[number];

export const searchIntentAnswerKinds = [
  "what",
  "why",
  "how",
  "who",
  "where",
  "when",
  "advantages",
  "disadvantages",
  "use_cases",
  "examples",
  "faq",
  "related_topics",
  "sources",
  "further_reading",
] as const;

export type SearchIntentAnswer = typeof searchIntentAnswerKinds[number];

export type SearchIntentProfile = {
  primary: SearchIntentKind;
  secondary: SearchIntentKind[];
  userQuestion: string;
  decisionStage: "discovery" | "evaluation" | "preparation" | "action" | "verification";
  requiredAnswers: SearchIntentAnswer[];
};

export type IntentCoverage = {
  answered: SearchIntentProfile["requiredAnswers"];
  missing: SearchIntentProfile["requiredAnswers"];
  complete: boolean;
};

const defaultRequiredAnswers: SearchIntentProfile["requiredAnswers"] = [
  "what",
  "why",
  "how",
  "who",
  "where",
  "when",
  "advantages",
  "disadvantages",
  "use_cases",
  "examples",
  "faq",
  "related_topics",
  "sources",
  "further_reading",
];

export function createSearchIntentProfile(input: Omit<SearchIntentProfile, "requiredAnswers"> & { requiredAnswers?: SearchIntentProfile["requiredAnswers"] }): SearchIntentProfile {
  return { ...input, requiredAnswers: input.requiredAnswers ?? defaultRequiredAnswers };
}

export function evaluateIntentCoverage(profile: SearchIntentProfile, available: SearchIntentProfile["requiredAnswers"]): IntentCoverage {
  const availableSet = new Set(available);
  const missing = profile.requiredAnswers.filter((answer) => !availableSet.has(answer));
  return { answered: profile.requiredAnswers.filter((answer) => availableSet.has(answer)), missing, complete: missing.length === 0 };
}
