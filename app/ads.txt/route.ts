import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() { const body = process.env.ADS_TXT?.trim(); return new NextResponse(body ? body + "\n" : "", { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } }); }
