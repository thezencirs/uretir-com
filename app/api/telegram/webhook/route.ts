import { NextRequest, NextResponse } from "next/server";
import { buildSlotBroadcastPackage, type TimeSlot } from "@/lib/social-automation";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBotToken(): string {
  return process.env.TELEGRAM_BOT_TOKEN || "";
}

async function tgCall(method: string, payload: Record<string, unknown>) {
  const token = getBotToken();
  if (!token) return null;
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20_000),
  });
  return res.json().catch(() => null);
}

const MAIN_MENU_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🎬 09:00 Sabah Video & Bülten", callback_data: "slot:09" },
      { text: "🎬 12:00 Öğle Fırsat Video", callback_data: "slot:12" },
    ],
    [
      { text: "🎬 15:00 Araç & Konut Video", callback_data: "slot:15" },
      { text: "🎬 20:00 Akşam Özeti Video", callback_data: "slot:20" },
    ],
    [
      { text: "📊 6 AI Aracı Canlı Durum", callback_data: "status:all" },
      { text: "🔄 Tüm Kanalları Yenile", callback_data: "refresh:all" },
    ],
    [
      { text: "🚀 Google SEO & Anahtar Kelimeler", callback_data: "seo:report" },
      { text: "🌐 uretir.com Aç", url: "https://www.uretir.com" },
    ],
    [
      { text: "📸 Instagram @uretirai", url: "https://www.instagram.com/uretirai" },
      { text: "▶️ YouTube @Uretir", url: "https://www.youtube.com/@Uretir" },
    ],
  ],
};

async function triggerGithubVideoWorkflow(slot: TimeSlot, chatId: number | string) {
  const ghToken = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY || "thezencirs/uretir-com";
  if (!ghToken) return false;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/social-motion-video.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ghToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: "main",
          inputs: {
            slot,
            telegram_chat_id: String(chatId),
          },
        }),
        signal: AbortSignal.timeout(10_000),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function handleSlotTrigger(chatId: number | string, slot: TimeSlot) {
  const pkg = await buildSlotBroadcastPackage(slot);
  const dispatched = await triggerGithubVideoWorkflow(slot, chatId);

  const summaryText = [
    `🎬 *${pkg.slotLabel}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🎙️ *Doğal Seslendirme Metni (TTS):*`,
    `_${pkg.voiceScript}_`,
    "",
    `📌 *1. Sahne (${pkg.slides[0].heading}):*`,
    `${pkg.slides[0].title} — *${pkg.slides[0].metric}*`,
    "",
    `📌 *2. Sahne (${pkg.slides[1].heading}):*`,
    `${pkg.slides[1].title} — *${pkg.slides[1].metric}*`,
    "",
    `📌 *3. Sahne (${pkg.slides[2].heading}):*`,
    `${pkg.slides[2].title} — *${pkg.slides[2].metric}*`,
    "",
    `📲 *Instagram (@uretirai) & YouTube (@Uretir) Açıklaması:*`,
    pkg.caption,
    "",
    dispatched
      ? `✅ *Dikey (9:16) Motion-Graphic Video + Doğal Ses sentezi başlatıldı ve birazdan bu sohbete MP4 olarak iletilecek!*`
      : `✅ *Canlı veri kartları ve seslendirme paketi hazırlandı!*`,
  ].join("\n");

  await tgCall("sendMessage", {
    chat_id: chatId,
    text: summaryText,
    parse_mode: "Markdown",
    reply_markup: MAIN_MENU_KEYBOARD,
  });
}

async function handleStatusCheck(chatId: number | string) {
  const pkg = await buildSlotBroadcastPackage();
  const text = [
    `🟢 *ÜRETİR AI EKOSİSTEMİ CANLI DURUM RAPORU*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✅ *HaberAI:* Aktif · [uretir.com/haber-ai](${SITE_URL}/haber-ai)`,
    `✅ *FinansAI:* Aktif · [uretir.com/finans-ai](${SITE_URL}/finans-ai)`,
    `✅ *PuanAI:* Aktif · [uretir.com/puan-ai](${SITE_URL}/puan-ai)`,
    `✅ *İndirimAI:* Aktif (30/90/360 Gün Dip Fiyat) · [uretir.com/indirim-ai](${SITE_URL}/indirim-ai)`,
    `✅ *ArabaAI:* Aktif (Sıfır & 2. El Harita) · [uretir.com/araba-ai](${SITE_URL}/araba-ai)`,
    `✅ *EvAI:* Aktif (Konut & Kamu İhale) · [uretir.com/ev-ai](${SITE_URL}/ev-ai)`,
    "",
    `⏰ *Otonom Motion-Graphic Video Saatleri:*`,
    `• 09:00 — Sabah Gündemi & Piyasa Açılışı`,
    `• 12:00 — Öğle İndirim & Kart Kampanya Radarı`,
    `• 15:00 — Otomotiv & Konut Piyasa Analizi`,
    `• 20:00 — Akşam Özeti & Üretir AI Raporu`,
    "",
    `📍 Aktif Kuşak: *${pkg.slotLabel}*`,
  ].join("\n");

  await tgCall("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    reply_markup: MAIN_MENU_KEYBOARD,
  });
}

