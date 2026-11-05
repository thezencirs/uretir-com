export const SITE_URL = "https://www.uretir.com";
export const SITE_NAME = "Üretir";
export const DEFAULT_TITLE = "Üretir — Türkiye üretir, gençler yetişir";
export const DEFAULT_DESCRIPTION = "Türkiye üretir, gençler yetişir. Gelişmeler, girişim ekosistemi, yapay zekâ çözümleri ve öğrenme kaynakları Üretir platformunda.";
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: DEFAULT_TITLE,
};

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
