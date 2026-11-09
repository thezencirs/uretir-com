import { NextResponse, type NextRequest } from "next/server";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { isAdminRequest } from "@/lib/puan-ai/admin-auth";
import { getCampaignCatalog } from "@/lib/puan-ai/catalog-service";
import { loadFreeClaudeSeeds } from "@/lib/puan-ai/curated-campaigns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  if (isAdminRequest(request)) return true;
  const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const token = process.env.PUANAI_INGEST_TOKEN || process.env.CRON_SECRET || "puanai-freeclaude-local";
  return Boolean(auth && auth === token);
}

export async function GET() {
  const fccSeeds = loadFreeClaudeSeeds();
  const catalog = await getCampaignCatalog();
  return NextResponse.json(
    {
      status: "active",
      engine: "Free Claude Code (NVIDIA NIM / Nemotron-3.5-Super-120B)",
      target: "uretir.com/puan-ai",
      freeClaudeCampaignCount: fccSeeds.length,
      totalVerifiedCatalogCount: catalog.length,
      monitoredBanks: [
        "Ziraat Bankkart",
        "Garanti BBVA Bonus",
        "Yapı Kredi Worldcard",
        "İş Bankası Maximum",
        "Akbank Axess",
        "Halkbank Paraf",
        "QNB CardFinans",
        "VakıfBank World",
      ],
      campaigns: fccSeeds.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        bank: c.bank.name,
        category: c.category.name,
        benefitSummary: c.benefitSummary,
        sourceUrl: c.source.url,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  try {
    const body = await request.json();
    const incoming = Array.isArray(body?.campaigns) ? body.campaigns : [];
    if (incoming.length === 0) {
      return NextResponse.json({ error: "En az 1 doğrulanmış kampanya gerekli." }, { status: 400 });
    }
    const filePath = path.join(process.cwd(), "lib", "puan-ai", "freeclaude-campaigns.json");
    let existing: { updatedAt?: string; agent?: string; campaigns?: Array<Record<string, unknown>> } = { campaigns: [] };
    if (existsSync(filePath)) {
      try {
        existing = JSON.parse(readFileSync(filePath, "utf8"));
      } catch {
        existing = { campaigns: [] };
      }
    }
    const map = new Map<string, Record<string, unknown>>();
    for (const item of existing.campaigns ?? []) {
      if (typeof item.slug === "string") map.set(item.slug, item);
    }
    for (const item of incoming) {
      if (item && typeof item.slug === "string" && typeof item.title === "string") {
        map.set(item.slug, item);
      }
    }
    const payload = {
      updatedAt: new Date().toISOString(),
      agent: "free-claude-code/nemotron-3.5-super-vl-120b-a12b",
      campaigns: [...map.values()],
    };
    writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    return NextResponse.json({ ok: true, stored: payload.campaigns.length, updatedAt: payload.updatedAt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kampanya kaydı başarısız." },
      { status: 500 },
    );
  }
}
