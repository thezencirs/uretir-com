import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { adminResourceSchema, schemaForUpdate } from "@/lib/puan-ai/admin-schemas";
import { hasSameOrigin, isAdminRequest } from "@/lib/puan-ai/admin-auth";
import { deleteAdminResource, updateAdminResource } from "@/lib/puan-ai/admin-service";

const idSchema = z.string().uuid();
type RouteContext = { params: Promise<{ resource: string; id: string }> };

function unauthorized() {
  return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
}

async function parseContext(context: RouteContext) {
  const params = await context.params;
  const resource = adminResourceSchema.safeParse(params.resource);
  const id = idSchema.safeParse(params.id);
  return resource.success && id.success ? { resource: resource.data, id: id.data } : null;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  const target = await parseContext(context);
  if (!target) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
  const payload = schemaForUpdate(target.resource).safeParse(await request.json().catch(() => null));
  if (!payload.success) return NextResponse.json({ error: "Alanları kontrol edin.", issues: payload.error.flatten() }, { status: 400 });
  try {
    return NextResponse.json({ data: await updateAdminResource(target.resource, target.id, payload.data as Record<string, unknown>) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Kayıt güncellenemedi." }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  const target = await parseContext(context);
  if (!target) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
  try {
    return NextResponse.json({ data: await deleteAdminResource(target.resource, target.id) });
  } catch {
    return NextResponse.json({ error: "Bağlı kayıtlar nedeniyle işlem tamamlanamadı." }, { status: 409 });
  }
}

