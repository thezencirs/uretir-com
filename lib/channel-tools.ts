/** Public destinations only. Publisher credentials and delivery state stay server-side. */
export const channelTools = [
  { slug: "haber-ai", name: "HaberAI", category: "Şehir gündemi", description: "Şehrini seç. Günün haberlerini haritada, tarihi ve özgün kaynağıyla incele.", features: ["81 il haritası", "Tarihli arşiv", "Kaynak bağlantıları"], channelUrl: "https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y", color: "#769d32" },
  { slug: "finans-ai", name: "FinansAI", category: "Piyasa takibi", description: "Döviz, altın, borsa, kripto ve emtiayı aynı ekranda takip et.", features: ["Piyasa filtreleri", "Fiyat grafikleri", "Veri zamanı"], channelUrl: "https://whatsapp.com/channel/0029VbDIS6B4inoiXI8jeE05", color: "#40958e" },
  { slug: "puan-ai", name: "PuanAI", category: "Kart kampanyaları", description: "Alışverişini anlat. Kart kampanyalarını ödül, taksit ve katılım koşullarıyla karşılaştır.", features: ["Kampanya asistanı", "Kart karşılaştırma", "Resmî koşullar"], channelUrl: "https://whatsapp.com/channel/0029VbDbbII8PgsA574OLl1H", color: "#8b80c2" },
  { slug: "indirim-ai", name: "İndirimAI", category: "Fiyat geçmişi", description: "İndirim etiketinin arkasına bak. Gözlenen fiyatları ve dönem diplerini incele.", features: ["30 / 90 / 360 gün", "Mağaza filtresi", "Fiyat karşılaştırma"], channelUrl: "https://whatsapp.com/channel/0029VbEFC5zICVfmJzjAfY2Q", color: "#c57937" },
  { slug: "araba-ai", name: "ArabaAI", category: "Otomobil araştırması", description: "Resmî sıfır araç fiyatlarını ve Sahibinden, Letgo, Arabam.com piyasa verilerini haritada karşılaştır.", features: ["Sıfır & 2. El Kıyas", "Fotoğraflı vitrin", "Kampanya tarihleri"], channelUrl: "https://whatsapp.com/channel/0029Vb8r7Vh8F2p8FcGDsj1L", color: "#688fba" },
  { slug: "ev-ai", name: "EvAI", category: "Konut araştırması", description: "Emlakjet, Sahibinden endeksi, Letgo ve kamu ihale ilanlarını şehir, bütçe ve m² bilgisiyle değerlendir.", features: ["Fotoğraflı ilanlar", "m² karşılaştırma", "Kamu / ihale ayrımı"], channelUrl: "https://whatsapp.com/channel/0029VaBzvL33gvWb52bNHv0q", color: "#ae7783" },
] as const;

export type ChannelToolSlug = (typeof channelTools)[number]["slug"];
export function getChannelTool(slug: ChannelToolSlug) {
  return channelTools.find((tool) => tool.slug === slug)!;
}

export type CategoryHubSlug = ChannelToolSlug | "spor-ai" | "oyun-ai";

