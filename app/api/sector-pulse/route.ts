import { NextRequest, NextResponse } from "next/server";
import { fetchAllSectorsPulse, fetchSectorPulse, type SectorPulseKey } from "@/lib/live-ai-pulse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_SECTORS = new Set<SectorPulseKey>([
  "yapay-zeka",
  "teknoloji-girisim",
  "tesvik-ai",
  "memur-ai",
  "insaat-ai",
  "emlak-ai",
]);

export async function GET(request: NextRequest) {
  const rawSector = request.nextUrl.searchParams.get("sector") || "all";
  const limit = Math.min(20, Math.max(2, Number(request.nextUrl.searchParams.get("limit") || 6)));

  try {
    if (rawSector !== "all" && VALID_SECTORS.has(rawSector as SectorPulseKey)) {
      const sector = rawSector as SectorPulseKey;
      const items = await fetchSectorPulse(sector, limit);
      return NextResponse.json(
        {
          ok: true,
          sector,
          checkedAt: new Date().toISOString(),
          count: items.length,
          items,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
          },
        }
      );
    }

    const all = await fetchAllSectorsPulse(limit);
    return NextResponse.json(
      {
        ok: true,
        sector: "all",
        checkedAt: all.checkedAt,
        count: all.combined.length,
        bySector: all.bySector,
        items: all.combined,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
        },
      }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Sektör nabzı okunamadı." }, { status: 503 });
  }
}
