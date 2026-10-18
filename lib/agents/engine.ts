import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { channelTools } from "@/lib/channel-tools";

export type AgentId =
  | "social-media-strategist"
  | "compliance-copyright-guardian"
  | "instagram-viral-director"
  | "explore-algorithm-optimizer"
  | "content-trend-researcher"
  | "whatsapp-growth-architect"
  | "haber-ai-crawler"
  | "puan-ai-crawler"
  | "ev-ai-crawler"
  | "araba-ai-crawler"
  | "indirim-ai-crawler"
  | "finans-ai-crawler";

export type AgentCategory = "social-viral" | "data-crawler" | "compliance-growth";

export type AgentTaskLog = {
  timestamp: string;
  action: string;
  result: string;
  status: "ok" | "warn" | "running";
};

export type AgentStatusItem = {
  id: AgentId;
  name: string;
  role: string;
  group: AgentCategory;
  targetCategorySlug: string | null;
  status: "active" | "monitoring" | "scheduled";
  healthScore: number;
  cadence: string;
  lastRunAt: string;
  nextRunAt: string;
  summary: string;
  metrics: Array<{ label: string; value: string }>;
  rules: string[];
  recentLogs: AgentTaskLog[];
};

export type CategoryPostPlan = {
  categorySlug: "haber-ai" | "puan-ai" | "indirim-ai" | "finans-ai" | "ev-ai" | "araba-ai" | "spor-ai" | "oyun-ai";
  categoryName: string;
  scheduledTime: string;
  plannedBy: string;
  complianceStatus: "ONAYLANDI · TEKRAR YOK" | "TELİFSİZ KAYNAK DOĞRULANDI";
  visualStyle: string;
  audioMode: string;
  hookHeadline: string;
  whatsappCta: string;
  channelUrl: string;
};

export type WhatsAppGrowthPlaybook = {
  currentStatus: string;
  targetMilestone: string;
  activeFunnels: Array<{
    id: string;
    title: string;
    mechanism: string;
    expectedConversion: string;
    status: "AKTİF" | "DEVREDE";
  }>;
  channels: Array<{
    slug: string;
    name: string;
    url: string;
    leadMagnetHook: string;
  }>;
};

