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
  name: "Örnek üye",
  initials: "ÖÜ",
  role: "Demo profil",
  company: "Örnek çalışma alanı",
  location: "Konum belirtilmez",
  bio: "Bu profil gerçek bir kişiyi veya kuruluşu temsil etmez.",
  followers: "Örnek",
  following: "Örnek",
  score: 0,
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
    title: "Örnek topluluk profili yeni bir üretim notu paylaştı",
    meta: "Varsayımsal topluluk kaydı",
    tag: "DEMO",
    tone: "orange",
    icon: "↗",
  },
  {
    type: "PuanAI",
    title: "Örnek alışveriş karar senaryosu",
    meta: "PuanAI · gerçek kampanya değil",
    tag: "SENARYO",
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
  { name: "Örnek rozet", mark: "01", detail: "Gerçek kullanıcı başarımı değildir" },
  { name: "AI keşfi", mark: "✦", detail: "Gelecek rozet modelinin örneği" },
  { name: "Katkı modeli", mark: "↗", detail: "Gelecek katkı sisteminin örneği" },
];

export const authProviders = [
  { label: "Google akışı örneği", key: "google" },
  { label: "GitHub akışı örneği", key: "github" },
  { label: "Apple akışı örneği", key: "apple" },
] as const;
