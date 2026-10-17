import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOOL_THEMES: Record<
  string,
  { name: string; tag: string; accent: string; bgStart: string; bgEnd: string; icon: string }
> = {
  "haber-ai": {
    name: "HaberAI",
    tag: "81 İL KAYNAKLI GÜNDEM RADARI",
    accent: "#a8e038",
    bgStart: "#112218",
    bgEnd: "#0a130e",
    icon: "◉",
  },
  "finans-ai": {
    name: "FinansAI",
    tag: "CANLI PİYASA & EKONOMİ EKRANI",
    accent: "#4fd1c5",
    bgStart: "#0f2425",
    bgEnd: "#081314",
    icon: "📈",
  },
  "puan-ai": {
    name: "PuanAI",
    tag: "DOĞRULANMIŞ KART KAMPANYA ASİSTANI",
    accent: "#b794f4",
    bgStart: "#1c162e",
    bgEnd: "#0e0b18",
    icon: "✦",
  },
  "indirim-ai": {
    name: "İndirimAI",
    tag: "30 / 90 / 360 GÜN FİYAT GEÇMİŞİ ANALİZİ",
    accent: "#f6ad55",
    bgStart: "#2a1a0e",
    bgEnd: "#140c06",
    icon: "🏷️",
  },
  "araba-ai": {
    name: "ArabaAI",
    tag: "SIFIR & 2. EL OTOMOBİL FİYAT REFERANSI",
    accent: "#63b3ed",
    bgStart: "#0f1e2e",
    bgEnd: "#081018",
    icon: "🚗",
  },
  "ev-ai": {
    name: "EvAI",
    tag: "KONUT, ARSA & KAMU İHALE ANALİZİ",
    accent: "#f687b3",
    bgStart: "#281520",
    bgEnd: "#140a10",
    icon: "🏠",
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
  const stat2Label = sp.get("s2l") || "Platform";
  const stat2Val = sp.get("s2v") || "uretir.com";

  const titleLines = wrapLines(title, 34, 3);
  const subLines = wrapLines(subtitle, 54, 2);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgStart}" />
      <stop offset="100%" stop-color="${theme.bgEnd}" />
    </linearGradient>
    <radialGradient id="glow" cx="85%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.24" />
      <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
    </linearGradient>
  </defs>

  <rect width="1200" height="675" fill="url(#bg)" />
  <rect width="1200" height="675" fill="url(#glow)" />

  <!-- Decorative Grid Lines -->
  <g stroke="#ffffff" stroke-opacity="0.05" stroke-width="1">
    <line x1="64" y1="0" x2="64" y2="675" />
    <line x1="1136" y1="0" x2="1136" y2="675" />
    <line x1="0" y1="110" x2="1200" y2="110" />
    <line x1="0" y1="565" x2="1200" y2="565" />
  </g>

  <!-- Top Header -->
  <rect x="64" y="36" width="210" height="48" rx="24" fill="${theme.accent}" fill-opacity="0.16" stroke="${theme.accent}" stroke-opacity="0.45" />
  <text x="92" y="67" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="22" font-weight="800">${escapeXml(theme.name)}</text>

  <text x="300" y="66" fill="#d1d5db" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="17" font-weight="700" letter-spacing="1.8">${escapeXml(badge.slice(0, 48).toUpperCase())}</text>

  <text x="1136" y="68" text-anchor="end" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="30" font-weight="900">üretir<tspan fill="${theme.accent}">.</tspan></text>

  <!-- Main Title -->
  ${titleLines
    .map(
      (line, idx) =>
        `<text x="64" y="${185 + idx * 62}" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="48" font-weight="800">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <!-- Subtitle -->
  ${subLines
    .map(
      (line, idx) =>
        `<text x="64" y="${385 + idx * 34}" fill="#9ca3af" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="24" font-weight="500">${escapeXml(line)}</text>`
    )
    .join("\n  ")}

  <!-- Price / Metric Highlight Box -->
  <rect x="64" y="450" width="1072" height="92" rx="18" fill="url(#cardGrad)" stroke="#ffffff" stroke-opacity="0.12" />
  ${
    price
      ? `<rect x="82" y="466" width="340" height="60" rx="12" fill="${theme.accent}" />
  <text x="252" y="506" text-anchor="middle" fill="#0b130e" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="30" font-weight="900">${escapeXml(price.slice(0, 22))}</text>
  <text x="450" y="492" fill="#9ca3af" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="16" font-weight="600">${escapeXml(stat1Label.toUpperCase())}</text>
  <text x="450" y="518" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="22" font-weight="700">${escapeXml(stat1Val.slice(0, 26))}</text>
  <text x="800" y="492" fill="#9ca3af" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="16" font-weight="600">${escapeXml(stat2Label.toUpperCase())}</text>
  <text x="800" y="518" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="22" font-weight="700">${escapeXml(stat2Val.slice(0, 26))}</text>`
      : `<text x="96" y="492" fill="#9ca3af" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="16" font-weight="600">${escapeXml(stat1Label.toUpperCase())}</text>
  <text x="96" y="518" fill="#ffffff" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="23" font-weight="700">${escapeXml(stat1Val.slice(0, 42))}</text>
  <text x="680" y="492" fill="#9ca3af" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="16" font-weight="600">${escapeXml(stat2Label.toUpperCase())}</text>
  <text x="680" y="518" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="23" font-weight="700">${escapeXml(stat2Val.slice(0, 32))}</text>`
  }

  <!-- Footer -->
  <circle cx="76" cy="616" r="6" fill="${theme.accent}" />
  <text x="94" y="623" fill="#d1d5db" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="20" font-weight="600">${escapeXml(meta.slice(0, 68))}</text>
  <text x="1136" y="623" text-anchor="end" fill="${theme.accent}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="20" font-weight="800">uretir.com/${escapeXml(toolKey)} · @uretirai</text>
</svg>`;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
