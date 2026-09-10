export const routes = {
  home: () => "/",
  blog: () => "/blog",
  search: () => "/ara",
  article: (slug: string) => `/blog/${slug}`,
  category: (slug: string) => `/kategori/${slug}`,
  companyIndex: () => "/ne-uretir",
  company: (slug: string) => `/ne-uretir/${slug}`,
  ecosystem: () => "/ekosistem",
  applications: () => "/uygulamalar",
  map: () => "/harita",
  about: () => "/hakkimizda",
  puanAI: () => "/puan-ai",
  uretirAI: () => "/uretir-ai",
  tesvikAI: () => "/tesvik-ai",
  fiyatAI: () => "/fiyat-ai",
  ihracatAI: () => "/ihracat-ai",
  insanAI: () => "/insan-ai",
  mimarAI: () => "/mimar-ai",
  indirimAI: () => "/indirim-ai",
  magazinAI: () => "/magazin-ai",
  trends: () => "/trendler",
  guide: (slug: string) => `/rehber/${slug}`,
  feed: () => "/feed.xml",
} as const;

/** Generates stable future slugs without changing already published URLs. */
export function toSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
