import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest, hasSameOrigin } from "@/lib/puan-ai/admin-auth";
import { getPrisma } from "@/lib/puan-ai/db";
import { marketplaceProductPatch } from "@/lib/marketplace-management";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  const parsed = marketplaceProductPatch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Alanları kontrol edin." }, { status: 400 });
  try { const { id } = await params; return NextResponse.json({ data: await getPrisma().marketplaceProduct.update({ where: { id }, data: parsed.data }) }); }
  catch { return NextResponse.json({ error: "Kayıt güncellenemedi." }, { status: 409 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  if (!isAdminRequest(request)) return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  try { const { id } = await params; return NextResponse.json({ data: await getPrisma().marketplaceProduct.update({ where: { id }, data: { status: "DRAFT" } }) }); }
  catch { return NextResponse.json({ error: "Kayıt taslağa alınamadı." }, { status: 409 }); }
}
