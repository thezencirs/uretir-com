/** Public destinations only. Publisher credentials and delivery state stay server-side. */
export const channelTools = [
  { slug: "haber-ai", name: "HaberAI", category: "Şehir gündemi", description: "Şehrini seç. Günün haberlerini haritada, tarihi ve özgün kaynağıyla incele.", features: ["81 il haritası", "Tarihli arşiv", "Kaynak bağlantıları"], channelUrl: "https://whatsapp.com/channel/0029VbDk4gHGpLHXkGseaf3Y", color: "#769d32" },
  { slug: "finans-ai", name: "FinansAI", category: "Piyasa takibi", description: "Döviz, altın, borsa, kripto ve emtiayı aynı ekranda takip et.", features: ["Piyasa filtreleri", "Fiyat grafikleri", "Veri zamanı"], channelUrl: "https://whatsapp.com/channel/0029VbDIS6B4inoiXI8jeE05", color: "#40958e" },
  { slug: "puan-ai", name: "PuanAI", category: "Kart kampanyaları", description: "Alışverişini anlat. Kart kampanyalarını ödül, taksit ve katılım koşullarıyla karşılaştır.", features: ["Kampanya asistanı", "Kart karşılaştırma", "Resmî koşullar"], channelUrl: "https://whatsapp.com/channel/0029VbDbbII8PgsA574OLl1H", color: "#8b80c2" },
  { slug: "indirim-ai", name: "İndirimAI", category: "Fiyat geçmişi", description: "İndirim etiketinin arkasına bak. Gözlenen fiyatları ve dönem diplerini incele.", features: ["30 / 90 / 360 gün", "Mağaza filtresi", "Fiyat karşılaştırma"], channelUrl: "https://whatsapp.com/channel/0029VbEFC5zICVfmJzjAfY2Q", color: "#c57937" },
  { slug: "araba-ai", name: "ArabaAI", category: "Otomobil araştırması", description: "Resmî sıfır araç fiyatlarını bütçene göre süz. Modelleri ve marka kampanyalarını karşılaştır.", features: ["Marka ve bütçe", "Model karşılaştırma", "Kampanya tarihleri"], channelUrl: "https://whatsapp.com/channel/0029Vb8r7Vh8F2p8FcGDsj1L", color: "#688fba" },
  { slug: "ev-ai", name: "EvAI", category: "Konut araştırması", description: "Kaynaklı ilanları şehir, bütçe ve metrekare bilgisiyle değerlendir.", features: ["Şehir filtresi", "m² karşılaştırma", "Kamu / ihale ayrımı"], channelUrl: "https://whatsapp.com/channel/0029VaBzvL33gvWb52bNHv0q", color: "#ae7783" },
] as const;

export type ChannelToolSlug = (typeof channelTools)[number]["slug"];
export function getChannelTool(slug: ChannelToolSlug) {
  return channelTools.find(tool => tool.slug === slug)!;
}
