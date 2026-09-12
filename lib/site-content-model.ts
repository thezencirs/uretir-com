import { z } from "zod";
export const categoryIds = ["turkiye", "teknoloji", "fuarlar", "startuplar", "haberler"] as const;
export const navigationPaths = ["/", "/gelismeler", "/blog", "/araclar", "/ekosistem", "/hakkimizda"] as const;
const label = z.string().trim().min(1).max(50);
const date = z.iso.date();
export const newsSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,100}$/),
  category: z.enum(categoryIds), title: z.string().trim().min(5).max(180),
  summary: z.string().trim().min(10).max(700), body: z.string().trim().min(10).max(6000),
  sourceName: z.string().trim().min(2).max(100),
  sourceUrl: z.url().refine(value => { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }, "HTTPS kaynak adresi gerekli."),
  publishedAt: date.nullable(), checkedAt: date,
  eventStart: date.nullable(), eventEnd: date.nullable(), deadline: date.nullable(),
  location: z.string().max(150), visible: z.boolean(),
}).refine(item => !item.eventEnd || (!!item.eventStart && item.eventEnd >= item.eventStart), "Etkinlik tarihleri geçersiz.");
export const siteContentSchema = z.object({
  nav: z.array(z.object({ href: z.enum(navigationPaths), label })).length(navigationPaths.length)
    .refine(items => new Set(items.map(item => item.href)).size === navigationPaths.length, "Menü adresleri tekrarlanamaz."),
  home: z.object({ eyebrow: z.string().trim().min(1).max(100), title: z.string().trim().min(1).max(120), description: z.string().trim().min(1).max(500), ecosystemTitle: z.string().trim().min(1).max(100), manifesto: z.string().trim().min(1).max(240) }),
  developmentsTitle: z.string().trim().min(1).max(100),
  categories: z.array(z.object({ id: z.enum(categoryIds), label })).length(5)
    .refine(items => new Set(items.map(item => item.id)).size === 5, "Kategoriler tekrarlanamaz."),
  news: z.array(newsSchema).max(200).refine(items => new Set(items.map(item => item.id)).size === items.length, "Haber kimlikleri tekrarlanamaz."),
});
export type SiteContent = z.infer<typeof siteContentSchema>;
export type NewsItem = z.infer<typeof newsSchema>;
export function todayInTurkey(now = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function publicNews(items: NewsItem[], today = todayInTurkey()) {
  return items.filter(item => item.visible && (!item.publishedAt || item.publishedAt <= today) && item.checkedAt <= today)
    .sort((a, b) => (b.publishedAt ?? b.checkedAt).localeCompare(a.publishedAt ?? a.checkedAt));
}
export function newsStatus(item: NewsItem, today = todayInTurkey()) {
  if (item.deadline) return item.deadline < today ? "Başvuru süresi doldu" : item.deadline === today ? "Son başvuru bugün · saati kaynaktan kontrol edin" : "Başvuru takviminde";
  if (item.eventStart) return (item.eventEnd ?? item.eventStart) < today ? "Etkinlik sona erdi" : item.eventStart > today ? "Yaklaşan etkinlik" : "Etkinlik devam ediyor";
  return "Haber";
}
export function formatNewsDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" }).format(new Date(value + "T12:00:00Z"));
}
