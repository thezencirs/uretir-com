export type CampaignRuleView = {
  id: string;
  kind:
    | "MIN_SPEND"
    | "MAX_SPEND"
    | "REWARD_AMOUNT"
    | "MAX_REWARD"
    | "REQUIRED_PURCHASE_COUNT"
    | "REQUIRED_CHANNEL"
    | "REQUIRED_ENROLLMENT"
    | "REQUIRED_PAYMENT_METHOD"
    | "ELIGIBILITY"
    | "EXCLUSION"
    | "OTHER";
  operator: "EQ" | "GTE" | "LTE" | "CONTAINS" | "EXCLUDES" | "INFO";
  numericValue: number | null;
  textValue: string | null;
  unit: string | null;
  description: string;
  priority: number;
};

export type InstallmentView = {
  id: string;
  count: number;
  feeFree: boolean;
  productScope: string | null;
  notes: string | null;
};

export type CampaignTierView = {
  id: string;
  minimumSpend: number;
  maximumSpend: number | null;
  rewardAmount: number;
  description: string;
  priority: number;
};

export type CampaignSourceView = {
  id: string;
  url: string;
  title: string;
  publisher: string;
  fetchedAt: string;
  fingerprint: string;
};

export type CampaignVerificationView = {
  officialSourceId: string;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "STALE" | "SOURCE_UNAVAILABLE" | "CONFLICT";
  checkedAt: string;
  nextCheckAt: string;
  checker: string;
  summary: string;
  fingerprint: string;
};

export type CampaignView = {
  id: string;
  slug: string;
  title: string;
  description: string;
  benefitSummary: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "PENDING_VERIFICATION" | "VERIFIED" | "ACTIVE" | "UPCOMING" | "EXPIRED" | "SUSPENDED" | "UNVERIFIED" | "SOURCE_UNAVAILABLE" | "REJECTED";
  published: boolean;
  updatedAt: string;
  bank: {
    id: string;
    slug: string;
    name: string;
    officialName: string;
    shortName: string;
    websiteUrl: string;
    color: string;
    status: "ACTIVE" | "INACTIVE";
  };
  merchant: {
    id: string;
    slug: string;
    name: string;
    aliases: string[];
    status: "ACTIVE" | "INACTIVE";
  } | null;
  category: {
    id: string;
    slug: string;
    name: string;
    aliases: string[];
    status: "ACTIVE" | "INACTIVE";
  };
  rewardType: {
    id: string;
    slug: string;
    name: string;
    kind: "POINTS" | "CASHBACK" | "MILES" | "DISCOUNT" | "OTHER";
    unit: string;
    status: "ACTIVE" | "INACTIVE";
  } | null;
  cards: Array<{
    id: string;
    slug: string;
    name: string;
    network: "VISA" | "MASTERCARD" | "TROY" | "AMEX" | "OTHER";
    rewardProgram: string | null;
    active: boolean;
  }>;
  rules: CampaignRuleView[];
  tiers: CampaignTierView[];
  installments: InstallmentView[];
  sources: CampaignSourceView[];
  verification: CampaignVerificationView | null;
};

export type CampaignMatch = CampaignView & {
  score: number;
  matchReasons: string[];
  decision: {
    score: number;
    price: number | null;
    effectiveCashCost: number | null;
    effectiveValueCost: number | null;
    directDiscount: number;
    cashback: number;
    rewardValue: number;
    totalVerifiedBenefit: number;
  };
};

export type SearchIntent = {
  raw: string;
  normalized: string;
  expanded: string;
  amount: number | null;
  installmentCount: number | null;
  wantsInstallment: boolean;
  wantsReward: boolean;
  wantsHighestReward: boolean;
  date: Date;
  dateValid: boolean;
};

export type ChatEvent =
  | { type: "meta"; conversationId: string; campaigns: CampaignMatch[] }
  | { type: "delta"; delta: string }
  | { type: "done"; conversationId: string }
  | { type: "error"; message: string };

export const UNVERIFIED_RESPONSE = "Güncel kampanya bilgisini doğrulayamadım. Bu nedenle kesin bir avantaj rakamı vermiyorum.";
