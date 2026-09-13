import { NextResponse } from "next/server";
import sharp from "sharp";
import { newsPool } from "@/lib/haber-ai/store";
import provinces from "@/lib/haber-ai/provinces.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{64}$/.test(id)) return new NextResponse("Geçersiz haber", { status: 400 });
  const pool = newsPool();
  try {
    const result = await pool.query<{ payload: { title: string; source: string; publishedAt: string; provinceCodes?: string[] } }>(
      "SELECT payload FROM haber_articles WHERE id=$1 AND COALESCE(payload->>'hidden','false') <> 'true' LIMIT 1", [id]
    );
    const article = result.rows[0]?.payload;
    if (!article) return new NextResponse("Haber bulunamadı", { status: 404 });
    const cities = (article.provinceCodes ?? []).map(code => provinces.find(p => p.code === code)?.name).filter(Boolean).slice(0, 3).join(" · ") || "Türkiye";
    const lines: string[] = [];
    for (const word of article.title.slice(0, 240).split(/\s+/)) {
      const last = lines.length - 1;
      if (last < 0 || (lines[last] + " " + word).length > 43) lines.push(word);
      else lines[last] += " " + word;
    }
    const title = lines.slice(0, 5).map((line, i) => `<tspan x="76" dy="${i ? 48 : 0}">${esc(line)}</tspan>`).join("");
    const date = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: "Europe/Istanbul" }).format(new Date(article.publishedAt));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#101a14"/><stop offset="1" stop-color="#253d2c"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><circle cx="1030" cy="110" r="180" fill="#b9f24a" opacity=".12"/><circle cx="1110" cy="550" r="260" fill="#b9f24a" opacity=".08"/><text x="76" y="88" fill="#b9f24a" font-family="Arial,sans-serif" font-size="28" font-weight="700">üretir.</text><text x="76" y="142" fill="#d9e6d8" font-family="Arial,sans-serif" font-size="22">HaberAI · Türkiye gündemi</text><rect x="76" y="184" width="360" height="48" rx="24" fill="#b9f24a"/><text x="100" y="216" fill="#101a14" font-family="Arial,sans-serif" font-size="20" font-weight="700">${esc(cities)}</text><text x="76" y="316" fill="white" font-family="Arial,sans-serif" font-size="38" font-weight="700">${title}</text><text x="76" y="548" fill="#b5c5b7" font-family="Arial,sans-serif" font-size="20">${esc(article.source)} · ${esc(date)}</text><text x="1120" y="574" text-anchor="end" fill="#b9f24a" font-family="Arial,sans-serif" font-size="22">Türkiye Üretir, Gençler Yetişir</text></svg>`;
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    return new NextResponse(new Uint8Array(png), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=300" } });
  } finally { await pool.end(); }
}