export const categoryHubTools: ReadonlyArray<{
  slug: CategoryHubSlug;
  name: string;
  category: string;
  description: string;
  features: readonly string[];
  channelUrl: string;
  color: string;
  previewImage: string;
  badge: string;
}> = [
  {
    slug: "haber-ai",
    name: "HaberAI",
    category: "81 İl Haritalı Gündem",
    description: "81 ilin tamamında resmi ajans ve kurum kaynaklı sıcak gündemi fotoğraflı önizleme ve interaktif Türkiye haritasında takip et.",
    features: ["81 il canlı harita", "7 bölge filtresi", "Fotoğraflı şehir özeti"],
    channelUrl: "https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y",
    color: "#769d32",
    previewImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
    badge: "81 İL HARİTA",
  },
  {
    slug: "puan-ai",
    name: "PuanAI",
    category: "Kart & Banka Kampanyaları",
    description: "Alışverişini anlat; Ziraat, İş Bankası, Garanti BBVA, Yapı Kredi, Akbank, QNB ve tüm kart kampanyalarını net ödülle kıyasla.",
    features: ["Net kazanç hesabı", "Taksit & nakit iade", "Resmî banka kanıtı"],
    channelUrl: "https://whatsapp.com/channel/0029VbDbbII8PgsA574OLl1H",
    color: "#8b80c2",
    previewImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
    badge: "KART & PUAN",
  },
  {
    slug: "indirim-ai",
    name: "İndirimAI",
    category: "30/90/360 Gün Dip Fiyat",
    description: "Dyson, Hepsiburada, Trendyol, Amazon ve Letgo fırsatlarını fotoğraflı ürün kartları ve 360 günlük fiyat geçmişiyle yakala.",
    features: ["30 / 90 / 360 gün dip", "Fotoğraflı ürün vitrini", "Kupon kodu radarı"],
    channelUrl: "https://whatsapp.com/channel/0029VbEFC5zICVfmJzjAfY2Q",
    color: "#c57937",
    previewImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    badge: "GERÇEK İNDİRİM",
  },
  {
    slug: "finans-ai",
    name: "FinansAI",
    category: "Canlı Piyasa & Ekonomi",
    description: "Dolar, Euro, Gram Altın, BIST 100, Bitcoin, Brent Petrol ve TCMB faiz göstergelerini canlı grafiklerle aynı ekranda izle.",
    features: ["Canlı döviz & altın", "BIST 100 & Kripto", "Anlık kaynak zamanı"],
    channelUrl: "https://whatsapp.com/channel/0029VbDIS6B4inoiXI8jeE05",
    color: "#40958e",
    previewImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
    badge: "CANLI PİYASA",
  },
  {
    slug: "spor-ai",
    name: "SporAI",
    category: "Süper Lig, Avrupa & Spor Verisi",
    description: "Süper Lig puan durumu, Şampiyonlar Ligi ülke puanı, EuroLeague basketbol, voleybol ve 81 il spor ekonomisi verilerini incele.",
    features: ["Süper Lig & UEFA", "Basketbol & Voleybol", "Fotoğraflı maç analizi"],
    channelUrl: "https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y",
    color: "#2b9348",
    previewImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
    badge: "CANLI SPOR VERİSİ",
  },
  {
    slug: "oyun-ai",
    name: "OyunAI",
    category: "Oyun İndirimleri & Yerli Stüdyolar",
    description: "Steam, PlayStation, Xbox ve Epic Games ücretsiz/indirimli oyun radarı, Türk oyun stüdyoları, espor ve tarayıcı oyunu bir arada.",
    features: ["Steam & Epic indirimleri", "Yerli oyun stüdyoları", "OyunAI Memo oyna"],
    channelUrl: "https://whatsapp.com/channel/0029VbEFC5zICVfmJzjAfY2Q",
    color: "#e05780",
    previewImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    badge: "OYUN & ESPOR",
  },
  {
    slug: "araba-ai",
    name: "ArabaAI",
    category: "Sıfır & 2. El Araç Kıyaslama",
    description: "Sahibinden, Letgo Oto, Arabam.com 2. el piyasa verilerini markaların resmî sıfır araç liste ve kampanya fiyatlarıyla haritada kıyasla.",
    features: ["Sahibinden & Letgo kıyas", "Fotoğraflı araç vitrini", "Resmî sıfır liste"],
    channelUrl: "https://whatsapp.com/channel/0029Vb8r7Vh8F2p8FcGDsj1L",
    color: "#688fba",
    previewImage: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    badge: "SIFIR & 2. EL OTO",
  },
  {
    slug: "ev-ai",
    name: "EvAI",
    category: "Konut, Arsa & Kamu İhale",
    description: "Emlakjet, Sahibinden emlak endeksi, Hepsiemlak, Letgo ve resmî kamu ihale taşınmaz ilanlarını fotoğraflı önizleme ve m² medyanıyla incele.",
    features: ["Emlakjet & Sahibinden kıyas", "Fotoğraflı konut vitrini", "Kamu ihale taşınmaz"],
    channelUrl: "https://whatsapp.com/channel/0029VaBzvL33gvWb52bNHv0q",
    color: "#ae7783",
    previewImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    badge: "EMLAK & İHALE",
  },
] as const;

export function getCategoryHubTool(slug: CategoryHubSlug) {
  return categoryHubTools.find((tool) => tool.slug === slug) ?? categoryHubTools[0];
}
