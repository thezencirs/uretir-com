import { NextResponse } from "next/server";
import { listManagedProducts } from "@/lib/marketplace-management";

export async function GET() {
  try { return NextResponse.json({ data: await listManagedProducts(true) }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }); }
  catch { return NextResponse.json({ data: [], unavailable: true }, { status: 200 }); }
}