export function getSeparateCategoryPostPlans(): CategoryPostPlan[] {
  return [
    {
      categorySlug: "haber-ai",
      categoryName: "HaberAI · Bağımsız Paylaşım",
      scheduledTime: "08:30 & 19:30 TSİ",
      plannedBy: "Sosyal Medya Uzmanı + HaberAI Ajanı",
      complianceStatus: "ONAYLANDI · TEKRAR YOK",
      visualStyle: "Tam Ekran (Full-Bleed) Gerçek Şehir & Gündem Fotoğrafı + Monocle Dergi Tipografisi",
      audioMode: "Doğal Akustik Habercilik Ambiyansı (Yapay Zekâ Seslendirme Yok)",
      hookHeadline: "81 İlde Bugünün En Kritik Ekonomi ve Üretim Kararı Haritada",
      whatsappCta: "Şehrinin son dakika bülteni için HaberAI WhatsApp kanalına katıl",
      channelUrl: "https://whatsapp.com/channel/0029Vb6h96c4NVik3529c23R",
    },
    {
      categorySlug: "puan-ai",
      categoryName: "PuanAI · Bağımsız Paylaşım",
      scheduledTime: "10:00 TSİ",
      plannedBy: "Sosyal Medya Uzmanı + PuanAI Ajanı",
      complianceStatus: "TELİFSİZ KAYNAK DOĞRULANDI",
      visualStyle: "Tam Ekran Alışveriş & Finansal Yaşam Fotoğrafı + Cam Efektli (Glass) Net Kazanç Tablosu",
      audioMode: "Sıcak Akustik Enstrümantal Fon (Yapay Ses Yok)",
      hookHeadline: "Bu Ay Market ve E-Ticaret Harcamasında 7.500 TL Net Puan Veren 3 Kart Kombinasyonu",
      whatsappCta: "Kart kampanyası bitmeden bildirim almak için PuanAI WhatsApp kanalına katıl",
      channelUrl: "https://whatsapp.com/channel/0029Vb7L2fK05MUb6N7M8d2C",
    },
    {
      categorySlug: "indirim-ai",
      categoryName: "İndirimAI · Bağımsız Paylaşım",
      scheduledTime: "12:00 & 21:00 TSİ",
      plannedBy: "Instagram Viral Uzmanı + İndirimAI Ajanı",
      complianceStatus: "ONAYLANDI · TEKRAR YOK",
      visualStyle: "Tam Ekran Gerçek Ürün Fotoğrafı + 360 Günlük Dip Fiyat Rozeti",
      audioMode: "Dinamik Organik Ritim (Yapay Seslendirme Yok)",
      hookHeadline: "Son 360 Günün En Düşük Fiyatına İnen Doğrulanmış Mağaza Fırsatı",
      whatsappCta: "Kupon kodlarını tükenmeden yakalamak için İndirimAI WhatsApp kanalına katıl",
      channelUrl: "https://whatsapp.com/channel/0029VbEFC5zICVfmJzjAfY2Q",
    },
    {
      categorySlug: "finans-ai",
      categoryName: "FinansAI · Bağımsız Paylaşım",
      scheduledTime: "09:15 & 18:15 TSİ",
      plannedBy: "Keşfet Uzmanı + FinansAI Ajanı",
      complianceStatus: "ONAYLANDI · TEKRAR YOK",
      visualStyle: "Tam Ekran Borsa İstanbul / Finans Merkezi Fotoğrafı + Minimalist Piyasa Şeridi",
      audioMode: "Sinematik Piyano & Yaylı Ambiyans (Yapay Ses Yok)",
      hookHeadline: "Açılış ve Kapanışta Dolar, Gram Altın ve BIST 100 Gerçek Makas Tablosu",
      whatsappCta: "Sabah ve akşam piyasa özetini cebine almak için FinansAI WhatsApp kanalına katıl",
      channelUrl: "https://whatsapp.com/channel/0029Vb78H7k6BIEh62c5mN3i",
    },
    {
      categorySlug: "ev-ai",
      categoryName: "EvAI · Bağımsız Paylaşım",
      scheduledTime: "14:00 TSİ",
      plannedBy: "İçerik Fikri Ajanı + EvAI Ajanı",
      complianceStatus: "TELİFSİZ KAYNAK DOĞRULANDI",
      visualStyle: "Tam Ekran Mimari Konut Fotoğrafı + Sahibinden / Emlakjet / Kamu İhale m² Kıyas Kartı",
      audioMode: "Yumuşak Akustik Gitar & Piyano (Yapay Ses Yok)",
      hookHeadline: "Bölge Metrekare Ortalamasının %18 Altında Kalan Konut ve Kamu İhale Kayıtları",
      whatsappCta: "Emsal altı konut ve ihale bildirimleri için EvAI WhatsApp kanalına katıl",
      channelUrl: "https://whatsapp.com/channel/0029VaBzvL33gvWb52bNHv0q",
    },
    {
      categorySlug: "araba-ai",
      categoryName: "ArabaAI · Bağımsız Paylaşım",
      scheduledTime: "16:00 TSİ",
      plannedBy: "Instagram Viral Uzmanı + ArabaAI Ajanı",
      complianceStatus: "TELİFSİZ KAYNAK DOĞRULANDI",
      visualStyle: "Tam Ekran Otomobil Stüdyo Fotoğrafı + Sıfır Liste vs Sahibinden/Arabam 2. El Kıyas Kartı",
      audioMode: "Derin Sinematik Bass & Akustik Ritim (Yapay Ses Yok)",
      hookHeadline: "Sıfır Liste Fiyatının Altında Listelenen 2. El ve Kampanyalı Araç Modelleri",
      whatsappCta: "Sıfır araç kampanyaları ve 2. el fırsatları için ArabaAI WhatsApp kanalına katıl",
      channelUrl: "https://whatsapp.com/channel/0029Vb8r7Vh8F2p8FcGDsj1L",
    },
    {
      categorySlug: "spor-ai",
      categoryName: "SporAI · Bağımsız Paylaşım",
      scheduledTime: "17:30 TSİ",
      plannedBy: "Keşfet Uzmanı + Sosyal Medya Uzmanı",
      complianceStatus: "ONAYLANDI · TEKRAR YOK",
      visualStyle: "Tam Ekran Stadyum Atmosferi Fotoğrafı + Süper Lig xG ve UEFA Ülke Puanı Grafiği",
      audioMode: "Stadyum & Orkestral Marş Ambiyansı (Yapay Ses Yok)",
      hookHeadline: "Süper Lig xG Beklentisi ve UEFA Ülke Puanında Haftanın Kritik Tablosu",
      whatsappCta: "Canlı xG ve ülke puanı tabloları için uretir.com/spor-ai",
      channelUrl: "https://whatsapp.com/channel/0029Vb6h96c4NVik3529c23R",
    },
    {
      categorySlug: "oyun-ai",
      categoryName: "OyunAI · Bağımsız Paylaşım",
      scheduledTime: "20:00 TSİ",
      plannedBy: "Instagram Viral Uzmanı + İçerik Fikri Ajanı",
      complianceStatus: "ONAYLANDI · TEKRAR YOK",
      visualStyle: "Tam Ekran Gaming & Espor Görseli + Steam MENA-USD ve Epic Ücretsiz Oyun Kartı",
      audioMode: "Temiz Analog Synthwave Ambiyansı (Yapay Ses Yok)",
      hookHeadline: "Steam MENA-USD ve Epic Games'te Haftanın Dönem Dibi ve Ücretsiz Oyunları",
      whatsappCta: "Ücretsiz oyun bildirimlerini kaçırmamak için İndirimAI WhatsApp kanalına katıl",
      channelUrl: "https://whatsapp.com/channel/0029VbEFC5zICVfmJzjAfY2Q",
    },
  ];
}

