import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOOL_THEMES: Record<
  string,
  {
    name: string;
    tag: string;
    accent: string;
    bgStart: string;
    bgEnd: string;
    icon: string;
    photos: string[];
  }
> = {
  "haber-ai": {
    name: "HaberAI",
    tag: "81 İL KAYNAKLI GÜNDEM RADARI",
    accent: "#a8e038",
    bgStart: "#0f2017",
    bgEnd: "#070f0b",
    icon: "◉",
    photos: [
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=900&q=82",
    ],
  },
  "finans-ai": {
    name: "FinansAI",
    tag: "CANLI PİYASA & EKONOMİ EKRANI",
    accent: "#4fd1c5",
    bgStart: "#0d2224",
    bgEnd: "#061012",
    icon: "📈",
    photos: [
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=900&q=82",
    ],
  },
  "puan-ai": {
    name: "PuanAI",
    tag: "DOĞRULANMIŞ KART KAMPANYA ASİSTANI",
    accent: "#b794f4",
    bgStart: "#1a142b",
    bgEnd: "#0b0814",
    icon: "✦",
    photos: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=82",
    ],
  },
  "indirim-ai": {
    name: "İndirimAI",
    tag: "30 / 90 / 360 GÜN DİP FİYAT RADARI",
    accent: "#f6ad55",
    bgStart: "#26170c",
    bgEnd: "#110a04",
    icon: "🏷️",
    photos: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=82",
    ],
  },
  "araba-ai": {
    name: "ArabaAI",
    tag: "SIFIR & 2. EL OTOMOBİL FİYAT REFERANSI",
    accent: "#63b3ed",
    bgStart: "#0d1b2a",
    bgEnd: "#060d15",
    icon: "🚗",
    photos: [
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=82",
    ],
  },
  "ev-ai": {
    name: "EvAI",
    tag: "KONUT, ARSA & KAMU İHALE ANALİZİ",
    accent: "#f687b3",
    bgStart: "#25131d",
    bgEnd: "#11080d",
    icon: "🏠",
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=82",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=82",
    ],
  },
};

function escapeXml(input: string): string {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text: string, maxCharsPerLine: number, maxLines: number): string[] {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word.slice(0, maxCharsPerLine);
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  return lines.length ? lines : ["Üretir AI Doğrulanmış Kayıt"];
}

function selectPhotoUrl(toolKey: string, title: string, explicitImage: string | null): string {
  if (explicitImage && /^https:\/\//i.test(explicitImage)) {
    return explicitImage;
  }
  const theme = TOOL_THEMES[toolKey] || TOOL_THEMES["indirim-ai"];
  const lower = title.toLocaleLowerCase("tr-TR");
  if (toolKey === "ev-ai") {
    if (lower.includes("arsa") || lower.includes("tarla") || lower.includes("parsel")) {
      return theme.photos[4];
    }
    if (lower.includes("dubleks") || lower.includes("villa") || lower.includes("müstakil")) {
      return theme.photos[3];
    }
  }
  if (toolKey === "araba-ai") {
    if (lower.includes("byd") || lower.includes("seal") || lower.includes("elektrik") || lower.includes("togg")) {
      return theme.photos[0];
    }
    if (lower.includes("suv") || lower.includes("qashqai") || lower.includes("duster") || lower.includes("tiguan") || lower.includes("rifter")) {
      return theme.photos[1];
    }
  }
  const hash = createHash("sha256").update(`${toolKey}:${title}`).digest()[0];
  return theme.photos[hash % theme.photos.length];
}

