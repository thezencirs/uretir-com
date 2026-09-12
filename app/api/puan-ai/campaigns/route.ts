import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { searchVerifiedCampaigns } from "@/lib/puan-ai/catalog-service";

const searchSchema = z.object({
  q: z.string().max(500).optional(),
  merchant: z.string().max(80).optional(),
  brand: z.string().max(80).optional(),
  category: z.string().max(80).optional(),
  amount: z.coerce.number().positive().max(100_000_000).optional(),
  installment: z.coerce.number().int().min(1).max(36).optional(),
  reward: z.string().max(80).optional(),
  bank: z.string().max(80).optional(),
  card: z.string().max(80).optional(),
  date: z.iso.date().optional(),
});

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const parsed = searchSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ data: [], error: "Geçersiz arama parametresi." }, { status: 400 });
  }

  const filters = parsed.data;
  const query = [
    filters.q,
    filters.merchant,
    filters.brand,
    filters.category,
    filters.amount ? `${filters.amount} TL` : null,
    filters.installment ? `${filters.installment} taksit` : null,
    filters.reward,
    filters.bank,
    filters.card,
    filters.date,
  ].filter(Boolean).join(" ") || "güncel doğrulanmış kampanyalar";

  try {
    const data = await searchVerifiedCampaigns(query);
    return NextResponse.json({ data, query });
  } catch {
    return NextResponse.json(
      { data: [], error: "Doğrulanmış kampanya veritabanına şu anda erişilemiyor." },
      { status: 503 },
    );
  }
}
