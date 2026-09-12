import { unstable_cache } from "next/cache";
import { getPrisma } from "@/lib/puan-ai/db";
import { defaultSiteContent } from "@/lib/site-content-defaults";
import { siteContentSchema, type SiteContent } from "@/lib/site-content-model";

export class ContentConflict extends Error {}
export class ContentUnavailable extends Error {}
const id = "main";
export async function readPublishedContent(): Promise<SiteContent> {
  if (!process.env.DATABASE_URL) return defaultSiteContent;
  const row = await getPrisma().siteContent.findUnique({ where: { id } });
  return row ? siteContentSchema.parse(row.published) : defaultSiteContent;
}
export const getPublishedContent = unstable_cache(readPublishedContent, ["site-content-v1"], { tags: ["site-content"], revalidate: 60 });
export async function getEditorContent() {
  if (!process.env.DATABASE_URL) throw new ContentUnavailable("Veritabanı bağlantısı yapılandırılmamış.");
  const row = await getPrisma().siteContent.upsert({
    where: { id }, update: {},
    create: { id, draft: defaultSiteContent, published: defaultSiteContent },
  });
  return { content: siteContentSchema.parse(row.draft), revision: row.revision, canRestore: row.previous !== null, publishedAt: row.publishedAt?.toISOString() ?? null };
}
export async function saveEditorContent(input: { content: SiteContent; revision: number; action: "draft" | "publish" | "restore" }) {
  if (!process.env.DATABASE_URL) throw new ContentUnavailable("Veritabanı bağlantısı yapılandırılmamış.");
  const content = siteContentSchema.parse(input.content);
  return getPrisma().$transaction(async tx => {
    const row = await tx.siteContent.findUnique({ where: { id } });
    if (!row || row.revision !== input.revision) throw new ContentConflict("Başka bir oturum değişiklik yaptı. Sayfayı yenileyip yeniden deneyin.");
    const next = input.action === "restore" ? siteContentSchema.parse(row.previous) : content;
    const publishing = input.action !== "draft";
    const result = await tx.siteContent.updateMany({
      where: { id, revision: input.revision },
      data: {
        draft: next, revision: { increment: 1 },
        ...(publishing ? { published: next, previous: siteContentSchema.parse(row.published), publishedAt: new Date() } : {}),
      },
    });
    if (result.count !== 1) throw new ContentConflict("Başka bir oturum değişiklik yaptı. Sayfayı yenileyip yeniden deneyin.");
    return { content: next, revision: input.revision + 1, canRestore: publishing || row.previous !== null };
  });
}
