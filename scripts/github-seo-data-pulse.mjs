import fs from "node:fs/promises";

const SITE_URL = (process.env.SITE_URL || "https://www.uretir.com").replace(/\/$/, "");

const API_ENDPOINTS = [
  { name: "HaberAI · 81 İl Canlı Gündem API", path: "/api/haber-ai" },
  { name: "FinansAI · Canlı Piyasa & Döviz API", path: "/api/haber-ai?view=finance" },
  { name: "WhatsApp Feed · HaberAI", path: "/api/channel-feed/haber-ai" },
  { name: "WhatsApp Feed · FinansAI", path: "/api/channel-feed/finans-ai" },
  { name: "WhatsApp Feed · İndirimAI", path: "/api/channel-feed/indirim-ai" },
  { name: "WhatsApp Feed · PuanAI", path: "/api/channel-feed/puan-ai" },
  { name: "WhatsApp Feed · ArabaAI", path: "/api/channel-feed/araba-ai" },
  { name: "WhatsApp Feed · EvAI", path: "/api/channel-feed/ev-ai" },
  { name: "Web Sayfası · HaberAI (81 İl Haritası)", path: "/haber-ai" },
  { name: "Web Sayfası · İndirimAI (Dip Fiyat)", path: "/indirim-ai" },
  { name: "Web Sayfası · FinansAI (Canlı Piyasa)", path: "/finans-ai" },
  { name: "Web Sayfası · PuanAI (Kart Kampanya)", path: "/puan-ai" },
  { name: "Web Sayfası · ArabaAI (Sıfır & 2. El)", path: "/araba-ai" },
  { name: "Web Sayfası · EvAI (Konut & İhale)", path: "/ev-ai" },
];

const SEO_ENDPOINTS = [
  "/sitemap.xml",
  "/robots.txt",
  "/",
  "/haber-ai?city=34",
  "/haber-ai?city=06",
  "/haber-ai?city=35",
  "/haber-ai?city=16",
  "/haber-ai?city=07",
  "/haber-ai?city=01",
  "/haber-ai?city=42",
  "/haber-ai?city=27",
  "/haber-ai?city=61",
  "/haber-ai?city=25",
  "/haber-ai?city=21",
  "/haber-ai?city=55",
];

async function checkEndpoint(url) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Uretir-GitHub-Actions-Pulse/2.0 (+https://www.uretir.com)",
        "Cache-Control": "no-cache",
      },
      signal: AbortSignal.timeout(25_000),
    });
    const elapsedMs = Date.now() - started;
    const text = await res.text();
    return { ok: res.ok, status: res.status, elapsedMs, bytes: text.length, text };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      elapsedMs: Date.now() - started,
      bytes: 0,
      error: err?.message || String(err),
    };
  }
}

async function main() {
  console.log(`[Üretir GitHub Actions Veri & SEO Nabzı] ${SITE_URL} taranıyor...`);
  const apiResults = [];
  for (const ep of API_ENDPOINTS) {
    const url = `${SITE_URL}${ep.path}`;
    const r = await checkEndpoint(url);
    apiResults.push({ ...ep, url, ...r });
    console.log(`${r.ok ? "✅" : "⚠️"} ${ep.name} (${ep.path}) -> HTTP ${r.status} (${r.elapsedMs}ms, ${r.bytes}B)`);
  }

  const seoResults = [];
  let sitemapUrlCount = 0;
  for (const p of SEO_ENDPOINTS) {
    const url = `${SITE_URL}${p}`;
    const r = await checkEndpoint(url);
    if (p === "/sitemap.xml" && r.text) {
      sitemapUrlCount = (r.text.match(/<loc>/g) || []).length;
    }
    seoResults.push({ path: p, url, ok: r.ok, status: r.status, elapsedMs: r.elapsedMs, bytes: r.bytes });
  }

  console.log(`🗺️ Sitemap.xml toplam indekslenen URL sayısı: ${sitemapUrlCount}`);

  const report = {
    checkedAt: new Date().toISOString(),
    siteUrl: SITE_URL,
    sitemapUrlCount,
    apiSuccessCount: apiResults.filter((x) => x.ok).length,
    apiTotalCount: apiResults.length,
    seoSuccessCount: seoResults.filter((x) => x.ok).length,
    seoTotalCount: seoResults.length,
    apiResults: apiResults.map(({ text, ...rest }) => rest),
    seoResults,
  };

  await fs.mkdir("reports/seo-pulse", { recursive: true });
  await fs.writeFile("reports/seo-pulse/latest-pulse.json", JSON.stringify(report, null, 2), "utf8");

  if (process.env.GITHUB_STEP_SUMMARY) {
    const md = [
      `## 🌐 Üretir (\`uretir.com\`) Canlı Veri, 81 İl Harita & Google SEO Nabzı`,
      `- **Kontrol Zamanı (TSİ):** ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
      `- **Canlı Veri & Kanal API Sağlığı:** **${report.apiSuccessCount} / ${report.apiTotalCount}** aktif`,
      `- **SEO & 81 İl Harita Rotaları:** **${report.seoSuccessCount} / ${report.seoTotalCount}** aktif`,
      `- **Google Sitemap (\`/sitemap.xml\`) Kayıtlı URL:** **${sitemapUrlCount}** (81 İl + 6 AI Aracı + Kurumsal Sayfalar)`,
      ``,
      `### 📊 6 AI Aracı & 6 WhatsApp Kanal Beslemesi Durumu`,
      `| Servis / Kanal | Endpoint | Durum | Yanıt Süresi | Boyut |`,
      `| :--- | :--- | :--- | :--- | :--- |`,
      ...apiResults.map(
        (r) =>
          `| **${r.name}** | \`${r.path}\` | ${r.ok ? "✅ HTTP " + r.status : "⚠️ HTTP " + r.status} | ${r.elapsedMs} ms | ${r.bytes} B |`
      ),
      ``,
    ].join("\n");
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, md + "\n", "utf8");
  }
}

main().catch((err) => {
  console.error("SEO & Data Pulse hatası:", err);
  process.exitCode = 1;
});