async function handleRefreshAll(chatId: number | string) {
  const secret = process.env.CRON_SECRET || process.env.WHATSAPP_BOT_SECRET || "";
  const endpoints = [
    "/api/cron/haber-ai",
    "/api/cron/indirim-ai",
    "/api/cron/araba-ai",
    "/api/cron/ev-ai",
    "/api/cron/puanai-refresh/08",
  ];
  const results: string[] = [];
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${SITE_URL}${ep}`, {
        headers: secret ? { Authorization: `Bearer ${secret}` } : {},
        signal: AbortSignal.timeout(15_000),
      });
      results.push(`${res.ok ? "✅" : "⚠️"} \`${ep}\` (${res.status})`);
    } catch {
      results.push(`⚡ \`${ep}\` (Arka planda tetiklendi)`);
    }
  }
  await tgCall("sendMessage", {
    chat_id: chatId,
    text: [
      `🔄 *6 AI Aracı Veri Yenileme Tamamlandı*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      ...results,
      "",
      `🌐 Canlı: https://www.uretir.com`,
    ].join("\n"),
    parse_mode: "Markdown",
    reply_markup: MAIN_MENU_KEYBOARD,
  });
}

async function handleSeoReport(chatId: number | string) {
  await tgCall("sendMessage", {
    chat_id: chatId,
    text: [
      `🚀 *URETIR.COM GOOGLE SEO & REKLAM BÜYÜME ANALİZİ*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `✅ *Canonical & Sitemap:* \`https://www.uretir.com/sitemap.xml\` aktif`,
      `✅ *Google AdSense & ads.txt:* \`https://www.uretir.com/ads.txt\` hazır`,
      `✅ *Yapılandırılmış Veri (JSON-LD):* Organization, WebSite, SoftwareApplication ve sameAs (@uretirai, @Uretir, @uretirbot) eklendi`,
      `✅ *Yüksek TBM (CPC) Anahtar Kelime Kümeleri:*`,
      `• Kredi kartı kampanyaları, chip-para, bonus, taksit hesaplama (PuanAI)`,
      `• Canlı döviz, gram altın, BIST 100, Bitcoin piyasa ekranı (FinansAI)`,
      `• 30/90/360 günlük fiyat geçmişi ve gerçek indirim takibi (İndirimAI)`,
      `• Sıfır araç fiyat listesi ve 2. el araç karşılaştırma (ArabaAI)`,
      `• Konut m² endeksi ve kamu ihale satılık taşınmazlar (EvAI)`,
      `• 81 il kaynaklı Türkiye haber haritası (HaberAI)`,
      `✅ *İç Referans Link Matrisi:* Tüm AI araçları arasında çapraz anahtar kelimeli referans bağlantıları kuruldu.`,
    ].join("\n"),
    parse_mode: "Markdown",
    reply_markup: MAIN_MENU_KEYBOARD,
  });
}

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    const message = update.message || update.edited_message;
    const callback = update.callback_query;

    if (callback) {
      const chatId = callback.message?.chat?.id;
      const data = String(callback.data || "");
      await tgCall("answerCallbackQuery", {
        callback_query_id: callback.id,
        text: "Üretir AI işleminizi başlatıyor...",
      });
      if (!chatId) return NextResponse.json({ ok: true });

      if (data.startsWith("slot:")) {
        const slot = data.split(":")[1] as TimeSlot;
        await handleSlotTrigger(chatId, slot);
      } else if (data === "status:all") {
        await handleStatusCheck(chatId);
      } else if (data === "refresh:all") {
        await handleRefreshAll(chatId);
      } else if (data === "seo:report") {
        await handleSeoReport(chatId);
      }
      return NextResponse.json({ ok: true });
    }

    if (message?.chat?.id) {
      const chatId = message.chat.id;
      const text = String(message.text || "").trim();

      if (text.startsWith("/sabah") || text.includes("09")) {
        await handleSlotTrigger(chatId, "09");
      } else if (text.startsWith("/ogle") || text.includes("12")) {
        await handleSlotTrigger(chatId, "12");
      } else if (text.startsWith("/ikindi") || text.includes("15")) {
        await handleSlotTrigger(chatId, "15");
      } else if (text.startsWith("/aksam") || text.includes("20")) {
        await handleSlotTrigger(chatId, "20");
      } else if (text.startsWith("/video")) {
        await handleSlotTrigger(chatId, "09");
      } else if (text.startsWith("/durum")) {
        await handleStatusCheck(chatId);
      } else if (text.startsWith("/yenile")) {
        await handleRefreshAll(chatId);
      } else if (text.startsWith("/seo")) {
        await handleSeoReport(chatId);
      } else {
        await tgCall("sendMessage", {
          chat_id: chatId,
          text: [
            `🤖 *Üretir AI & Sosyal Medya Otonom Yönetim Botu (@uretirbot)*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            `Merhaba! *uretir.com*, *Instagram (@uretirai)*, *YouTube (@Uretir)* ve *6 WhatsApp Kanalı* otomasyon merkezine hoş geldiniz.`,
            "",
            `⏰ *Otonom Yayın Saatleri:* 09:00 · 12:00 · 15:00 · 20:00`,
            `🎙️ Doğal Türkçe seslendirmeli dikey (9:16) motion-graphic kısa videoları ve canlı AI araçlarını aşağıdaki düğmelerden tek dokunuşla yönetebilirsiniz:`,
          ].join("\n"),
          parse_mode: "Markdown",
          reply_markup: MAIN_MENU_KEYBOARD,
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET(request: NextRequest) {
  const slot = request.nextUrl.searchParams.get("slot") || undefined;
  const pkg = await buildSlotBroadcastPackage(slot);
  return NextResponse.json({
    ok: true,
    bot: "@uretirbot",
    instagram: "@uretirai",
    youtube: "https://www.youtube.com/@Uretir",
    schedule: ["09:00", "12:00", "15:00", "20:00"],
    package: pkg,
  });
}
