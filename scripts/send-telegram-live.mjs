import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "995164733";

const MAIN_MENU_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "🎬 09:00 Sabah Video", callback_data: "slot:09" },
      { text: "🎬 12:00 Öğle Video", callback_data: "slot:12" },
    ],
    [
      { text: "🎬 15:00 Araç & Konut Video", callback_data: "slot:15" },
      { text: "🎬 20:00 Akşam Özeti Video", callback_data: "slot:20" },
    ],
    [
      { text: "📸 Canlı Instagram Reels'i Aç", url: "https://www.instagram.com/reel/Del6ju4MQob/" },
      { text: "🌐 uretir.com Canlı Veri Merkezi", url: "https://www.uretir.com" },
    ],
    [
      { text: "📸 Instagram @uretirai", url: "https://www.instagram.com/uretirai/" },
      { text: "▶️ YouTube @Uretir", url: "https://www.youtube.com/@Uretir" },
    ],
  ],
};

async function main() {
  if (!BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN eksik.");
    return;
  }

  // 1. Send control panel & live Instagram confirmation message to 995164733
  const welcomeMsg = [
    `🤖 *ÜRETİR AI OTONOM SOSYAL MEDYA MERKEZİ (@uretirbot)*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✅ *Telegram Kimliğiniz Tanımlandı:* \`${CHAT_ID}\``,
    `✅ *Instagram (@uretirai) Oturumu Bağlandı!*`,
    `🎬 *Canlı Reels Yayınlandı:* https://www.instagram.com/reel/Del6ju4MQob/`,
    `📲 *Canlı Hikaye (Story + uretir.com Link):* Yayınlandı!`,
    "",
    `⏰ *Otonom Yayın Saatleri:* 09:00 · 12:00 · 15:00 · 20:00`,
    `🌐 *Ana Veri Merkezi:* https://www.uretir.com`,
    `Aşağıda üretilen 1080×1920 dikey motion-graphic MP4 videolarınız sohbetinize iletiliyor:`,
  ].join("\n");

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: welcomeMsg,
      parse_mode: "Markdown",
      reply_markup: MAIN_MENU_KEYBOARD,
    }),
  });

  // 2. Send the 12:00 vertical MP4 video with natural Turkish voiceover to 995164733
  const videoPath = path.resolve("reports", "social-media", "slot-12", "uretir-reel-12.mp4");
  if (existsSync(videoPath)) {
    const videoBytes = await fs.readFile(videoPath);
    const form = new FormData();
    form.append("chat_id", String(CHAT_ID));
    form.append(
      "caption",
      [
        `🎬 *ÜRETİR AI DİKEY MOTION-GRAPHIC VİDEO (12:00 KUŞAĞI)*`,
        `🎙️ *Doğal Türkçe Seslendirme (EmelNeural) Aktif*`,
        `📸 *Instagram Canlı Link:* https://www.instagram.com/reel/Del6ju4MQob/`,
        `🌐 *Veri Merkezi:* https://www.uretir.com/indirim-ai`,
      ].join("\n")
    );
    form.append("parse_mode", "Markdown");
    form.append("supports_streaming", "true");
    form.append("reply_markup", JSON.stringify(MAIN_MENU_KEYBOARD));
    form.append("video", new Blob([videoBytes], { type: "video/mp4" }), "uretir-reel-12.mp4");

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(60_000),
    });
    const json = await res.json();
    console.log("Telegram MP4 Gönderim Durumu:", json.ok ? "BAŞARILI" : json);
  }
}

main().catch(console.error);
