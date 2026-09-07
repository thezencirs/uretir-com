export const verifiedAt = "2026-09-06";
export const cities = {
  "İstanbul": [41.0082, 28.9784],
  "Ankara": [39.9334, 32.8597],
  "İzmir": [38.4237, 27.1428],
  "Bursa": [40.1885, 29.061],
  "Eskişehir": [39.7667, 30.5256],
} as const;
export type City = keyof typeof cities;
export type ProductCategory = "Yapay zekâ" | "Oyun" | "Mobil uygulama" | "İş araçları";
type Maker = { name: string; city: City; source: string; locationSource: string; color: string };
export const makers: Record<string, Maker> = {
  codeway: { name: "Codeway", city: "İstanbul", source: "https://www.codeway.co/our-products", locationSource: "https://www.codeway.co/terms-conditions", color: "#7768d8" },
  hubx: { name: "HubX", city: "İzmir", source: "https://hubx.co/products", locationSource: "https://hubx.co/contact", color: "#2f937e" },
  appnation: { name: "AppNation", city: "İstanbul", source: "https://www.appnation.co/about", locationSource: "https://www.appnation.co/contact", color: "#b15c89" },
  dream: { name: "Dream Games", city: "İstanbul", source: "https://www.dreamgames.com/games", locationSource: "https://www.dreamgames.com/", color: "#4878cb" },
  peak: { name: "Peak", city: "İstanbul", source: "https://peak.com/about", locationSource: "https://peak.com/about", color: "#d37c40" },
  loop: { name: "Loop Games", city: "Ankara", source: "https://loopgames.net/games", locationSource: "https://loopgames.net/support", color: "#ae6954" },
  masomo: { name: "Masomo", city: "İzmir", source: "https://www.masomo.com/", locationSource: "https://izka.org.tr/wp-content/uploads/2024/12/Izmir-Oyun-Sektoru-ve-Oyun-Ekosistemi-Ihtiyac-Analizi-Raporu-1.pdf", color: "#5b8e4e" },
  bigger: { name: "Bigger Games", city: "İstanbul", source: "https://www.biggergames.com/about-us", locationSource: "https://www.biggergames.com/about-us", color: "#9a6547" },
  goodjob: { name: "Good Job Games", city: "İstanbul", source: "https://www.goodjobgames.com/", locationSource: "https://job-boards.greenhouse.io/goodjobgames", color: "#a56b93" },
  mobge: { name: "Mobge", city: "Eskişehir", source: "https://www.mobge.net/blog-details/4/coming-up-next", locationSource: "https://www.mobge.net/career", color: "#738545" },
  megafortuna: { name: "Mega Fortuna", city: "Bursa", source: "https://megafortuna.co/company/", locationSource: "https://megafortuna.co/privacy/", color: "#8f7357" },
  meditopia: { name: "Meditopia", city: "İstanbul", source: "https://meditopia.com/en/help/what-is-meditopia", locationSource: "https://web.meditopia.com/tr/terms-and-conditions/b2bTR/", color: "#438e87" },
  teknasyon: { name: "Teknasyon", city: "İstanbul", source: "https://teknasyon.com/en/job-ads/account-executive/", locationSource: "https://teknasyon.com/tr/workspace", color: "#c07050" },
};
export type Product = { slug: string; name: string; maker: string; category: ProductCategory; task: string; description: string; url: string };
const rows: [string, string, ProductCategory, string, string][] = [
  ["codeway", "Chat & Ask AI", "Yapay zekâ", "Yazı & araştırma", "Sorular, yazma ve günlük işler için AI asistanı."],
  ["codeway", "Cleanup", "Mobil uygulama", "Fotoğraf & video", "Telefonun fotoğraf arşivini düzenle."],
  ["codeway", "Learna", "Yapay zekâ", "Öğrenme", "AI ile İngilizce konuşma pratiği."],
  ["codeway", "DramaPops", "Mobil uygulama", "Eğlence", "Telefonda kısa drama dizileri."],
  ["codeway", "Retake", "Yapay zekâ", "Fotoğraf & video", "Portre ve yüz fotoğraflarını düzenle."],
  ["codeway", "FaceDance", "Yapay zekâ", "Fotoğraf & video", "Fotoğrafları hareketli içeriklere dönüştür."],
  ["codeway", "Wonder", "Yapay zekâ", "Tasarım", "Fikirlerini AI görsellerine dönüştür."],
  ["codeway", "Plantify", "Yapay zekâ", "Günlük yaşam", "Bitkileri fotoğraftan tanı."],
  ["codeway", "TypeAI", "Yapay zekâ", "Yazı & araştırma", "AI destekli yazma yardımcısı."],
  ["hubx", "Nova", "Yapay zekâ", "Yazı & araştırma", "Birden fazla AI modeline tek arayüzden ulaş."],
  ["hubx", "DaVinci", "Yapay zekâ", "Tasarım", "Metin ve görsellerden yeni görseller üret."],
  ["hubx", "HomeAI", "Yapay zekâ", "Tasarım", "İç ve dış mekân tasarımlarını görselleştir."],
  ["hubx", "PlantApp", "Mobil uygulama", "Günlük yaşam", "Bitki tanıma ve bakım hatırlatıcıları."],
  ["hubx", "TattooAI", "Yapay zekâ", "Tasarım", "Dövme fikirlerini tasarla ve görselleştir."],
  ["hubx", "Wiser", "Mobil uygulama", "Öğrenme", "Kısa sesli kitap özetleriyle öğren."],
  ["hubx", "Momo", "Yapay zekâ", "Fotoğraf & video", "AI ile portre ve profil fotoğrafları üret."],
  ["hubx", "Lean", "Mobil uygulama", "Günlük yaşam", "Beslenme ve makro takibi."],
  ["appnation", "Genie", "Yapay zekâ", "Yazı & araştırma", "Günlük sorular için AI sohbet asistanı."],
  ["appnation", "Fotorama", "Yapay zekâ", "Fotoğraf & video", "AI destekli fotoğraf üretimi."],
  ["appnation", "Arch", "Yapay zekâ", "Tasarım", "Ev tasarım fikirlerini keşfet."],
  ["dream", "Royal Match", "Oyun", "Oyun oyna", "Renkli eşleştirme bulmacaları."],
  ["dream", "Royal Kingdom", "Oyun", "Oyun oyna", "Krallık temalı eşleştirme macerası."],
  ["peak", "Toon Blast", "Oyun", "Oyun oyna", "Çizgi karakterlerle blok bulmacaları."],
  ["peak", "Toy Blast", "Oyun", "Oyun oyna", "Oyuncak dünyasında blok eşleştirme."],
  ["peak", "Match Factory", "Oyun", "Oyun oyna", "Üç boyutlu nesne eşleştirme."],
  ["loop", "Match 3D", "Oyun", "Oyun oyna", "Üç boyutlu eşleştirme bulmacası."],
  ["loop", "Match Tile 3D", "Oyun", "Oyun oyna", "Üç boyutlu karo bulmacası."],
  ["loop", "Money Sort", "Oyun", "Oyun oyna", "Sıralama bulmacası."],
  ["loop", "Color Stack Shot", "Oyun", "Oyun oyna", "Renkli bulmaca oyunu."],
  ["loop", "Wooly Wonders 3D", "Oyun", "Oyun oyna", "Üç boyutlu bulmaca."],
  ["loop", "Hop N Loop", "Oyun", "Oyun oyna", "Mobil bulmaca oyunu."],
  ["loop", "Octo Crush", "Oyun", "Oyun oyna", "Mobil bulmaca oyunu."],
  ["loop", "Wood Out", "Oyun", "Oyun oyna", "Mobil bulmaca oyunu."],
  ["loop", "Tank Jam", "Oyun", "Oyun oyna", "Mobil bulmaca oyunu."],
  ["loop", "Snake Loop", "Oyun", "Oyun oyna", "Mobil bulmaca oyunu."],
  ["loop", "Number Match", "Oyun", "Oyun oyna", "Sayı bulmacası."],
  ["loop", "Apple Grapple", "Oyun", "Oyun oyna", "Mobil aksiyon oyunu."],
  ["masomo", "Head Ball 2", "Oyun", "Oyun oyna", "Çevrimiçi futbol karşılaşmaları."],
  ["masomo", "Basketball Arena", "Oyun", "Oyun oyna", "Mobil basketbol karşılaşmaları."],
  ["bigger", "Kitchen Masters", "Oyun", "Oyun oyna", "Mutfak temalı bulmaca macerası."],
  ["goodjob", "Match Villains", "Oyun", "Oyun oyna", "Soygun temalı eşleştirme bulmacası."],
  ["mobge", "Oddmar", "Oyun", "Oyun oyna", "Viking dünyasında platform macerası."],
  ["megafortuna", "Richie", "Mobil uygulama", "Eğlence", "Ödül ekosisteminin tüketici uygulaması."],
  ["megafortuna", "Earnimo", "Mobil uygulama", "Eğlence", "Ödül ekosisteminin tüketici uygulaması."],
  ["megafortuna", "PunkteWelt", "Mobil uygulama", "Eğlence", "Ödül ekosisteminin tüketici uygulaması."],
  ["megafortuna", "JeuValeur", "Mobil uygulama", "Eğlence", "Ödül ekosisteminin tüketici uygulaması."],
  ["meditopia", "Meditopia", "Mobil uygulama", "Günlük yaşam", "Meditasyon, uyku ve farkındalık içerikleri."],
  ["teknasyon", "Desk360", "İş araçları", "İşimi büyüt", "Müşteri iletişimini yönet."],
  ["teknasyon", "Zotlo", "İş araçları", "İşimi büyüt", "Abonelik ve ödeme süreçleri."],
  ["teknasyon", "VerifyKit", "İş araçları", "İşimi büyüt", "Kullanıcı doğrulama altyapısı."],
  ["teknasyon", "Rockads", "İş araçları", "İşimi büyüt", "Dijital reklam yönetimi."],
];
export function normalizeSearch(value: string) {
  return value.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
export const products: Product[] = rows.map(([maker, name, category, task, description]) => ({
  slug: normalizeSearch(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  maker, name, category, task, description, url: makers[maker].source,
}));
export const tasks = [...new Set(products.map((p) => p.task))];
export function filterProducts(query = "", category = "Tümü", city = "Tümü", task = "Tümü") {
  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  return products.filter((p) => {
    const maker = makers[p.maker];
    const text = normalizeSearch([p.name, maker.name, maker.city, p.description, p.task, p.category].join(" "));
    return terms.every((term) => text.includes(term)) && (category === "Tümü" || p.category === category) && (city === "Tümü" || maker.city === city) && (task === "Tümü" || p.task === task);
  });
}
