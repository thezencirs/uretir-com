import { NextRequest, NextResponse } from "next/server";
import { buildSlotBroadcastPackage } from "@/lib/social-automation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const slotParam = request.nextUrl.searchParams.get("slot") || undefined;
  const pkg = await buildSlotBroadcastPackage(slotParam);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID;
  let telegramDelivered = false;

  if (token && chatId) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: [
            `⏰ *OTONOM YAYIN TETİKLENDİ (${pkg.slotLabel})*`,
            `━━━━━━━━━━━━━━━━━━━━`,
            `🎙️ *Doğal Seslendirme (TTS):*`,
            `_${pkg.voiceScript}_`,
            "",
            pkg.caption,
          ].join("\n"),
          parse_mode: "Markdown",
        }),
        signal: AbortSignal.timeout(15_000),
      });
      telegramDelivered = res.ok;
    } catch {
      telegramDelivered = false;
    }
  }

  return NextResponse.json({
    ok: true,
    slot: pkg.slot,
    slotLabel: pkg.slotLabel,
    telegramDelivered,
    package: pkg,
  });
}
