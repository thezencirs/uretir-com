import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest, hasSameOrigin } from "@/lib/puan-ai/admin-auth";
import { getPrisma } from "@/lib/puan-ai/db";
import { listManagedProducts, marketplaceProductInput } from "@/lib/marketplace-management";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  try { return NextResponse.json({ data: await listManagedProducts() }); }
  catch { return NextResponse.json({ error: "Ürün veritabanına ulaşılamadı." }, { status: 503 }); }
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  const parsed = marketplaceProductInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Alanları kontrol edin." }, { status: 400 });
  try { return NextResponse.json({ data: await getPrisma().marketplaceProduct.create({ data: parsed.data }) }, { status: 201 }); }
  catch { return NextResponse.json({ error: "Kayıt oluşturulamadı. Ürün adresi daha önce kullanılmış olabilir." }, { status: 409 }); }
}
