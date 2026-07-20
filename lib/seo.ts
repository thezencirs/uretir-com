export const SITE_URL = "https://uretir.com";
export const SITE_NAME = "Üretir";
export const DEFAULT_TITLE = "Üretir — Fikri gerçeğe dönüştürenler için";
export const DEFAULT_DESCRIPTION = "Üretim, teknoloji, yapay zekâ, mühendislik, mimarlık ve üretkenlik üzerine düşünenlerin platformu.";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
