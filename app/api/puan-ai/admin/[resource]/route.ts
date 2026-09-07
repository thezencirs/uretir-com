import { NextResponse, type NextRequest } from "next/server";
import { adminResourceSchema, createSchemas } from "@/lib/puan-ai/admin-schemas";
import { hasSameOrigin, isAdminRequest } from "@/lib/puan-ai/admin-auth";
import { createAdminResource, listAdminResources } from "@/lib/puan-ai/admin-service";

type RouteContext = { params: Promise<{ resource: string }> };

function unauthorized() {
  return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
}

export async function GET(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return unauthorized();
  const resource = adminResourceSchema.safeParse((await context.params).resource);
  if (!resource.success) return NextResponse.json({ error: "Bilinmeyen kaynak." }, { status: 404 });
  try {
    return NextResponse.json({ data: await listAdminResources(resource.data) });
  } catch {
    return NextResponse.json({ error: "Kayıtlar yüklenemedi." }, { status: 503 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  const resource = adminResourceSchema.safeParse((await context.params).resource);
  if (!resource.success) return NextResponse.json({ error: "Bilinmeyen kaynak." }, { status: 404 });
  const payload = createSchemas[resource.data].safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Alanları kontrol edin.", issues: payload.error.flatten() }, { status: 400 });
  try {
    return NextResponse.json({ data: await createAdminResource(resource.data, payload.data as Record<string, unknown>) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kayıt oluşturulamadı." }, { status: 409 });
  }
}

