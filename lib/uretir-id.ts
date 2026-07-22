export type IdentityView = "auth" | "onboarding" | "dashboard";

export type FeedItem = {
  type: string;
  title: string;
  meta: string;
  tag: string;
  tone: "lime" | "blue" | "violet" | "orange";
  icon: string;
};

export type Collection = {
  title: string;
  count: number;
  description: string;
  color: string;
};

export const memberProfile = {
  name: "Selin Yılmaz",
  initials: "SY",
  role: "Ürün tasarımcısı",
  company: "Kolektif Studio",
  location: "İstanbul, Türkiye",
  bio: "Üretimi daha anlaşılır, teknolojiyi daha insani kılmak için çalışıyorum.",
  followers: "1.2K",
  following: "184",
  score: 842,
};

export const followedTopics = ["Yapay zekâ", "Ürün tasarımı", "Üretim", "Otomasyon"];

export const feedItems: FeedItem[] = [
  {
    type: "Editör seçkisi",
    title: "Yapay zekâ çağında üretmenin yeni ritmi",
    meta: "8 dk okuma · 42 dakika önce",
    tag: "YAPAY ZEKÂ",
    tone: "blue",
    icon: "✦",
  },
  {
    type: "Takip ettiklerinden",
    title: "Kolektif Studio yeni üretim laboratuvarını açtı",
    meta: "Kolektif Studio · 2 saat önce",
    tag: "ŞİRKET",
    tone: "orange",
    icon: "↗",
  },
  {
    type: "PuanAI",
    title: "Üreten ekipler için yeni destek kampanyası",
    meta: "PuanAI · 4 saat önce",
    tag: "FIRSAT",
    tone: "lime",
    icon: "+",
  },
];

export const collections: Collection[] = [
  { title: "Gelecekte okuyacağım", count: 18, description: "İlham veren yazılar ve fikirler", color: "#b9e968" },
  { title: "Otomasyon", count: 12, description: "İş akışlarını dönüştüren araçlar", color: "#8db9cc" },
  { title: "Fabrika fikirleri", count: 7, description: "Sahadan notlar ve üretim vizyonu", color: "#d99a6a" },
];

export const badges = [
  { name: "Erken üye", mark: "01", detail: "İlk 1.000 üyeden biri" },
  { name: "AI Explorer", mark: "✦", detail: "Yapay zekâyı keşfediyor" },
  { name: "Top Contributor", mark: "↗", detail: "Topluluğa katkı sağlıyor" },
];

export const authProviders = [
  { label: "Google ile devam et", key: "google" },
  { label: "GitHub ile devam et", key: "github" },
  { label: "Apple ile devam et", key: "apple" },
] as const;

