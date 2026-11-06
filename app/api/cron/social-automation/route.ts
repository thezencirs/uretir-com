import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Sosyal medya ve @uretirbot otomatik bülten/fırsat gönderimleri tamamen durduruldu.
  return NextResponse.json({
    ok: true,
    disabled: true,
    telegramDelivered: false,
    message: "Sosyal medya ve @uretirbot içerik otomasyonu devre dışı bırakıldı.",
  });
}
