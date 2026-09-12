export const SITE_URL = "https://uretir.com";
export const SITE_NAME = "Üretir";
export const DEFAULT_TITLE = "Üretir — Türkiye üretir, gençler yetişir";
export const DEFAULT_DESCRIPTION = "Türkiye üretir, gençler yetişir. Gelişmeler, girişim ekosistemi, yapay zekâ çözümleri ve öğrenme kaynakları Üretir platformunda.";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
