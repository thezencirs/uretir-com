import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "puanai_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function configuredSecret() {
  const secret = process.env.PUANAI_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function isAdminConfigured() {
  return Boolean(configuredSecret() && process.env.PUANAI_ADMIN_PASSWORD);
}

function digest(value: string) {
  return createHmac("sha256", configuredSecret() ?? "disabled").update(value).digest("base64url");
}

export function verifyAdminPassword(value: string) {
  const expected = process.env.PUANAI_ADMIN_PASSWORD;
  if (!expected || !configuredSecret()) return false;
  const actualHash = Buffer.from(digest(value));
  const expectedHash = Buffer.from(digest(expected));
  return actualHash.length === expectedHash.length && timingSafeEqual(actualHash, expectedHash);
}

export function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expires);
  return `${payload}.${digest(payload)}`;
}

export function adminCookieHeader(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearAdminCookieHeader() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function isAdminRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!token || !configuredSecret()) return false;
  const [expiresValue, signature] = token.split(".");
  const expires = Number(expiresValue);
  if (!expiresValue || !signature || !Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return false;
  const actual = Buffer.from(signature);
  const expected = Buffer.from(digest(expiresValue));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function hasSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

