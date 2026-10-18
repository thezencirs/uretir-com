import Link from "next/link";

export type SeoExplainerKey =
  | "haber-ai"
  | "finans-ai"
  | "puan-ai"
  | "indirim-ai"
  | "spor-ai"
  | "oyun-ai"
  | "araba-ai"
  | "ev-ai"
  | "harita"
  | "kesfet";

type ReferenceLink = {
  href: string;
  anchor: string;
  context: string;
  external?: boolean;
};

const copy: Record<
  SeoExplainerKey,
  {
    title: string;
    lead: string;
    body: string;
    points: string[];
    keywords: string[];
    references: ReferenceLink[];
  }
> = {
  "haber-ai": {
    title: "HaberAI nasıl çalışır? · 81 İl Kaynaklı Türkiye Gündem Haritası",
    lead: "HaberAI, Türkiye’deki güncel gelişmeleri 81 il, ekonomi, bilim, teknoloji, eğitim ve yaşam bağlamında tek harita üzerinde toplar. Amaç yalnızca hızlı bir son dakika haber akışı sunmak değil; birincil haber kaynağını, yayın zamanını ve haberin hangi şehirle ilişkili olduğunu şeffaf biçimde görünür tutmaktır.",
    body: "Haritadaki ve listedeki kayıtlar TRT Haber ve Anadolu Ajansı Teyit Hattı gibi resmî ve doğrulanabilir kaynak bağlantılarıyla birlikte gösterilir. Saat 09:00, 12:00, 15:00 ve 20:00 otonom yayın döngüsüyle WhatsApp, Telegram (@uretirbot), Instagram (@uretirai) ve YouTube (@Uretir) kanallarında dikey motion-graphic bültenlerle desteklenir.",
    points: [
      "81 il bazlı interaktif Türkiye haber haritası ve şehir gündemi",
      "Doğrulanmış kaynak bağlantısı, kategori ve zaman damgası",
      "Görsel özet kartları ve çok kanallı otonom bülten entegrasyonu",
    ],
    keywords: [
      "81 il son dakika haberleri",
      "Türkiye haber haritası",
      "şehir gündemi takip",
      "kaynaklı ekonomi ve teknoloji haberleri",
      "doğrulanmış haber bülteni",
      "yapay zeka haber özeti",
      "il il güncel gelişmeler",
      "Türkiye üretim ve sanayi gündemi",
    ],
    references: [
      { href: "/finans-ai", anchor: "FinansAI canlı döviz, altın ve Borsa İstanbul piyasa takibi", context: "Ekonomi haberlerini anlık piyasa verileriyle karşılaştırın" },
      { href: "/indirim-ai", anchor: "İndirimAI 30-90-360 günlük gerçek fiyat geçmişi analizi", context: "Tüketici enflasyonu ve e-ticaret dip fiyat gözlemleri" },
      { href: "/puan-ai", anchor: "PuanAI doğrulanmış banka ve kredi kartı kampanyaları", context: "Güncel alışveriş ödül, puan ve taksit karşılaştırması" },
      { href: "/spor-ai", anchor: "SporAI Süper Lig xG tablosu ve UEFA ülke puanı radarı", context: "Doğrulanmış spor istatistikleri ve spor ekonomisi" },
    ],
  },
  "finans-ai": {
    title: "FinansAI neyi gösterir? · Canlı Döviz, Altın, BIST 100, Kripto ve Emtia Ekranı",
    lead: "FinansAI; TCMB gösterge döviz kurları (USD/TRY, EUR/TRY), 24 ayar gram altın, ons altın, Borsa İstanbul (BIST 100), Bitcoin ve Brent petrol vadeli emtia göstergelerini tek araştırma ekranında karşılaştırmak için tasarlanır.",
    body: "Her veri noktasında son fiyat kadar veri zamanı, 1 aylık eğilim grafiği ve birincil kaynak bağlamı gösterilir. Gösterilen değerler yatırım tavsiyesi değildir; finansal okuryazarlık ve üretim maliyet takibi için doğrulanmış piyasa referansı sunar.",
    points: [
      "TCMB, Borsa İstanbul ve küresel piyasa kaynaklı canlı veriler",
      "1 aylık kapanış eğilimi grafikleri ve yüzdesel değişim analizi",
      "Döviz, altın, hisse senedi, kripto para ve emtia filtreleme masası",
    ],
    keywords: [
      "canlı döviz kuru dolar euro takip",
      "gram altın ve çeyrek altın fiyat analizi",
      "BIST 100 borsa istanbul hisseleri",
      "Bitcoin BTC USD anlık piyasa verisi",
      "Brent petrol ve emtia fiyatları",
      "TCMB gösterge kurları",
      "finansal piyasa karşılaştırma ekranı",
      "üretim ve ihracat döviz maliyeti",
    ],
    references: [
      { href: "/puan-ai", anchor: "PuanAI kredi kartı puan, chip-para ve taksit hesaplama asistanı", context: "Harcama bütçenizi resmî banka kampanyalarıyla optimize edin" },
      { href: "/araba-ai", anchor: "ArabaAI sıfır araç liste fiyatları ve 2. el otomobil piyasası", context: "Taşıt finansmanı ve marka kampanyalarını inceleyin" },
      { href: "/ev-ai", anchor: "EvAI konut metrekare fiyatları ve kamu ihale taşınmaz analizi", context: "Gayrimenkul piyasa çarpanları ve bölgesel medyan verileri" },
      { href: "/haber-ai", anchor: "HaberAI Türkiye ekonomi ve şehir gündemi haritası", context: "Piyasaları etkileyen bölgesel ve ulusal gelişmeler" },
    ],
  },
  "puan-ai": {
    title: "PuanAI nasıl çalışır? · Resmî Kaynaklı Kredi Kartı Kampanya ve Taksit Asistanı",
    lead: "PuanAI; Akbank Axess, Yapı Kredi World, Garanti BBVA Bonus, İş Bankası Maximum, Ziraat Bankkart, QNB CardFinans ve Paraf gibi Türkiye'deki kredi kartı programlarının resmî kampanyalarını mağaza, harcama tutarı, ödül ve taksit koşullarına göre karşılaştırır.",
    body: "Yalnızca resmî banka sayfasında doğrulama kaydı bulunan aktif kampanyalar listelenir. Doğal dil destekli PuanAI sohbet asistanı, yapacağınız alışverişte hangi kartın ne kadar puan/indirim veya kaç taksit sunduğunu kaynak bağlantısıyla açıklar.",
    points: [
      "Resmî banka kaynaklarından otomatik doğrulanan kampanya kataloğu",
      "Mağaza, sektör, harcama tutarı ve taksit sayısına göre akıllı filtreleme",
      "Doğal dilde alışveriş senaryosu analizi ve yan yana kart karşılaştırma",
    ],
    keywords: [
      "güncel kredi kartı kampanyaları 2026",
      "en çok puan kazandıran kredi kartı",
      "Axess Bonus World Maximum Bankkart kampanya karşılaştırma",
      "peşin fiyatına taksit yapan kredi kartları",
      "market akaryakıt e-ticaret kart kampanyaları",
      "chip-para bonus worldpuan maxipuan hesaplama",
      "banka kampanya doğrulama asistanı",
      "alışveriş öncesi kredi kartı avantajı",
    ],
    references: [
      { href: "/indirim-ai", anchor: "İndirimAI e-ticaret gerçek indirim ve dönem dibi fiyat takibi", context: "Kart kampanyasını gerçek dip fiyatlı ürünlerle birleştirin" },
      { href: "/finans-ai", anchor: "FinansAI döviz, altın ve piyasa göstergeleri ekranı", context: "Finansal göstergeleri ve piyasa ritmini takip edin" },
      { href: "/araba-ai", anchor: "ArabaAI sıfır otomobil kampanyaları ve taşıt fiyat listesi", context: "Otomotiv markalarının aylık finansman ve taksit fırsatları" },
      { href: "/cozumler", anchor: "Üretir yapay zekâ çözümleri ve karar destek araçları", context: "Tüm tüketici ve üretici AI araçlarını keşfedin" },
    ],
  },
  "indirim-ai": {
    title: "İndirimAI fiyatı nasıl değerlendirir? · 30, 90 ve 360 Günlük Fiyat Geçmişi Radarı",
    lead: "İndirimAI bir ürünün yalnızca bugünkü etiketine bakmaz; Türkiye'nin önde gelen güvenilir e-ticaret mağazalarından toplanan fiyat gözlemlerini 30, 90 ve 360 günlük dönemlerle karşılaştırır. Yeterli geçmiş oluşmadan bir fiyatı “dönem dibi” olarak etiketlemez.",
    body: "Bu yaklaşım, yapay fiyat artışları sonrasında uygulanan sahte indirim etiketleriyle gerçek dönem dibi fırsatlarını birbirinden ayırır. Ürün kartında mağaza, son gözlenen fiyat, dönem en düşük/en yüksek/medyan değeri ve doğrudan mağaza bağlantısı birlikte gösterilir.",
    points: [
      "30, 90 ve 360 günlük gerçek fiyat geçmişi ve medyan karşılaştırması",
      "Sahte indirimleri eleyen katı gözlem sıklığı ve dönem dibi doğrulaması",
      "Amazon Türkiye, Hepsiburada, Trendyol, Teknosa, MediaMarkt, IKEA kaynaklı takip",
    ],
    keywords: [
      "fiyat geçmişi takip ve analiz",
      "gerçek indirim bulucu yapay zeka",
      "son 30 günün en düşük fiyatı",
      "e-ticaret fiyat karşılaştırma ve dip fiyat radarı",
      "elektronik telefon bilgisayar indirim takibi",
      "sahte indirim sorgulama aracı",
      "dönem dibi fırsat ürünleri",
      "mağaza fiyat geçmişi grafiği",
    ],
    references: [
      { href: "/puan-ai", anchor: "PuanAI kredi kartı kampanya ve taksit karşılaştırma motoru", context: "Dip fiyattaki ürünü en yüksek kart puanı ve taksitle alın" },
      { href: "/oyun-ai", anchor: "OyunAI Steam MENA-USD, Epic Games ve konsol indirim radarı", context: "Oyun ve oyuncu donanımı dönem dibi fırsatları" },
      { href: "/araba-ai", anchor: "ArabaAI sıfır araç kampanya ve fiyat değişimi analizi", context: "Otomotiv sektöründeki liste ve kampanya indirimleri" },
      { href: "/ev-ai", anchor: "EvAI bölgesel metrekare medyanı altı konut ve ihale fırsatları", context: "Gayrimenkulde bölge ortalamasının altındaki kayıtlar" },
    ],
  },
  "spor-ai": {
    title: "SporAI nasıl çalışır? · Süper Lig xG Beklentisi, UEFA Ülke Puanı ve Spor Ekonomisi",
    lead: "SporAI; Trendyol Süper Lig maç istatistiklerini, beklenen gol (xG) farklarını, UEFA ülke puanı katsayı hesaplamalarını, EuroLeague/Sultanlar Ligi verimlilik metriklerini ve Borsa İstanbul spor kulüplerinin mali tablolarını tek merkezde birleştirir.",
    body: "TFF, UEFA, TBF, TVF ve KAP bildirimlerine dayanan verilerle spekülatif transfer söylentileri yerine sahadaki ve bilançodaki ölçülebilir performansı fotoğraflı veri kartlarıyla sunar.",
    points: [
      "Süper Lig 90 dakika beklenen gol (xG) ve fikstür zorluk projeksiyonu",
      "UEFA ülke puanı sıralaması ve Şampiyonlar Ligi doğrudan katılım takibi",
      "EuroLeague, Voleybol Şampiyonlar Ligi ve BIST XSPOR spor ekonomisi verileri",
    ],
    keywords: [
      "Süper Lig puan durumu ve xG analizi",
      "UEFA ülke puanı Türkiye sıralaması",
      "EuroLeague Türk takımları istatistikleri",
      "BIST spor hisseleri bilanço analizi",
      "SporAI canlı spor veri merkezi",
    ],
    references: [
      { href: "/haber-ai", anchor: "HaberAI 81 il spor ve şehir gündemi haritası", context: "Şehir bazlı spor tesisleri ve yerel gelişmeler" },
      { href: "/finans-ai", anchor: "FinansAI Borsa İstanbul ve döviz kuru ekranı", context: "Kulüp bilançolarını etkileyen Euro kuru ve piyasa verisi" },
      { href: "/oyun-ai", anchor: "OyunAI espor turnuvaları ve spor oyunları indirim radarı", context: "EA Sports FC, NBA 2K ve espor gündemi" },
      { href: "/puan-ai", anchor: "PuanAI spor giyim ve yayıncı platform kart kampanyaları", context: "Forma, bilet ve abonelik harcamalarında kart puanları" },
    ],
  },
  "oyun-ai": {
    title: "OyunAI ne sunar? · PC/Konsol Oyun İndirim Radarı, Türk Stüdyoları ve Hafıza Oyunu",
    lead: "OyunAI; Steam MENA-USD bölgesel fiyat fırsatlarını, Epic Games haftalık ücretsiz oyunlarını, Game Pass/PlayStation Plus katalog analizlerini, Türk oyun stüdyolarının küresel başarılarını ve tarayıcı içi reklamsız zihin egzersizini tek kategoride buluşturur.",
    body: "Oyuncular ve geliştiriciler için doğrulanan mağaza indirimlerinin yanı sıra sayfa içinde doğrudan oynanabilen Memo kelime-hafıza oyunuyla görsel hafıza ve İngilizce kelime pratiği sağlar.",
    points: [
      "Steam MENA-USD, Epic Games, PlayStation ve Xbox gerçek indirim radarı",
      "Türkiye'nin küresel başarı yakalayan oyun stüdyoları ve espor takibi",
      "Kurulum gerektirmeyen, reklamsız İngilizce kelime ve görsel hafıza oyunu",
    ],
    keywords: [
      "Steam MENA USD oyun indirimleri",
      "Epic Games haftanın ücretsiz oyunları",
      "Türk oyun stüdyoları ve yerli oyunlar",
      "espor Türkiye turnuva takvimi",
      "OyunAI kelime hafıza oyunu",
    ],
    references: [
      { href: "/indirim-ai", anchor: "İndirimAI oyuncu donanımı, monitör ve ekran kartı dip fiyat takibi", context: "30-90-360 günlük donanım fiyat geçmişi" },
      { href: "/spor-ai", anchor: "SporAI Süper Lig xG ve Avrupa kupaları veri merkezi", context: "Canlı spor istatistikleri ve puan tabloları" },
      { href: "/kesfet", anchor: "Üretir Keşfet yerli oyun ve dijital uygulama kataloğu", context: "Türkiye'de geliştirilen oyun ve yazılımları keşfedin" },
      { href: "/puan-ai", anchor: "PuanAI dijital oyun mağazası ve elektronik kart kampanyaları", context: "Steam, PlayStation ve teknoloji alışverişlerinde nakit iade" },
    ],
  },
  "araba-ai": {
    title: "ArabaAI araştırmayı nasıl kolaylaştırır? · Sıfır Araç Liste Fiyatı ve Çoklu Platform 2. El Kıyaslama",
    lead: "ArabaAI, otomobil ilanlarını Türkiye haritası, fotoğraflı vitrin kartları ve karşılaştırma tablosu üzerinde incelerken Sahibinden, Arabam.com, Letgo ve resmî marka kaynaklı piyasa referanslarını markaların sıfır araç liste fiyatlarıyla yan yana gösterir.",
    body: "BYD, Renault, Toyota, Nissan, Peugeot, Ford, Volkswagen, Škoda, SEAT ve Togg gibi markaların resmî Türkiye fiyat listeleri ile Sahibinden, Arabam.com ve Letgo piyasa referans aralıkları telifsiz ve şeffaf biçimde karşılaştırılır.",
    points: [
      "Resmî sıfır araç liste fiyatları ve aylık marka kampanyaları takibi",
      "Sahibinden, Arabam.com ve Letgo referanslı fotoğraflı 2. el araç vitrini",
      "Haritalı şehir filtreleme ve sıfır/2. el fiyat sapması hesaplama",
    ],
    keywords: [
      "sıfır araç fiyatları 2026 güncel liste",
      "otomobil kampanyaları ve faizsiz taşıt kredisi",
      "ikinci el araba fiyat karşılaştırma haritası",
      "Sahibinden Arabam Letgo araç fiyat kıyaslama",
      "BYD Renault Toyota Volkswagen Peugeot fiyat listesi",
      "sıfır ve 2. el araç fiyat farkı analizi",
      "fotoğraflı otomobil ilan karşılaştırma",
      "ÖTV indirimli sıfır otomobil kampanyaları",
    ],
    references: [
      { href: "/ev-ai", anchor: "EvAI haritalı konut, arsa ve çoklu platform emlak analizi", context: "Konut ve taşınmaz piyasasındaki bölgesel fiyat referansları" },
      { href: "/finans-ai", anchor: "FinansAI döviz, altın ve piyasa göstergeleri takibi", context: "Otomotiv fiyatlarını etkileyen kur ve piyasa verileri" },
      { href: "/puan-ai", anchor: "PuanAI akaryakıt, şarj, bakım ve ekspertiz kart kampanyaları", context: "Araç sahiplerine özel banka bonus ve indirim fırsatları" },
      { href: "/ekosistem/marketplace", anchor: "Üretir Marketplace doğrulanmış ilan ve ticaret ekosistemi", context: "Haritalı ve kanıt odaklı pazar yeri altyapısı" },
    ],
  },
  "ev-ai": {
    title: "EvAI ilanları nasıl değerlendirir? · Çoklu Platform (Sahibinden, Emlakjet, Hepsiemlak, Letgo, Kamu) Konut Analizi",
    lead: "EvAI; Sahibinden, Emlakjet, Hepsiemlak, Letgo, TOKİ/Emlak Konut ve ilan.gov.tr kaynaklı telifsiz piyasa referans kayıtlarını fotoğraflı vitrin kartları, interaktif Türkiye haritası ve karşılaştırma tablosu üzerinde birleştirir.",
    body: "Her taşınmaz kaydı; il, ilçe, oda sayısı, brüt metrekare, birim m² bedeli, fotoğraf önizlemesi ve bölgesel metrekare medyanına göre hesaplanan EvAI skoruyla değerlendirilir. Satış komisyonu olmadan tüm platformlardaki fırsatları tek ekranda kıyaslamanızı sağlar.",
    points: [
      "Sahibinden, Emlakjet, Hepsiemlak, Letgo ve Kamu İhale referanslı fotoğraflı vitrin",
      "Harita ve tablo üzerinde eşzamanlı şehir, platform, bütçe ve m² filtreleme",
      "Bölgesel metrekare (m²) medyan referansı ve EvAI değerleme skoru",
    ],
    keywords: [
      "konut metrekare fiyatları ve bölge analizi",
      "Sahibinden Emlakjet Hepsiemlak Letgo konut karşılaştırma",
      "kamu ihale ve icradan satılık daire arsa duyuruları",
      "haritalı satılık ev ve fotoğraflı emlak vitrini",
      "İstanbul Ankara İzmir Bursa konut fiyat endeksi",
      "EvAI taşınmaz değerleme ve skorlama",
      "bölgesel emlak m2 birim fiyat hesaplama",
      "yatırımlık konut ve arsa fırsat radarı",
    ],
    references: [
      { href: "/araba-ai", anchor: "ArabaAI fotoğraflı otomobil vitrini ve sıfır araç fiyat referansı", context: "Araç piyasasında sıfır ve ikinci el fiyat karşılaştırması" },
      { href: "/finans-ai", anchor: "FinansAI altın, döviz ve Borsa İstanbul yatırım göstergeleri", context: "Gayrimenkul bütçesini finansal piyasalarla kıyaslayın" },
      { href: "/indirim-ai", anchor: "İndirimAI beyaz eşya, mobilya ve ev yaşam dip fiyat takibi", context: "Ev kurarken IKEA, Koçtaş ve teknoloji mağazası fırsatları" },
      { href: "/haber-ai", anchor: "HaberAI 81 il şehir gündemi ve yerel gelişmeler haritası", context: "İlgilendiğiniz şehirdeki güncel altyapı ve yerel haberler" },
    ],
  },
  harita: {
    title: "Üretir Harita neyi gösterir? · Türkiye Üretim ve Teknoloji Ekosistemi Haritası",
    lead: "Üretir Harita, Türkiye’de geliştirilen yapay zekâ araçlarını, yazılım ürünlerini ve üretici ekipleri coğrafi bağlamda keşfetmek için hazırlanır.",
    body: "Kayıtlardaki kaynak bağlantıları üreticinin veya ürünün kendi resmî sayfasına yönlendirir. Şehir bazlı görünüm, Türkiye'nin teknoloji ve üretim potansiyelini görünür kılar.",
    points: [
      "81 il bazlı yerli ürün, yazılım ve girişim keşfi",
      "Üretici ekip, kategori ve şehir ilişkisinin şeffaf haritalanması",
      "Doğrudan resmî ürün kaynaklarına ve inceleme sayfalarına geçiş",
    ],
    keywords: [
      "Türkiye teknoloji ve girişim haritası",
      "yerli yazılım ve yapay zeka girişimleri",
      "şehir bazlı üretim ekosistemi",
      "Türk startup ve teknoloji şirketleri dizini",
    ],
    references: [
      { href: "/kesfet", anchor: "Üretir Keşfet yerli uygulama, oyun ve dijital araç kataloğu", context: "Kategorilere göre tüm yerli ürünleri inceleyin" },
      { href: "/ekosistem", anchor: "Üretir Ekosistem bağımsız girişim ve şirket rehberi", context: "Türkiye'nin üretim ve teknoloji ağı" },
      { href: "/urun-gonder", anchor: "Üretir'e yeni ürün ve girişim kaydı gönderin", context: "Geliştirdiğiniz ürünü haritaya ekleyin" },
    ],
  },
  kesfet: {
    title: "Keşfet bölümünde ne bulursun? · Türkiye'nin Dijital Ürün, Uygulama ve AI Kataloğu",
    lead: "Keşfet; Türkiye’den uygulama, oyun, SaaS ve yapay zekâ araçlarını ihtiyaca göre taramak için hazırlanmış doğrulanmış ürün kataloğudur.",
    body: "Her ürün kaydı resmî ürün veya üretici kaynağıyla eşleştirilir. Kullanıcı ayrıntı sayfasından ürünün hangi problemi çözdüğünü ve resmî bağlantılarını görebilir.",
    points: [
      "Görev ve kategori odaklı yerli dijital ürün keşfi",
      "Doğrulanmış üretici bilgisi ve resmî web/mağaza bağlantıları",
      "Harita ve ekosistem rehberiyle tam entegre yapı",
    ],
    keywords: [
      "yerli mobil uygulama ve web araçları",
      "Türk yapımı oyunlar ve yapay zeka uygulamaları",
      "dijital ürün keşif platformu",
      "girişim ve yazılım vitrini",
    ],
    references: [
      { href: "/harita", anchor: "Üretir Harita üzerinde şehir şehir yerli ürünleri görün", context: "Coğrafi dağılım ve yerel teknoloji merkezleri" },
      { href: "/uygulamalar", anchor: "Üretir Uygulamalar ve AI çözümleri dizini", context: "Günlük hayatı kolaylaştıran araçlar" },
      { href: "/araclar", anchor: "Üretir 8 ana AI kategorisi ve WhatsApp kanalları", context: "HaberAI, PuanAI, İndirimAI, FinansAI, SporAI, OyunAI, ArabaAI ve EvAI" },
    ],
  },
};

