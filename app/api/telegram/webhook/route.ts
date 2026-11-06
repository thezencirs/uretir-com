import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  // @uretirbot sosyal medya ve video içerik otomasyonu tamamen durduruldu.
  return NextResponse.json({
    ok: true,
    disabled: true,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    disabled: true,
    bot: "@uretirbot",
    message: "Sosyal medya ve @uretirbot içerik otomasyonu durduruldu.",
  });
}
