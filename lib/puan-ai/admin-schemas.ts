import { z } from "zod";

const slug = z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const id = z.string().uuid();
const color = z.string().regex(/^#[0-9a-f]{6}$/i);
const url = z.string().url().max(2_000);
const dateInput = z.coerce.date();
const optionalId = z.union([id, z.literal(""), z.null()]).transform((value) => value || null);
const optionalText = z.union([z.string().max(2_000), z.null()]).optional();
const optionalNumber = z.union([z.coerce.number(), z.literal(""), z.null()]).transform((value) => value === "" ? null : value);

export const adminResourceSchema = z.enum([
  "banks",
  "cards",
  "categories",
  "merchants",
  "reward-types",
  "campaigns",
  "rules",
  "installments",
  "verifications",
  "scoring",
]);

export type AdminResource = z.infer<typeof adminResourceSchema>;

export const createSchemas: Record<AdminResource, z.ZodType> = {
  banks: z.object({
    slug,
    name: z.string().trim().min(2).max(120),
    officialName: z.string().trim().min(2).max(180),
    shortName: z.string().trim().min(1).max(8),
    websiteUrl: url,
    color,
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  }),
  cards: z.object({
    bankId: id,
    slug,
    name: z.string().trim().min(2).max(140),
    network: z.enum(["VISA", "MASTERCARD", "TROY", "AMEX", "OTHER"]),
    rewardProgram: optionalText,
    annualFee: optionalNumber,
    currency: z.string().trim().length(3).default("TRY"),
    active: z.coerce.boolean().default(true),
  }),
  categories: z.object({
    parentId: optionalId,
    slug,
    name: z.string().trim().min(2).max(120),
    aliases: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  }),
  merchants: z.object({
    categoryId: id,
    slug,
    name: z.string().trim().min(2).max(140),
    aliases: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
    websiteUrl: z.union([url, z.literal(""), z.null()]).transform((value) => value || null),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  }),
  "reward-types": z.object({
    slug,
    name: z.string().trim().min(2).max(100),
    kind: z.enum(["POINTS", "CASHBACK", "MILES", "DISCOUNT", "OTHER"]),
    unit: z.string().trim().min(1).max(80),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  }),
  campaigns: z.object({
    bankId: id,
    merchantId: optionalId,
    merchantCategoryId: id,
    rewardTypeId: optionalId,
    cardIds: z.array(id).max(50).default([]),
    slug,
    title: z.string().trim().min(5).max(240),
    description: z.string().trim().min(10).max(8_000),
    benefitSummary: z.string().trim().min(5).max(500),
    startDate: dateInput,
    endDate: dateInput,
    status: z.enum(["DRAFT", "PENDING_VERIFICATION", "VERIFIED", "EXPIRED", "REJECTED"]).default("DRAFT"),
    published: z.coerce.boolean().default(false),
  }).refine((value) => value.endDate > value.startDate, { message: "Bitiş tarihi başlangıçtan sonra olmalı.", path: ["endDate"] }),
  rules: z.object({
    campaignId: id,
    kind: z.enum(["MIN_SPEND", "MAX_SPEND", "REWARD_AMOUNT", "MAX_REWARD", "REQUIRED_PURCHASE_COUNT", "REQUIRED_CHANNEL", "REQUIRED_ENROLLMENT", "REQUIRED_PAYMENT_METHOD", "ELIGIBILITY", "EXCLUSION", "OTHER"]),
    operator: z.enum(["EQ", "GTE", "LTE", "CONTAINS", "EXCLUDES", "INFO"]).default("INFO"),
    numericValue: optionalNumber,
    textValue: optionalText,
    unit: z.union([z.string().max(40), z.null()]).optional(),
    description: z.string().trim().min(5).max(2_000),
    priority: z.coerce.number().int().min(0).max(1_000).default(0),
  }),
  installments: z.object({
    campaignId: id,
    count: z.coerce.number().int().min(1).max(36),
    feeFree: z.coerce.boolean().default(true),
    productScope: optionalText,
    notes: optionalText,
  }),
  verifications: z.object({
    campaignId: id,
    url,
    title: z.string().trim().min(5).max(240),
    publisher: z.string().trim().min(2).max(160),
    evidence: z.string().trim().min(20).max(20_000),
    status: z.enum(["PENDING", "VERIFIED", "REJECTED", "STALE"]),
    checkedAt: dateInput,
    nextCheckAt: dateInput,
    checker: z.string().trim().min(2).max(120),
    summary: z.string().trim().min(10).max(4_000),
  }).refine((value) => value.nextCheckAt > value.checkedAt, { message: "Sonraki kontrol tarihi daha ileri olmalı.", path: ["nextCheckAt"] }),
  scoring: z.object({
    key: slug,
    weights: z.string().transform((value, context) => {
      try {
        const parsed = JSON.parse(value) as Record<string, number>;
        const keys = ["price", "campaign", "reward", "installment", "preference", "merchantReliability", "dataConfidence", "risk"];
        if (!keys.every((key) => Number.isFinite(parsed[key]) && parsed[key] >= 0)) throw new Error();
        if (keys.slice(0, 7).reduce((sum, key) => sum + parsed[key], 0) !== 100) throw new Error();
        return parsed;
      } catch {
        context.addIssue({ code: "custom", message: "Geçerli JSON girin; pozitif ağırlıkların toplamı 100 olmalı." });
        return z.NEVER;
      }
    }),
    active: z.coerce.boolean().default(true),
    version: z.coerce.number().int().min(1),
    updatedBy: z.string().trim().min(2).max(120),
  }),
};

export function schemaForUpdate(resource: AdminResource) {
  if (resource === "verifications") {
    return z.object({
      status: z.enum(["PENDING", "VERIFIED", "REJECTED", "STALE"]).optional(),
      checkedAt: dateInput.optional(),
      nextCheckAt: dateInput.optional(),
      checker: z.string().trim().min(2).max(120).optional(),
      summary: z.string().trim().min(10).max(4_000).optional(),
    });
  }
  return (createSchemas[resource] as z.ZodObject<z.ZodRawShape>).partial();
}