export function SeoExplainer({ slug }: { slug: SeoExplainerKey }) {
  const item = copy[slug];
  const canonicalUrl = `https://www.uretir.com/${slug}`;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Üretir", item: "https://www.uretir.com" },
        { "@type": "ListItem", position: 2, name: item.title.split("·")[0].trim(), item: canonicalUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: item.title,
      url: canonicalUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      inLanguage: "tr-TR",
      description: item.lead,
      featureList: item.points,
      keywords: item.keywords.join(", "),
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TRY",
      },
      publisher: {
        "@type": "Organization",
        name: "Üretir",
        url: "https://www.uretir.com",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: item.title.split("·")[0].trim(),
          acceptedAnswer: {
            "@type": "Answer",
            text: `${item.lead} ${item.body}`,
          },
        },
        {
          "@type": "Question",
          name: `${slug.toUpperCase()} verileri hangi kaynaklardan ve hangi sıklıkla güncellenir?`,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${item.points.join(". ")}. Veriler her gün 09:00, 12:00, 15:00 ve 20:00 saatlerinde uretir.com, Instagram (@uretirai), WhatsApp kanalları ve Telegram (@uretirbot) üzerinde senkronize güncellenir.`,
          },
        },
      ],
    },
  ];

  return (
    <section className="section-wrap seo-explainer" aria-labelledby={"seo-" + slug}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <p className="rule-label">Nasıl çalışır? · Rehber ve Referans Ağı</p>
      <h2 id={"seo-" + slug}>{item.title}</h2>
      <div className="seo-explainer-copy">
        <p>{item.lead}</p>
        <p>{item.body}</p>
      </div>
      <ul>
        {item.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>

      <div className="mt-10 grid gap-6 border-t border-black/10 pt-8 dark:border-white/10 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            İlgili Üretir AI Araçları ve Referans Bağlantılar
          </p>
          <div className="mt-4 grid gap-3">
            {item.references.map((ref) => (
              <Link
                key={ref.href}
                href={ref.href}
                className="group block rounded-xl border border-black/10 p-3.5 transition hover:border-[#769d32] dark:border-white/10"
              >
                <strong className="block text-sm font-bold group-hover:text-[#769d32]">
                  {ref.anchor} →
                </strong>
                <span className="mt-1 block text-xs text-muted">{ref.context}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            Arama ve Araştırma Odak Kelimeleri (SEO Referans Dizini)
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-muted dark:border-white/10 dark:bg-white/[0.04]"
              >
                {kw}
              </span>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-black/10 bg-black/[0.02] p-4 text-xs leading-relaxed text-muted dark:border-white/10 dark:bg-white/[0.02]">
            <strong className="block text-[color:var(--foreground)]">
              Otonom Yayın ve Doğal Sesli Motion-Graphic Video Akışı (09:00 · 12:00 · 15:00 · 20:00)
            </strong>
            <p className="mt-1">
              Üretir AI verileri her gün 09:00, 12:00, 15:00 ve 20:00 saatlerinde dikey motion-graphic kısa videolara dönüştürülerek{" "}
              <a
                href="https://www.instagram.com/uretirai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                Instagram (@uretirai)
              </a>
              ,{" "}
              <a
                href="https://www.youtube.com/@Uretir"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                YouTube (@Uretir)
              </a>
              ,{" "}
              <a
                href="https://t.me/uretirbot"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline"
              >
                Telegram (@uretirbot)
              </a>{" "}
              ve WhatsApp kanallarında yayımlanır. Kurumsal reklam ve sponsorluk iş birlikleri için{" "}
              <Link href="/iletisim" className="font-semibold underline">
                İletişim ve Reklam Masası
              </Link>{" "}
              üzerinden bize ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
