import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type UrlVerificationResult = {
  status: "VERIFIED" | "EXPIRED" | "SOURCE_UNAVAILABLE" | "UNVERIFIED";
  sourceUrl: string;
  fetchedAt: string;
  httpStatus: number | null;
  title: string | null;
  validFrom: string | null;
  validUntil: string | null;
  fingerprint: string | null;
  evidence: SourceEvidence;
  reason: string;
};

export type SourceEvidence = {
  hostname: string | null;
  sourceKind: "OFFICIAL_BANK_CARD" | "OTHER";
  trustScore: number;
  monetaryAmounts: number[];
  installmentCounts: number[];
  cardPrograms: string[];
  participationRequired: boolean;
};

const officialDomains = new Set([
  "bankkart.com.tr", "ziraatbank.com.tr", "worldcard.com.tr", "yapikredi.com.tr",
  "bonus.com.tr", "garantibbva.com.tr", "maximum.com.tr", "isbank.com.tr",
  "axess.com.tr", "akbank.com", "paraf.com.tr", "halkbank.com.tr",
  "cardfinans.com.tr", "qnb.com.tr", "vakifbank.com.tr",
]);

function sourceIdentity(hostname: string | null): Pick<SourceEvidence, "hostname" | "sourceKind" | "trustScore"> {
  const canonical = hostname?.toLocaleLowerCase("tr-TR").replace(/^www\./, "") ?? null;
  const official = canonical ? [...officialDomains].some((domain) => canonical === domain || canonical.endsWith(`.${domain}`)) : false;
  return { hostname: canonical, sourceKind: official ? "OFFICIAL_BANK_CARD" : "OTHER", trustScore: official ? 100 : 40 };
}

const emptyEvidence = (hostname: string | null = null): SourceEvidence => ({
  ...sourceIdentity(hostname), monetaryAmounts: [], installmentCounts: [], cardPrograms: [], participationRequired: false,
});

function parseTurkishNumber(value: string) {
  const compact = value.replace(/\s/g, "");
  const normalized = compact.includes(",") ? compact.replace(/\./g, "").replace(",", ".") : compact.replace(/\./g, "");
  return Number(normalized);
}

export function extractSourceEvidence(text: string, hostname: string | null = null): SourceEvidence {
  const monetaryAmounts = [...text.matchAll(/([\d.]+(?:,\d+)?)\s*(?:TL|₺)/gi)]
    .map((match) => parseTurkishNumber(match[1]))
    .filter(Number.isFinite);
  const installmentCounts = [...text.matchAll(/(\d{1,2})\s*(?:aya\s+varan\s+|aya\s+kadar\s+|adet\s+)?taksit/gi)]
    .map((match) => Number(match[1])).filter((value) => value > 1 && value <= 36);
  const cardPrograms = ["Bankkart", "World", "Worldcard", "Paraf", "Maximum", "Bonus", "Axess", "CardFinans"]
    .filter((name) => new RegExp(`\\b${name}\\b`, "i").test(text));
  return {
    ...sourceIdentity(hostname),
    monetaryAmounts: [...new Set(monetaryAmounts)].sort((a, b) => a - b),
    installmentCounts: [...new Set(installmentCounts)].sort((a, b) => a - b),
    cardPrograms,
    participationRequired: /(kampanyaya\s+katıl|katılım\s+gerekl|işlemden\s+önce\s+katıl)/i.test(text),
  };
}

const months: Record<string, number> = { ocak: 0, subat: 1, mart: 2, nisan: 3, mayis: 4, haziran: 5, temmuz: 6, agustos: 7, eylul: 8, ekim: 9, kasim: 10, aralik: 11 };
function plain(value: string) { return value.toLocaleLowerCase("tr-TR").replaceAll("ı", "i").normalize("NFKD").replace(/\p{Diacritic}/gu, ""); }
function date(year: number, month: number, day: number, end = false) { return new Date(Date.UTC(year, month, day, end ? 20 : 0, end ? 59 : 0, end ? 59 : 0)); }
function extractDateRange(text: string): [Date | null, Date | null] {
  const numeric = text.match(/(\d{1,2})[./](\d{1,2})[./](20\d{2})\s*[-–]\s*(\d{1,2})[./](\d{1,2})[./](20\d{2})/);
  if (numeric) return [date(Number(numeric[3]), Number(numeric[2]) - 1, Number(numeric[1])), date(Number(numeric[6]), Number(numeric[5]) - 1, Number(numeric[4]), true)];
  const normalized = plain(text);
  const full = normalized.match(/(\d{1,2})\s+(ocak|subat|mart|nisan|mayis|haziran|temmuz|agustos|eylul|ekim|kasim|aralik)\s*[-–]\s*(\d{1,2})\s+(ocak|subat|mart|nisan|mayis|haziran|temmuz|agustos|eylul|ekim|kasim|aralik)\s+(20\d{2})/);
  if (full) return [date(Number(full[5]), months[full[2]], Number(full[1])), date(Number(full[5]), months[full[4]], Number(full[3]), true)];
  const sameMonth = normalized.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s+(ocak|subat|mart|nisan|mayis|haziran|temmuz|agustos|eylul|ekim|kasim|aralik)\s+(20\d{2})/);
  if (sameMonth) return [date(Number(sameMonth[4]), months[sameMonth[3]], Number(sameMonth[1])), date(Number(sameMonth[4]), months[sameMonth[3]], Number(sameMonth[2]), true)];
  return [null, null];
}