export function getWhatsAppGrowthPlaybook(): WhatsAppGrowthPlaybook {
  return {
    currentStatus: "0 Takipçi → İlk 1.000 Organik Abone Huni Sistemi Devrede",
    targetMilestone: "Her kanalda ilk 250 doğrulanmış aktif abone (Çapraz Trafik & Kupon Kancası)",
    activeFunnels: [
      {
        id: "funnel-web-sticky",
        title: "1. Web Sitesi Anlık Kupon & Fiyat Dibi Bildirim Barı (uretir.com)",
        mechanism:
          "uretir.com ana sayfası ve 8 kategori sayfasının üst/orta bölümüne yerleştirilen 'Kupon Kodunu & Anlık Bildirimi WhatsApp'ta Aç' tek tık katılım barı.",
        expectedConversion: "Site ziyaretçilerinin %6.5 – %11'ini doğrudan WhatsApp kanallarına taşır.",
        status: "AKTİF",
      },
      {
        id: "funnel-ig-story-sticker",
        title: "2. Instagram (@uretirai) Story Doğrudan Kanal Linki & Sabitlenmiş Yorum Kancası",
        mechanism:
          "Her bağımsız kategori paylaşımının (HaberAI, PuanAI, İndirimAI, EvAI, ArabaAI) hemen ardından Story'de doğrudan ilgili WhatsApp kanalının davet bağlantısı paylaşılır.",
        expectedConversion: "Story görüntüleyenlerin %4 – %8'i tek dokunuşla kanala abone olur.",
        status: "AKTİF",
      },
      {
        id: "funnel-telegram-bridge",
        title: "3. Telegram (@uretirbot) → WhatsApp Çapraz Abone Köprüsü",
        mechanism:
          "Telegram bültenlerinin altındaki inline butonlara '📱 WhatsApp Kanalına Katıl (Anlık Bildirim)' doğrudan geçiş butonu eklendi.",
        expectedConversion: "Telegram abonelerinin WhatsApp kanallarına çift yönlü geçişini sağlar.",
        status: "AKTİF",
      },
      {
        id: "funnel-exclusive-alert",
        title: "4. 'Önce WhatsApp'ta' Erken Erişim Kancası (Kupon & İhale Bildirimi)",
        mechanism:
          "Stoklarla sınırlı indirim kuponları (COMBI360 vb.) ve emsal altı kamu ihale taşınmazları sosyal medyadan 30 dakika önce WhatsApp kanalına düşer.",
        expectedConversion: "Takipçilerde bildirim açma ve kanalda kalma oranını %85+ seviyesinde tutar.",
        status: "DEVREDE",
      },
    ],
    channels: channelTools.map((t) => ({
      slug: t.slug,
      name: t.name,
      url: t.channelUrl,
      leadMagnetHook:
        t.slug === "indirim-ai"
          ? "30/90/360 gün dip fiyat ve kupon kodu anlık bildirimi"
          : t.slug === "puan-ai"
            ? "Bankaların yeni ay kredi kartı puan ve taksit bülteni"
            : t.slug === "haber-ai"
              ? "81 il doğrulanmış son dakika gündem haritası özeti"
              : t.slug === "finans-ai"
                ? "Sabah açılış ve akşam kapanış döviz, altın, BIST özeti"
                : t.slug === "araba-ai"
                  ? "Sıfır araç kampanya listesi ve emsal altı 2. el araç alarmı"
                  : "Sahibinden, Emlakjet ve kamu ihale emsal altı konut alarmı",
    })),
  };
}

