import { unstable_cache } from "next/cache";
import { getPrisma } from "@/lib/puan-ai/db";
import { defaultSiteContent } from "@/lib/site-content-defaults";
import { siteContentSchema, todayInTurkey, type NewsItem, type SiteContent } from "@/lib/site-content-model";
import { fetchSectorPulse } from "@/lib/live-ai-pulse";

export class ContentConflict extends Error {}
export class ContentUnavailable extends Error {}
const id = "main";

async function mergeLiveAiDevelopments(base: SiteContent): Promise<SiteContent> {
  try {
    const today = todayInTurkey();
    const [aiPulse, trTechPulse] = await Promise.all([
      fetchSectorPulse("yapay-zeka", 10),
      fetchSectorPulse("teknoloji-girisim", 6),
    ]);

    const liveNews: NewsItem[] = [];
    const seenIds = new Set<string>(base.news.map((n) => n.id));
    const seenTitles = new Set<string>(base.news.map((n) => n.title.toLocaleLowerCase("tr-TR")));

    for (const item of [...aiPulse, ...trTechPulse]) {
      const safeId = item.id.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 90);
      if (!safeId || seenIds.has(safeId)) continue;
      const normTitle = item.title.toLocaleLowerCase("tr-TR");
      if (seenTitles.has(normTitle)) continue;

      const pubDay = todayInTurkey(new Date(item.publishedAt));
      const publishedAt = pubDay <= today ? pubDay : today;
      const category =
        item.sector === "teknoloji-girisim"
          ? normTitle.includes("girişim") || normTitle.includes("startup") || normTitle.includes("yatırım")
            ? "startuplar"
            : "turkiye"
          : "teknoloji";

      liveNews.push({
        id: safeId,
        category,
        title: item.title.slice(0, 175),
        summary: item.summary.slice(0, 650),
        body: `${item.summary} Kaynak yayın: ${item.sourceName}. Güncel yapay zeka, otonom sistemler ve teknoloji gelişmeleri Üretir otonom haber radarı tarafından doğrulanmış kaynak bağlantısıyla indekslenmiştir.`,
        sourceName: item.sourceName.slice(0, 95),
        sourceUrl: item.sourceUrl,
        publishedAt,
        checkedAt: today,
        eventStart: null,
        eventEnd: null,
        deadline: null,
        location: item.sector === "teknoloji-girisim" ? "Türkiye" : "Türkiye / Küresel AI",
        visible: true,
      });

      seenIds.add(safeId);
      seenTitles.add(normTitle);
    }

    if (!liveNews.length) return base;

    const merged: SiteContent = {
      ...base,
      news: [...liveNews, ...base.news].slice(0, 180),
    };
    const parsed = siteContentSchema.safeParse(merged);
    return parsed.success ? parsed.data : base;
  } catch {
    return base;
  }
}

export async function readPublishedContent(): Promise<SiteContent> {
  let base: SiteContent = defaultSiteContent;
  if (process.env.DATABASE_URL) {
    try {
      const row = await getPrisma().siteContent.findUnique({ where: { id } });
      if (row) {
        base = siteContentSchema.parse(row.published);
      }
    } catch {
      base = defaultSiteContent;
    }
  }
  return mergeLiveAiDevelopments(base);
}

export const getPublishedContent = unstable_cache(readPublishedContent, ["site-content-v2"], {
  tags: ["site-content"],
  revalidate: 60,
});

export async function getEditorContent() {
  if (!process.env.DATABASE_URL) throw new ContentUnavailable("Veritabanı bağlantısı yapılandırılmamış.");
  const row = await getPrisma().siteContent.upsert({
    where: { id },
    update: {},
    create: { id, draft: defaultSiteContent, published: defaultSiteContent },
  });
  return {
    content: siteContentSchema.parse(row.draft),
    revision: row.revision,
    canRestore: row.previous !== null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

export async function saveEditorContent(input: {
  content: SiteContent;
  revision: number;
  action: "draft" | "publish" | "restore";
}) {
  if (!process.env.DATABASE_URL) throw new ContentUnavailable("Veritabanı bağlantısı yapılandırılmamış.");
  const content = siteContentSchema.parse(input.content);
  return getPrisma().$transaction(async (tx) => {
    const row = await tx.siteContent.findUnique({ where: { id } });
    if (!row || row.revision !== input.revision)
      throw new ContentConflict("Başka bir oturum değişiklik yaptı. Sayfayı yenileyip yeniden deneyin.");
    const next = input.action === "restore" ? siteContentSchema.parse(row.previous) : content;
    const publishing = input.action !== "draft";
    const result = await tx.siteContent.updateMany({
      where: { id, revision: input.revision },
      data: {
        draft: next,
        revision: { increment: 1 },
        ...(publishing
          ? { published: next, previous: siteContentSchema.parse(row.published), publishedAt: new Date() }
          : {}),
      },
    });
    if (result.count !== 1)
      throw new ContentConflict("Başka bir oturum değişiklik yaptı. Sayfayı yenileyip yeniden deneyin.");
    return { content: next, revision: input.revision + 1, canRestore: publishing || row.previous !== null };
  });
}