function isPrivateAddress(address: string) {
  const normalized = address.replace(/^::ffff:/, "");
  if (isIP(normalized) === 4) {
    const [a, b] = normalized.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
}

async function assertPublicHost(url: URL, resolver: typeof lookup) {
  if (url.username || url.password || url.port) throw new Error("Güvensiz kaynak adresi.");
  const addresses = await resolver(url.hostname, { all: true });
  if (addresses.length === 0 || addresses.some((entry) => isPrivateAddress(entry.address))) throw new Error("Özel ağ adreslerine erişim engellendi.");
}

export async function verifyCampaignUrl(url: string, now = new Date(), fetcher: typeof fetch = fetch, resolver: typeof lookup = lookup): Promise<UrlVerificationResult> {
  const fetchedAt = now.toISOString();
  let parsed: URL;
  try { parsed = new URL(url); } catch { return { status: "UNVERIFIED", sourceUrl: url, fetchedAt, httpStatus: null, title: null, validFrom: null, validUntil: null, fingerprint: null, evidence: emptyEvidence(), reason: "Geçerli bir URL değil." }; }
  const baseEvidence = emptyEvidence(parsed.hostname);
  if (parsed.protocol !== "https:") return { status: "UNVERIFIED", sourceUrl: url, fetchedAt, httpStatus: null, title: null, validFrom: null, validUntil: null, fingerprint: null, evidence: baseEvidence, reason: "Kaynak HTTPS kullanmıyor." };
  try {
    await assertPublicHost(parsed, resolver);
    const response = await fetcher(parsed, { redirect: "error", headers: { "User-Agent": "PuanAI-SourceVerifier/2.0" }, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return { status: "SOURCE_UNAVAILABLE", sourceUrl: url, fetchedAt, httpStatus: response.status, title: null, validFrom: null, validUntil: null, fingerprint: null, evidence: baseEvidence, reason: `Kampanya sayfası HTTP ${response.status} döndürdü.` };
    const html = (await response.text()).slice(0, 2_000_000);
    const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
    const [validFrom, validUntil] = extractDateRange(text);
    const evidence = extractSourceEvidence(text, parsed.hostname);
    if (!title || text.length < 100) return { status: "UNVERIFIED", sourceUrl: url, fetchedAt, httpStatus: response.status, title, validFrom: validFrom?.toISOString() ?? null, validUntil: validUntil?.toISOString() ?? null, fingerprint: null, evidence, reason: "Kaynakta doğrulanabilir kampanya içeriği bulunamadı." };
    const fingerprint = createHash("sha256").update(text).digest("hex");
    if (validUntil && validUntil.getTime() < now.getTime()) return { status: "EXPIRED", sourceUrl: url, fetchedAt, httpStatus: response.status, title, validFrom: validFrom?.toISOString() ?? null, validUntil: validUntil.toISOString(), fingerprint, evidence, reason: `Kampanya ${validUntil.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })} tarihinde sona ermiş.` };
    if (!validFrom || !validUntil) return { status: "UNVERIFIED", sourceUrl: url, fetchedAt, httpStatus: response.status, title, validFrom: validFrom?.toISOString() ?? null, validUntil: validUntil?.toISOString() ?? null, fingerprint, evidence, reason: "Kampanya başlangıç ve bitiş tarihleri güvenilir biçimde çıkarılamadı." };
    return { status: "VERIFIED", sourceUrl: url, fetchedAt, httpStatus: response.status, title, validFrom: validFrom.toISOString(), validUntil: validUntil.toISOString(), fingerprint, evidence, reason: "Kaynak erişilebilir; başlık ve kampanya tarihleri doğrulandı." };
  } catch {
    return { status: "SOURCE_UNAVAILABLE", sourceUrl: url, fetchedAt, httpStatus: null, title: null, validFrom: null, validUntil: null, fingerprint: null, evidence: baseEvidence, reason: "Kampanya sayfasına erişilemedi." };
  }
}