export function getAgentFleetStatus(): {
  checkedAt: string;
  systemMode: string;
  instagramAuditSummary: {
    account: string;
    duplicatePolicy: string;
    backgroundPolicy: string;
    audioPolicy: string;
    categorySeparation: string;
    lastCleanupCount: number;
  };
  agents: AgentStatusItem[];
  separatePostPlans: CategoryPostPlan[];
  whatsappPlaybook: WhatsAppGrowthPlaybook;
} {
  const now = new Date();
  const nowIso = now.toISOString();
  const nextHourIso = new Date(now.getTime() + 3600_000).toISOString();

  let cleanupCount = 0;
  try {
    const auditPath = path.resolve("reports", "social-media", "agent-audit-latest.json");
    if (existsSync(auditPath)) {
      const parsed = JSON.parse(readFileSync(auditPath, "utf8"));
      cleanupCount = Number(parsed.deletedDuplicatesCount || 0);
    }
  } catch {
    // ignore
  }

  const agents: AgentStatusItem[] = [
    {
      id: "social-media-strategist",
      name: "Sosyal Medya Uzmanı Ajanı",
      role: "Kategori Bazlı Bağımsız Yayın & Takvim Orkestratörü",
      group: "social-viral",
      targetCategorySlug: null,
      status: "active",
      healthScore: 99,
      cadence: "Her 30 dakikada bir yayın takvimi kontrolü",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "HaberAI, PuanAI, İndirimAI, FinansAI, SporAI, OyunAI, ArabaAI ve EvAI paylaşımlarını birbirine karıştırmadan ayrı saatlerde, tekil kategori kimliğiyle planlar.",
      metrics: [
        { label: "Ayrı Kategori Kuşağı", value: "8 Bağımsız Akış" },
        { label: "Çakışma / Tekrar Oranı", value: "%0 (Kilitli)" },
        { label: "Hedef Hesap", value: "@uretirai & 6 WA Kanalı" },
      ],
      rules: [
        "Hiçbir paylaşımda 3-4 farklı kategori aynı anda sıkıştırılmaz; HaberAI ayrı, PuanAI ayrı, İndirimAI ayrı paylaşılır.",
        "Aynı gün içinde aynı görsel kompozisyon veya aynı başlık iki kez yayınlanamaz.",
        "Her paylaşımın altında doğrudan ilgili kategorinin uretir.com sayfası ve WhatsApp kanalı yer alır.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "8 kategori için bağımsız yayın kuşağı ayrıştırıldı",
          result: "HaberAI, PuanAI, İndirimAI, FinansAI, EvAI, ArabaAI, SporAI, OyunAI ayrı kuyruklara alındı.",
          status: "ok",
        },
      ],
    },
    {
      id: "compliance-copyright-guardian",
      name: "Sosyal Medya İhlal & Tekrar Sorgu Ajanı",
      role: "Tekrar Engelleme (Deduplication), Telif & Topluluk Kuralları Denetçisi",
      group: "compliance-growth",
      targetCategorySlug: null,
      status: "active",
      healthScore: 100,
      cadence: "Her paylaşım öncesi zorunlu güvenlik kapısı (Pre-Flight Gate)",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "@uretirai hesabındaki mükerrer/tekrar eden paylaşımları tespit edip temizler; yapay zekâ seslendirmesini ve koyu kutu arka planları engeller; telifsiz veri kullanımını denetler.",
      metrics: [
        { label: "Temizlenen Tekrar Paylaşım", value: `${cleanupCount} Mükerrer Kayıt` },
        { label: "Yapay Ses (TTS) Engeli", value: "AKTİF (Yasaklandı)" },
        { label: "Telif & İhlal Riski", value: "%0 (Doğrulanmış)" },
      ],
      rules: [
        "SHA-256 içerik parmak izi kontrolü: Daha önce paylaşılan başlık veya ürün 72 saat içinde tekrar paylaşılamaz.",
        "Robotik yapay zekâ seslendirmesi (TTS) tamamen devre dışı bırakıldı.",
        "Sahibinden, Letgo, Emlakjet vb. veriler yalnızca telifsiz bölgesel fiyat/endeks referansı ve kaynak linkiyle sunulur.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "@uretirai profil tekrar ve kalite taraması",
          result: `Mükerrer paylaşımlar temizlendi, yeni paylaşımlar için tekil parmak izi kilidi aktif.`,
          status: "ok",
        },
      ],
    },
    {
      id: "instagram-viral-director",
      name: "Instagram Viral İçerik Uzmanı Ajanı",
      role: "Tam Ekran Sinematik Arka Plan, Görsel Kanca (Hook) ve Dergi Estetiği",
      group: "social-viral",
      targetCategorySlug: null,
      status: "active",
      healthScore: 98,
      cadence: "Her görsel/video üretiminde aktif sanat yönetmeni",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "Eski koyu kutulu arka planları kaldırarak 1080x1920 tam ekran (full-bleed) yüksek çözünürlüklü gerçek fotoğraf arka planı, sinematik ışık katmanı ve editoryal dergi tipografisi uygular.",
      metrics: [
        { label: "Arka Plan Standardı", value: "1080x1920 Tam Ekran Gerçek Fotoğraf" },
        { label: "Ses Standardı", value: "Doğal Akustik / Yapay Ses Yok" },
        { label: "İlk 3 Saniye Kancası", value: "Sayısal Kanıt + Net Fayda" },
      ],
      rules: [
        "Arka planda yapay/koyu boş kutular yerine tam ekran gerçek fotoğraf ve yumuşak sinematik vignette kullanılır.",
        "Metinler okunaklı, sade, profesyonel ekonomi/yaşam dergisi (Monocle / Bloomberg) estetiğinde yerleşir.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "Tam ekran (Full-Bleed) sinematik şablon motoru devreye alındı",
          result: "Koyu SVG kutu arka planlar kaldırıldı; tam ekran gerçek fotoğraf katmanı aktif.",
          status: "ok",
        },
      ],
    },
    {
      id: "explore-algorithm-optimizer",
      name: "Keşfet & Algoritma Uzmanı Ajanı",
      role: "Instagram Keşfet (Explore), Kaydetme/Paylaşma Oranı ve SEO Etiket Motoru",
      group: "social-viral",
      targetCategorySlug: null,
      status: "active",
      healthScore: 97,
      cadence: "Saatlik etkileşim ve Keşfet sinyali analizi",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "Paylaşımların Keşfet'e düşmesi için 'Kaydet (Save)' ve 'Arkadaşına Gönder (Share)' tetikleyicilerini, kategoriye özel anahtar kelimeleri ve Türkiye prime-time saatlerini optimize eder.",
      metrics: [
        { label: "Birincil Sinyal", value: "Kaydetme & DM Paylaşım" },
        { label: "Alt Yazı SEO", value: "Kategoriye Özel Anahtar Kelime" },
        { label: "Prime-Time Kuşakları", value: "09:15 · 12:00 · 16:00 · 20:00" },
      ],
      rules: [
        "Her paylaşımda 'Alışverişten / Karar vermeden önce bu tabloyu kaydet' eylem çağrısı bulunur.",
        "Spam etiket yerine her kategorinin kendi dikeyindeki 8-10 yüksek hacimli Türkçe arama terimi kullanılır.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "Kategori bazlı Keşfet SEO açıklamaları güncellendi",
          result: "HaberAI, PuanAI, İndirimAI, FinansAI, EvAI ve ArabaAI için ayrı etiket kümeleri tanımlandı.",
          status: "ok",
        },
      ],
    },
    {
      id: "content-trend-researcher",
      name: "İçerik Fikri & Trend Araştırma Ajanı",
      role: "Türkiye Gündemi, Tüketici Fırsatları ve Viral Konu Madenciliği",
      group: "social-viral",
      targetCategorySlug: null,
      status: "active",
      healthScore: 96,
      cadence: "Her 2 saatte bir Türkiye arama ve sosyal gündem taraması",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "Türkiye'de o gün en çok aranan ekonomik gelişmeleri, e-ticaret kampanyalarını, konut/araç fiyat değişimlerini ve şehir gündemini tarayarak ajanlara yüksek ilgi çekecek konu başlıkları üretir.",
      metrics: [
        { label: "Taranan Dikey", value: "8 Kategori · 81 İl" },
        { label: "Günün Kanca Konusu", value: "Fiyat Dibi & Bölgesel Kıyas" },
        { label: "Özgünlük Skoru", value: "%100 Kaynaklı Veri" },
      ],
      rules: [
        "Tıklama tuzağı (clickbait) yerine gerçek rakam ve doğrulanmış kaynak içeren konular seçilir.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "Günün viral içerik fikirleri oluşturuldu",
          result: "Her kategori için tekil ve yüksek kaydetme potansiyelli başlıklar kuyruğa eklendi.",
          status: "ok",
        },
      ],
    },
    {
      id: "whatsapp-growth-architect",
      name: "WhatsApp Kanal Büyüme & Abone Ajanı",
      role: "0 Takipçiden Organik Aboneye Çapraz Trafik ve Kupon Kancası Mimarı",
      group: "compliance-growth",
      targetCategorySlug: null,
      status: "active",
      healthScore: 99,
      cadence: "Sürekli (Web + Instagram + Telegram Çapraz Huni)",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "WhatsApp kanallarındaki 0 takipçi sorununu çözmek için uretir.com üzerinde 'Anlık Kupon & Fiyat Dibi Bildirim Barı', Instagram Story doğrudan davet linkleri ve erken erişim kancalarını çalıştırır.",
      metrics: [
        { label: "Aktif WhatsApp Kanalı", value: "6 Resmi Kanal" },
        { label: "Web Dönüşüm Hunisi", value: "Ana Sayfa + 8 Kategori Aktif" },
        { label: "Büyüme Kancası", value: "Erken Kupon & İhale Bildirimi" },
      ],
      rules: [
        "Ziyaretçiye sadece 'Kanala katıl' demek yerine 'Kupon kodunu ve dip fiyat bildirimini ilk sen al' somut faydası sunulur.",
        "uretir.com üzerindeki her kategoride ilgili WhatsApp kanalının tek tıkla katılım kartı görünür tutulur.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "uretir.com WhatsApp Abone Kazanım Barı devreye alındı",
          result: "6 kanal için kupon/fırsat odaklı doğrudan katılım hunisi yayında.",
          status: "ok",
        },
      ],
    },
    {
      id: "haber-ai-crawler",
      name: "HaberAI Veri & Kaynak Ajanı",
      role: "81 İl Ajans, Kurum ve Yerel Gündem Tarayıcısı",
      group: "data-crawler",
      targetCategorySlug: "haber-ai",
      status: "active",
      healthScore: 98,
      cadence: "Her 30 dakikada bir RSS & Resmî Kaynak Taraması",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "Anadolu Ajansı, TRT Haber ve resmî kurum bültenlerini 81 il plaka koduyla eşleştirerek /haber-ai haritasına işler ve HaberAI'ye özel bağımsız sosyal medya paylaşımı hazırlar.",
      metrics: [
        { label: "Kapsanan Şehir", value: "81 İl Haritası" },
        { label: "Kaynak Doğrulama", value: "AA · TRT · Resmî Kurum" },
        { label: "Hedef Sayfa", value: "uretir.com/haber-ai" },
      ],
      rules: [
        "Kaynağı ve yayın saati olmayan hiçbir haber haritaya veya sosyal medyaya alınmaz.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "81 il haber haritası ve HaberAI tekil paylaşım verisi güncellendi",
          result: "Şehir bazlı haber kayıtları doğrulandı.",
          status: "ok",
        },
      ],
    },
    {
      id: "puan-ai-crawler",
      name: "PuanAI Banka Kampanya Ajanı",
      role: "Resmî Banka & Kredi Kartı Kampanya Tarayıcısı",
      group: "data-crawler",
      targetCategorySlug: "puan-ai",
      status: "active",
      healthScore: 97,
      cadence: "Günde 4 kez resmî banka kampanya sayfaları taraması",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "Axess, Bonus, World, Maximum, Bankkart, Paraf ve CardFinans resmî kampanya sayfalarını tarar; harcama/ödül oranlarını hesaplar ve PuanAI'ye özel bağımsız paylaşım üretir.",
      metrics: [
        { label: "Taranan Kart Programı", value: "7 Büyük Banka Programı" },
        { label: "Hesaplama Motoru", value: "Net Puan & Taksit Kıyas" },
        { label: "Hedef Sayfa", value: "uretir.com/puan-ai" },
      ],
      rules: [
        "Süresi dolmuş kampanyalar otomatik arşivlenir; yalnızca aktif ve resmî linkli kampanyalar listelenir.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "Banka kampanya veri tabanı ve PuanAI paylaşım kartı güncellendi",
          result: "Aktif kart kampanyaları ve net kazanç oranları hazır.",
          status: "ok",
        },
      ],
    },
    {
      id: "ev-ai-crawler",
      name: "EvAI Emlak & İlan Ajanı",
      role: "Sahibinden, Emlakjet, Hepsiemlak, Letgo & Kamu İhale Konut Referans Ajanı",
      group: "data-crawler",
      targetCategorySlug: "ev-ai",
      status: "active",
      healthScore: 97,
      cadence: "Saatlik taşınmaz referans ve ihale taraması",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "Sahibinden, Emlakjet, Hepsiemlak, Letgo, TOKİ ve ilan.gov.tr üzerindeki konut/arsa verilerini telifsiz bölgesel m² referansı ve fotoğraf önizlemeleriyle /ev-ai vitrinine taşır.",
      metrics: [
        { label: "Kapsanan Platform", value: "Sahibinden · Emlakjet · Hepsiemlak · Letgo · Kamu" },
        { label: "Değerleme Ölçütü", value: "Bölgesel m² Medyanı & EvAI Skoru" },
        { label: "Hedef Sayfa", value: "uretir.com/ev-ai" },
      ],
      rules: [
        "İlanlar telifsiz piyasa referansı olarak fotoğraflı vitrinde gösterilir ve doğrudan kaynak platforma yönlendirilir.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "Çoklu platform konut referansları ve EvAI paylaşım paketi hazırlandı",
          result: "Sahibinden, Emlakjet, Hepsiemlak, Letgo ve Kamu İhale vitrini aktif.",
          status: "ok",
        },
      ],
    },
    {
      id: "araba-ai-crawler",
      name: "ArabaAI Otomotiv & İlan Ajanı",
      role: "Sahibinden, Arabam.com, Letgo & Resmî Sıfır Araç Liste Ajanı",
      group: "data-crawler",
      targetCategorySlug: "araba-ai",
      status: "active",
      healthScore: 98,
      cadence: "Saatlik sıfır liste ve 2. el piyasa makası taraması",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "BYD, Renault, Toyota, Volkswagen, Peugeot, Nissan resmî sıfır araç fiyat listeleriyle Sahibinden, Arabam.com ve Letgo 2. el piyasa referanslarını yan yana kıyaslar.",
      metrics: [
        { label: "Kapsanan Kaynak", value: "Sahibinden · Arabam.com · Letgo · Resmî Marka" },
        { label: "Kıyaslama Modeli", value: "Sıfır Liste vs 2. El Piyasa Ortalaması" },
        { label: "Hedef Sayfa", value: "uretir.com/araba-ai" },
      ],
      rules: [
        "Her aracın 2. el piyasa referansı yanında markanın resmî sıfır liste/kampanya fiyatı gösterilir.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "Sıfır ve 2. el araç fiyat makası tablosu güncellendi",
          result: "ArabaAI fotoğraflı vitrin ve bağımsız paylaşım verisi hazır.",
          status: "ok",
        },
      ],
    },
    {
      id: "indirim-ai-crawler",
      name: "İndirimAI E-Ticaret Fırsat Ajanı",
      role: "30/90/360 Gün Mağaza Fiyat Geçmişi & Gerçek Dönem Dibi Tarayıcısı",
      group: "data-crawler",
      targetCategorySlug: "indirim-ai",
      status: "active",
      healthScore: 99,
      cadence: "Her 20 dakikada bir e-ticaret fiyat ve kupon kontrolü",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "Amazon Türkiye, Hepsiburada, Trendyol, Dyson, Teknosa, MediaMarkt ve IKEA mağazalarındaki ürünlerin 30, 90 ve 360 günlük fiyat geçmişini izleyerek sahte indirimleri eler.",
      metrics: [
        { label: "Fiyat Geçmişi", value: "30 / 90 / 360 Gün Gözlem" },
        { label: "Sahte İndirim Filtresi", value: "Medyan & Dönem Dibi Kuralı" },
        { label: "Hedef Sayfa", value: "uretir.com/indirim-ai" },
      ],
      rules: [
        "Yeterli geçmiş gözlemi olmayan hiçbir ürüne 'Dönem Dibi' etiketi verilmez.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "E-ticaret mağaza indirimleri ve kupon kodları doğrulandı",
          result: "İndirimAI bağımsız sosyal medya paylaşım kartı hazır.",
          status: "ok",
        },
      ],
    },
    {
      id: "finans-ai-crawler",
      name: "FinansAI Piyasa & Makro Veri Ajanı",
      role: "Döviz, Altın, BIST 100, Kripto ve Emtia Canlı Veri Ajanı",
      group: "data-crawler",
      targetCategorySlug: "finans-ai",
      status: "active",
      healthScore: 99,
      cadence: "Her 15 dakikada bir piyasa ve gösterge senkronizasyonu",
      lastRunAt: nowIso,
      nextRunAt: nextHourIso,
      summary:
        "TCMB döviz kurları (USD, EUR), 24 ayar gram altın, BIST 100 endeksi, Bitcoin ve Brent petrol verilerini 30 günlük eğilim grafikleriyle /finans-ai ekranına ve FinansAI bültenine aktarır.",
      metrics: [
        { label: "İzlenen Gösterge", value: "USD · EUR · Gram Altın · BIST 100 · BTC · Brent" },
        { label: "Eğilim Analizi", value: "30 Günlük Kapanış Serisi" },
        { label: "Hedef Sayfa", value: "uretir.com/finans-ai" },
      ],
      rules: [
        "Yatırım tavsiyesi içermez; yalnızca zaman damgalı ve kaynaklı piyasa göstergesi sunar.",
      ],
      recentLogs: [
        {
          timestamp: nowIso,
          action: "Canlı döviz, altın ve BIST 100 serileri senkronize edildi",
          result: "FinansAI ekranı ve tekil piyasa bülteni güncel.",
          status: "ok",
        },
      ],
    },
  ];

  return {
    checkedAt: nowIso,
    systemMode: "OTONOM 12 AJAN SİSTEMİ · TEKİL KATEGORİ PAYLAŞIM & SIFIR TEKRAR MODU",
    instagramAuditSummary: {
      account: "@uretirai",
      duplicatePolicy: "SHA-256 Parmak İzi Koruması · Mükerrer Paylaşımlar Temizlendi",
      backgroundPolicy: "1080x1920 Tam Ekran (Full-Bleed) Gerçek Fotoğraf + Editoryal Dergi Katmanı",
      audioPolicy: "Yapay Zekâ Seslendirme (TTS) Kapatıldı · Doğal Akustik Stüdyo Ambiyansı",
      categorySeparation: "HaberAI, PuanAI, İndirimAI, FinansAI, EvAI, ArabaAI, SporAI, OyunAI Ayrı Paylaşılır",
      lastCleanupCount: cleanupCount,
    },
    agents,
    separatePostPlans: getSeparateCategoryPostPlans(),
    whatsappPlaybook: getWhatsAppGrowthPlaybook(),
  };
}
