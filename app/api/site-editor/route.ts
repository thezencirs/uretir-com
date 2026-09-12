import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { z } from "zod";
import { hasSameOrigin, isAdminRequest } from "@/lib/puan-ai/admin-auth";
import { ContentConflict, ContentUnavailable, getEditorContent, saveEditorContent } from "@/lib/site-content-store";
import { siteContentSchema } from "@/lib/site-content-model";
export const runtime = "nodejs";
const schema = z.object({ content: siteContentSchema, revision: z.number().int().nonnegative(), action: z.enum(["draft", "publish", "restore"]) });
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return json({ error: "Yönetici girişi gerekli." }, 401);
  try { return json(await getEditorContent()); }
  catch { return json({ error: "Editör veritabanına bağlanamadı. Bağlantı ve kurulum kontrol edilmeli." }, 503); }
}
export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) return json({ error: "Yönetici girişi gerekli." }, 401);
  if (!hasSameOrigin(request)) return json({ error: "Geçersiz kaynak." }, 403);
  const raw = await request.text();
  if (raw.length > 2_000_000) return json({ error: "İçerik çok büyük." }, 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return json({ error: "Geçersiz içerik." }, 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: "Alanları kontrol edin: " + parsed.error.issues.slice(0, 3).map(issue => issue.path.join(".") + " — " + issue.message).join("; ") }, 400);
  try {
    const result = await saveEditorContent(parsed.data);
    if (parsed.data.action !== "draft") { revalidateTag("site-content"); revalidatePath("/", "layout"); }
    return json(result);
  } catch (error) {
    if (error instanceof ContentConflict) return json({ error: error.message }, 409);
    if (error instanceof ContentUnavailable) return json({ error: error.message }, 503);
    return json({ error: "Kaydedilemedi. Veritabanı bağlantısını kontrol edip yeniden deneyin." }, 503);
  }
}
