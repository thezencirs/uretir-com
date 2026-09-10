import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { adminCookieHeader, clearAdminCookieHeader, createAdminSession, hasSameOrigin, isAdminConfigured, isAdminRequest, verifyAdminPassword } from "@/lib/puan-ai/admin-auth";

const loginSchema = z.object({ password: z.string().min(1).max(256) });

export async function GET(request: NextRequest) {
  return NextResponse.json({ configured: isAdminConfigured(), authenticated: isAdminRequest(request) });
}

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  if (!isAdminConfigured()) return NextResponse.json({ error: "Yönetim erişimi yapılandırılmamış." }, { status: 503 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !verifyAdminPassword(parsed.data.password)) return NextResponse.json({ error: "Parola doğrulanamadı." }, { status: 401 });
  const response = NextResponse.json({ authenticated: true });
  response.headers.set("Set-Cookie", adminCookieHeader(createAdminSession()));
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!hasSameOrigin(request)) return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  const response = NextResponse.json({ authenticated: false });
  response.headers.set("Set-Cookie", clearAdminCookieHeader());
  return response;
}
