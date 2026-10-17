import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const siteUrl = (process.env.SITE_URL || "https://www.uretir.com").replace(/\/$/, "");

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN bulunamadı.");
  process.exit(1);
}

async function callTelegram(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function main() {
  const me = await callTelegram("getMe", {});
  console.log("Bot bilgisi:", me?.result?.username || me);

  const commands = [
    { command: "start", description: "Üretir AI & Sosyal Medya Otonom Yönetim Paneli" },
    { command: "sabah", description: "09:00 Sabah Motion-Graphic Video & Gündem Üret" },
    { command: "ogle", description: "12:00 Öğle İndirimAI & PuanAI Fırsat Videosu Üret" },
    { command: "ikindi", description: "15:00 ArabaAI & EvAI Piyasa Videosu Üret" },
    { command: "aksam", description: "20:00 Akşam Özeti & Ekonomi Videosu Üret" },
    { command: "durum", description: "6 AI Aracı (Haber, Finans, Puan, İndirim, Araba, Ev) Durumu" },
    { command: "yenile", description: "Tüm AI Veri Kaynaklarını Şimdi Yenile" },
    { command: "seo", description: "uretir.com Google SEO & Reklam Büyüme Raporu" },
  ];

  console.log("Komut menüsü kaydediliyor...");
  console.log(await callTelegram("setMyCommands", { commands }));

  console.log("Bot açıklamaları güncelleniyor...");
  await callTelegram("setMyDescription", {
    description:
      "Üretir (uretir.com) Resmi Yapay Zekâ ve Sosyal Medya Otomasyon Botu. Saat 09:00, 12:00, 15:00 ve 20:00 doğal sesli dikey motion-graphic kısa videolarını, Instagram (@uretirai), YouTube (@Uretir) ve 6 AI aracını (HaberAI, FinansAI, PuanAI, İndirimAI, ArabaAI, EvAI) buradan yönetin.",
  });
  await callTelegram("setMyShortDescription", {
    short_description: "uretir.com · @uretirai · 6 AI Aracı & 09/12/15/20:00 Motion Video Otomasyonu",
  });

  // Check if there are any recent messages in getUpdates before setting webhook so we can greet existing chat_id
  const updates = await callTelegram("getUpdates", { limit: 10 });
  const chatIds = new Set();
  for (const u of updates?.result || []) {
    const cid = u?.message?.chat?.id || u?.callback_query?.message?.chat?.id || u?.channel_post?.chat?.id;
    if (cid) chatIds.add(cid);
  }

  for (const cid of chatIds) {
    console.log(`Mevcut sohbet (${cid}) bilgilendiriliyor...`);
    await callTelegram("sendMessage", {
      chat_id: cid,
      text: [
        `✅ *@uretirbot Sosyal Medya & AI Otomasyonu Kuruldu!*`,
        `━━━━━━━━━━━━━━━━━━━━`,
        `⏰ *Otonom Yayın Saatleri:* 09:00 · 12:00 · 15:00 · 20:00`,
        `🎬 *Dikey (9:16) Motion-Graphic Video + Doğal Türkçe Ses (TTS):* Aktif`,
        `📸 *Instagram:* @uretirai`,
        `▶️ *YouTube:* youtube.com/@Uretir`,
        `🌐 *Web & 6 AI Aracı:* https://www.uretir.com`,
        "",
        `Komutlar: /start · /sabah · /ogle · /ikindi · /aksam · /durum · /yenile · /seo`,
      ].join("\n"),
      parse_mode: "Markdown",
    });
  }

  const webhookUrl = `${siteUrl}/api/telegram/webhook`;
  console.log(`Webhook ayarlanıyor: ${webhookUrl}`);
  const wh = await callTelegram("setWebhook", {
    url: webhookUrl,
    allowed_updates: ["message", "edited_message", "callback_query", "channel_post"],
    drop_pending_updates: false,
  });
  console.log("Webhook sonucu:", wh);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