async function fetchAndPreparePhotoDataUri(photoUrl: string): Promise<string | null> {
  try {
    const res = await fetch(photoUrl, {
      signal: AbortSignal.timeout(8_000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UretirVisualCardBot/2.0; +https://www.uretir.com)",
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const rawBuffer = Buffer.from(await res.arrayBuffer());
    const resized = await sharp(rawBuffer)
      .resize(410, 440, { fit: "cover", position: "center" })
      .jpeg({ quality: 84 })
      .toBuffer();
    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const toolKey = sp.get("tool") || "indirim-ai";
  const theme = TOOL_THEMES[toolKey] || TOOL_THEMES["indirim-ai"];
  const title = sp.get("title") || `${theme.name} Güncel Analiz`;
  const subtitle = sp.get("subtitle") || "Doğrulanmış kaynak verisi · uretir.com";
  const price = sp.get("price") || "";
  const badge = sp.get("badge") || theme.tag;
  const meta = sp.get("meta") || "Canlı Veri · Türkiye Üretir, Gençler Yetişir";
  const stat1Label = sp.get("s1l") || "Kaynak";
  const stat1Val = sp.get("s1v") || "Doğrulandı";
  const stat2Label = sp.get("s2l") || "Analiz / Referans";
  const stat2Val = sp.get("s2v") || "uretir.com";
  const explicitImg = sp.get("image") || sp.get("img") || null;
  const wantPng = sp.get("format") === "png";

  const targetPhotoUrl = selectPhotoUrl(toolKey, `${title} ${subtitle}`, explicitImg);
  let photoDataUri = await fetchAndPreparePhotoDataUri(targetPhotoUrl);
  if (!photoDataUri && explicitImg) {
    const fallbackUrl = selectPhotoUrl(toolKey, `${title} ${subtitle}`, null);
    photoDataUri = await fetchAndPreparePhotoDataUri(fallbackUrl);
  }

  const titleLines = wrapLines(title, 25, 3);
  const subLines = wrapLines(subtitle, 40, 2);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgStart}" />
      <stop offset="100%" stop-color="${theme.bgEnd}" />
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="25%" r="65%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.28" />
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.10" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03" />
    </linearGradient>
    <clipPath id="photoClip">
      <rect x="738" y="118" width="410" height="440" rx="24" />
    </clipPath>
    <linearGradient id="photoOverlay" x1="0%" y1="40%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.78" />
    </linearGradient>
  </defs>

  <rect width="1200" height="675" fill="url(#bg)" />
  <rect width="1200" height="675" fill="url(#glow)" />

  <!-- Decorative Grid Lines -->
  <g stroke="#ffffff" stroke-opacity="0.06" stroke-width="1">
    <line x1="52" y1="0" x2="52" y2="675" />
    <line x1="1148" y1="0" x2="1148" y2="675" />
    <line x1="0" y1="100" x2="1200" y2="100" />
    <line x1="0" y1="585" x2="1200" y2="585" />
  </g>

  <!-- Top Header -->
  <rect x="52" y="30" width="210" height="48" rx="24" fill="${theme.accent}" fill-opacity="0.18" stroke="${theme.accent}" stroke-opacity="0.55" />
  <text x="84" y="61" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="22" font-weight="800">${escapeXml(theme.name)}</text>

  <text x="284" y="60" fill="#e5e7eb" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="1.6">${escapeXml(badge.slice(0, 46).toUpperCase())}</text>

  <text x="1148" y="62" text-anchor="end" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="30" font-weight="900">üretir<tspan fill="${theme.accent}">.</tspan></text>

  <!-- Left Column: Main Title -->
  ${titleLines
    .map(
      (line, idx) =>
        `<text x="52" y="${168 + idx * 54}" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="42" font-weight="800">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <!-- Left Column: Subtitle -->
  ${subLines
    .map(
      (line, idx) =>
        `<text x="52" y="${342 + idx * 32}" fill="#cbd5e1" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="22" font-weight="500">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <!-- Left Column: Price & Metrics Dashboard -->
  <rect x="52" y="418" width="656" height="140" rx="20" fill="url(#cardGrad)" stroke="#ffffff" stroke-opacity="0.16" />
  ${
    price
      ? `<rect x="72" y="438" width="290" height="54" rx="12" fill="${theme.accent}" />
  <text x="217" y="474" text-anchor="middle" fill="#07100c" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="26" font-weight="900">${escapeXml(price.slice(0, 22))}</text>
  <text x="384" y="458" fill="#94a3b8" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="14" font-weight="700">${escapeXml(stat1Label.toUpperCase())}</text>
  <text x="384" y="484" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="20" font-weight="800">${escapeXml(stat1Val.slice(0, 24))}</text>
  <line x1="72" y1="506" x2="688" y2="506" stroke="#ffffff" stroke-opacity="0.10" />
  <text x="72" y="536" fill="#94a3b8" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">${escapeXml(stat2Label.toUpperCase())}:</text>
  <text x="260" y="536" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="19" font-weight="800">${escapeXml(stat2Val.slice(0, 34))}</text>`
      : `<text x="76" y="464" fill="#94a3b8" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">${escapeXml(stat1Label.toUpperCase())}</text>
  <text x="76" y="494" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="22" font-weight="800">${escapeXml(stat1Val.slice(0, 38))}</text>
  <line x1="76" y1="510" x2="688" y2="510" stroke="#ffffff" stroke-opacity="0.10" />
  <text x="76" y="538" fill="#94a3b8" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">${escapeXml(stat2Label.toUpperCase())}:</text>
  <text x="260" y="538" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="20" font-weight="800">${escapeXml(stat2Val.slice(0, 34))}</text>`
  }

  <!-- Right Column: Real Listing / Category Photograph Card -->
  <rect x="734" y="114" width="418" height="448" rx="26" fill="#0f172a" stroke="${theme.accent}" stroke-opacity="0.55" stroke-width="2" />
  ${
    photoDataUri
      ? `<image href="${photoDataUri}" x="738" y="118" width="410" height="440" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)" />
  <rect x="738" y="118" width="410" height="440" rx="24" fill="url(#photoOverlay)" />`
      : `<rect x="738" y="118" width="410" height="440" rx="24" fill="url(#cardGrad)" />`
  }
  <rect x="758" y="138" width="186" height="34" rx="17" fill="#090d16" fill-opacity="0.82" stroke="${theme.accent}" stroke-opacity="0.6" />
  <text x="851" y="160" text-anchor="middle" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="13" font-weight="800">DOĞRULANMIŞ GÖRSEL</text>

  <text x="762" y="512" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="20" font-weight="800">${escapeXml(theme.name)} · Canlı Veri Kartı</text>
  <text x="762" y="538" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="15" font-weight="700">www.uretir.com/${escapeXml(toolKey)}</text>

  <!-- Footer -->
  <circle cx="66" cy="630" r="6" fill="${theme.accent}" />
  <text x="84" y="637" fill="#d1d5db" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="19" font-weight="600">${escapeXml(meta.slice(0, 68))}</text>
  <text x="1148" y="637" text-anchor="end" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, Arial, sans-serif" font-size="19" font-weight="800">uretir.com/${escapeXml(toolKey)} · @uretirai</text>
</svg>`;

  if (wantPng) {
    try {
      const pngBuffer = await sharp(Buffer.from(svg)).png({ compressionLevel: 6 }).toBuffer();
      return new NextResponse(new Uint8Array(pngBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    } catch {
      // fallback to svg if sharp fails
    }
  }

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
