import { NextResponse } from "next/server";

const MEMORY_CACHE = new Map<string, string>();

async function translateSingleText(text: string, to: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return text;
  if (/^[\d\s.,:%$€£₺+\-–—/()[\]#@!&*•·|]+$/.test(trimmed)) return text;

  const cacheKey = `${to}:${trimmed}`;
  const cached = MEMORY_CACHE.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=tr&tl=${encodeURIComponent(
      to
    )}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0]
          .map((seg: unknown) => (Array.isArray(seg) && typeof seg[0] === "string" ? seg[0] : ""))
          .join("")
          .trim();
        if (translated) {
          if (MEMORY_CACHE.size > 5000) {
            const firstKey = MEMORY_CACHE.keys().next().value;
            if (firstKey) MEMORY_CACHE.delete(firstKey);
          }
          MEMORY_CACHE.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch {
    // Fallback to original text on network error
  }

  return text;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { texts?: string[]; to?: string };
    const to = body.to === "tr" ? "tr" : "en";
    const rawTexts = Array.isArray(body.texts) ? body.texts.slice(0, 60) : [];

    if (rawTexts.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    const translations = await Promise.all(
      rawTexts.map((item) => (typeof item === "string" ? translateSingleText(item, to) : ""))
    );

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ translations: [] }, { status: 200 });
  }
}
