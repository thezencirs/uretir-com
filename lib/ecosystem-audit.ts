import { aiCapabilities } from "@/lib/ai-capabilities";
import { aiProducts } from "@/lib/ai-product-ecosystem";

export type PersonaAudit = {
  id: string;
  name: string;
  currentCanDo: string[];
  cannotDo: string[];
  likelyExitReasons: string[];
  missingCapabilities: string[];
};

export const personaAudits: PersonaAudit[] = [
  {
    id: "factory_owner", name: "Fabrika sahibi",
    currentCanDo: ["Üretim ve AI merkezlerinin temel rehberlerini keşfedebilir.", "Fiyat, enerji ve teşvik araştırma yöntemini okuyabilir."],
    cannotDo: ["Tesisini doğrulanmış kıyas grubuyla karşılaştıramaz.", "Enerji ve kapasite senaryosu çalıştıramaz."],
    likelyExitReasons: ["Canlı ve doğrulanmış tesis verisi yok.", "Kaydedilebilir çalışma alanı yok."],
    missingCapabilities: ["Fabrika kabiliyeti profili", "Enerji senaryo hesaplayıcısı", "Kapasite kıyaslama", "Kaydedilmiş tesis çalışma alanı"],
  },
  {
    id: "entrepreneur", name: "Girişimci",
    currentCanDo: ["Temel teşvik ve yatırım araştırma yolunu görebilir.", "Üretim sorusunu bilgi merkezlerinde arayabilir."],
    cannotDo: ["Fikri sektör, yatırım ve destek kanıtlarıyla tek dosyada değerlendiremez.", "Sonraki adımları hesabına kaydedemez."],
    likelyExitReasons: ["Kişisel proje bağlamı korunmuyor.", "Pazar ve yatırım kanıtı dağınık."],
    missingCapabilities: ["Girişim araştırma dosyası", "Pazar kanıt matrisi", "Yatırım ön fizibilite akışı", "Kişisel görev ve takip listesi"],
  },
  {
    id: "engineer", name: "Mühendis",
    currentCanDo: ["Teknoloji ve üretim rehberlerinde arama yapabilir.", "Kaynak ve belirsizlik kurallarını görebilir."],
    cannotDo: ["Proses gereksinimini makine ve standartlarla eşleyemez.", "Teknik iddiaları sürüm bazında karşılaştıramaz."],
    likelyExitReasons: ["Makine ve teknik veri ontolojisi yok.", "Standart kapsamı araştırması elle kalıyor."],
    missingCapabilities: ["Makine–proses eşleme", "Teknik özellik karşılaştırması", "Standart kapsam haritası", "Mühendislik kaynak paketi"],
  },
  {
    id: "architect", name: "Mimar",
    currentCanDo: ["Malzeme ve üretim konularını genel içerikte arayabilir.", "Şirket ve teknoloji ilişkilerine hazırlanmış mimariyi görebilir."],
    cannotDo: ["Malzeme, üretici, standart ve uygulama örneğini birlikte filtreleyemez.", "Proje koleksiyonu oluşturamaz."],
    likelyExitReasons: ["Mimarlık odaklı entity kapsamı zayıf.", "Teknik belge ve standart bağlantıları yetersiz."],
    missingCapabilities: ["Malzeme bilgi merkezi", "Üretici–malzeme eşleme", "Yapı standardı araştırma akışı", "Proje koleksiyonları"],
  },
  {
    id: "investor", name: "Yatırımcı",
    currentCanDo: ["Yatırım ve bölgesel destek kaynaklarına giden yolu bulabilir.", "Resmî istatistik kaynak sicilini kullanabilir."],
    cannotDo: ["Sektörleri veri ve risk boyutunda karşılaştıramaz.", "Kaynaklı yatırım senaryosu çalıştıramaz."],
    likelyExitReasons: ["Finansal ve operasyonel veri entegrasyonu yok.", "Karşılaştırma metodolojisi ürünleşmemiş."],
    missingCapabilities: ["Sektör yatırım karşılaştırması", "Bölgesel yatırım haritası", "Risk ve varsayım matrisi", "Yatırım izleme listesi"],
  },
  {
    id: "farmer", name: "Çiftçi",
    currentCanDo: ["TKDK ve tarım resmî kaynak rotalarını bulabilir.", "Teşvik araştırmasının güven sınırlarını görebilir."],
    cannotDo: ["Faaliyet ve konuma göre güncel potansiyel destek eşleşmesi alamaz.", "Üretim, sigorta ve fiyat verisini birlikte değerlendiremez."],
    likelyExitReasons: ["Bölgesel ve dönemsel veri yok.", "Tarım dili ve görevleri yeterince temsil edilmiyor."],
    missingCapabilities: ["Tarım faaliyet profili", "Bölgesel destek keşfi", "TARSİM araştırma bağlantısı", "Tarımsal fiyat ve risk görünümü"],
  },
  {
    id: "exporter", name: "İhracatçı",
    currentCanDo: ["İhracat hazırlık rehberlerine ve resmî portallara ulaşabilir.", "Hedef pazar araştırma ölçütlerini öğrenebilir."],
    cannotDo: ["Ürün ve ülkeye göre güncel gereklilikleri tek ekranda karşılaştıramaz.", "GTİP veya mevzuat için kesin sınıflandırma desteği alamaz."],
    likelyExitReasons: ["Canlı ticaret adaptörleri yok.", "Belge ve görev takibi kalıcı değil."],
    missingCapabilities: ["Hedef pazar kanıt karşılaştırması", "GTİP araştırma çalışma alanı", "İhracat belge kontrolü", "Pazar ve mevzuat değişiklik uyarıları"],
  },
  {
    id: "manufacturer", name: "Üretici",
    currentCanDo: ["Şirket, ürün, rehber ve AI merkezlerini evrensel aramada keşfedebilir.", "Fiyat ve tedarik araştırma yöntemini okuyabilir."],
    cannotDo: ["Doğrulanmış tedarikçi veya fabrika kabiliyeti bulamaz.", "Teklifleri normalleştirip karşılaştıramaz."],
    likelyExitReasons: ["Şirket kayıtları henüz yayın otoritesi kapısından geçmedi.", "Tedarik ağı ürünü yok."],
    missingCapabilities: ["Doğrulanmış üretici dizini", "Tedarikçi kabiliyeti eşleme", "Teklif normalizasyonu", "Tedarik riski haritası"],
  },
  {
    id: "student", name: "Öğrenci",
    currentCanDo: ["Üretim sorularını rehber ve AI merkezlerinde arayabilir.", "Kaynak doğrulama yaklaşımını öğrenebilir."],
    cannotDo: ["Öğrenme yolunu seviyesine göre düzenleyemez.", "Not, kaynak ve ilerleme kaydedemez."],
    likelyExitReasons: ["Konu kümeleri öğrenme yoluna dönüşmemiş.", "Hesap ve koleksiyon işlevleri üretimde yok."],
    missingCapabilities: ["Seviyeli öğrenme yolları", "Kavram sözlüğü", "Kaynak koleksiyonu", "Okuma ilerleme takibi"],
  },
  {
    id: "researcher", name: "Araştırmacı",
    currentCanDo: ["Resmî kaynak ve bilgi grafiği mimarisini kullanabilir.", "İçerik ve entity boşluk raporlarını inceleyebilir."],
    cannotDo: ["Veri setlerini sorgulayıp dışa aktaramaz.", "İddia ve kaynak sürümlerini zaman içinde izleyemez."],
    likelyExitReasons: ["Kaynak düzeyinde veri erişimi ve alıntı dışa aktarımı yok.", "Araştırma çalışma alanı kalıcı değil."],
    missingCapabilities: ["Kaynaklı veri dışa aktarımı", "İddia sürüm geçmişi", "Araştırma koleksiyonları", "Atıf biçimi üretimi"],
  },
  {
    id: "support_applicant", name: "Devlet desteği başvuru sahibi",
    currentCanDo: ["Teşvik araştırmasının resmî kaynaklarını ve hazırlık rehberlerini bulabilir.", "Uygunluk ön kontrolünün sınırlarını anlayabilir."],
    cannotDo: ["Güncel program kayıtlarıyla profil eşleşmesi alamaz.", "Belge, son tarih ve değişiklikleri takip edemez."],
    likelyExitReasons: ["Program veri alımı henüz bağlı değil.", "Kişisel başvuru dosyası yok."],
    missingCapabilities: ["Doğrulanmış program araması", "Potansiyel eşleşme ön kontrolü", "Başvuru belge çalışma alanı", "Çağrı değişiklik uyarıları"],
  },
  {
    id: "sme_owner", name: "KOBİ sahibi",
    currentCanDo: ["Teşvik, ihracat, fiyat ve alışveriş karar merkezlerini keşfedebilir.", "Temel karar rehberlerini okuyabilir."],
    cannotDo: ["İşletme profilini ürünler arasında taşıyamaz.", "Destek, maliyet ve tedarik görevlerini tek yerde yönetemez."],
    likelyExitReasons: ["Ortak kimlik sistemi üretimde yok.", "Ürünler arası bağlam aktarımı yok."],
    missingCapabilities: ["KOBİ işletme profili", "Ürünler arası güvenli bağlam aktarımı", "Karar çalışma alanı", "İşletme odaklı güncelleme akışı"],
  },
  {
    id: "ai_enthusiast", name: "AI meraklısı",
    currentCanDo: ["AI ürün merkezlerini ve İnsanAI yaklaşımını keşfedebilir.", "Ürünlerin bugünkü ve gelecek durumlarını ayırt edebilir."],
    cannotDo: ["Kaynaklı AI yanıtını canlı deneyemez.", "Değerlendirme ve hata örneklerini inceleyemez."],
    likelyExitReasons: ["Canlı model yerine ürün temeli var.", "Şeffaf değerlendirme panosu yok."],
    missingCapabilities: ["Kaynaklı UretirAI önizlemesi", "AI değerlendirme panosu", "Yanıt geri bildirim akışı", "Kamuya açık güven ve sınırlılık kaydı"],
  },
];

export type EcosystemGap = {
  id: string;
  title: string;
  source: "persona" | "ai_capability" | "product_prerequisite" | "operations";
  owner: string;
  priorityScore: number;
  horizon: "7_days" | "30_days" | "90_days" | "later";
  dependency: string;
  outcomeMetric: string;
};

const operationalGaps = [
  ["production-hosting", "Üretim hosting ve bölge kararını onayla", "platform", 96, "7_days", "Named infrastructure owner", "Release readiness"],
  ["observability", "Hata, uptime ve Core Web Vitals gözlemlenebilirliğini bağla", "platform", 94, "7_days", "Hosting decision", "Detected incidents"],
  ["analytics-adapter", "Onay yönetimli analiz adaptörünü bağla", "growth", 93, "7_days", "Privacy and consent approval", "Measured search and session depth"],
  ["search-console", "Search Console salt-okunur veri hattını kur", "seo", 92, "7_days", "Verified site property", "Validated demand signals"],
  ["cms-selection", "Editoryal CMS ve önizleme yetki modelini seç", "editorial", 88, "30_days", "Identity and content migration plan", "Review cycle time"],
  ["identity", "Ortak kimlik, onay ve veri yaşam döngüsünü kur", "identity", 87, "30_days", "Security and privacy design", "Returning-user activation"],
  ["source-monitor", "Resmî kaynak değişiklik izleyicisini kur", "data", 91, "30_days", "Connector policy", "Stale records blocked"],
  ["programme-pilot", "Bir TeşvikAI program ailesini uçtan uca doğrula", "tesvik-ai", 95, "30_days", "Source monitor and editorial owner", "Verified programme coverage"],
  ["search-telemetry", "Sıfır sonuç ve arama terk sinyallerini ölç", "search", 90, "30_days", "Consent-aware analytics", "Zero-result rate"],
  ["rollback-rehearsal", "Üretim geri alma tatbikatı yap", "platform", 85, "30_days", "Immutable deployment", "Recovery time"],
  ["content-pilot", "Bir dar üretim konu kümesini otorite kapısından geçir", "editorial", 97, "30_days", "Expert and primary sources", "Authority-ready documents"],
  ["data-retention", "Kullanıcı ve kaynak verisi saklama politikasını onayla", "security", 82, "90_days", "Identity architecture", "Audited retention compliance"],
] as const;

function slug(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function createEcosystemGaps(): EcosystemGap[] {
  const gaps: EcosystemGap[] = [];
  for (const [personaIndex, persona] of personaAudits.entries()) {
    persona.missingCapabilities.forEach((title, index) => {
      const priorityScore = 89 - personaIndex - index * 3;
      gaps.push({
        id: `persona:${persona.id}:${slug(title)}`, title, source: "persona", owner: persona.id,
        priorityScore, horizon: priorityScore >= 84 ? "30_days" : priorityScore >= 76 ? "90_days" : "later",
        dependency: persona.cannotDo[index % persona.cannotDo.length],
        outcomeMetric: index % 2 ? "Returning-user task completion" : "Successful knowledge journey",
      });
    });
  }
  for (const item of aiCapabilities.filter((capability) => capability.state !== "implemented_contract")) {
    gaps.push({
      id: `ai:${item.id}`, title: item.name, source: "ai_capability", owner: item.products.join(", "),
      priorityScore: Math.max(60, 96 - item.priority), horizon: item.priority <= 9 ? "30_days" : item.priority <= 18 ? "90_days" : "later",
      dependency: item.prerequisites.join("; "), outcomeMetric: item.outcome,
    });
  }
  for (const product of aiProducts.filter((item) => ["candidate", "future_integration"].includes(item.status))) {
    product.prerequisites.forEach((dependency, index) => gaps.push({
      id: `product:${product.id}:${slug(dependency)}`, title: `${product.name}: ${dependency}`, source: "product_prerequisite", owner: product.id,
      priorityScore: 78 - index * 4 - (product.status === "candidate" ? 4 : 0), horizon: product.status === "future_integration" ? "90_days" : "later",
      dependency, outcomeMetric: `${product.name} readiness`,
    }));
  }
  for (const [id, title, owner, priorityScore, horizon, dependency, outcomeMetric] of operationalGaps) {
    gaps.push({ id: `operations:${id}`, title, source: "operations", owner, priorityScore, horizon, dependency, outcomeMetric });
  }
  return gaps.sort((a, b) => b.priorityScore - a.priorityScore || a.id.localeCompare(b.id)).slice(0, 100);
}

export const ecosystemScores = [
  { area: "Content authority", score: 41, evidence: "Editorial and topic-cluster contracts exist; no document currently passes the authority gate." },
  { area: "Discovery and search", score: 58, evidence: "Universal publication-aware search exists; production telemetry and external search provider do not." },
  { area: "Knowledge graph", score: 62, evidence: "Entity and relationship contracts are validated; verified public entity depth remains limited." },
  { area: "AI product readiness", score: 34, evidence: "Portfolio, trust contracts, and capability backlog exist; no live grounded answer service is enabled." },
  { area: "TeşvikAI readiness", score: 39, evidence: "Fail-closed assessment and source model exist; verified programme ingestion is not connected." },
  { area: "Community and identity", score: 14, evidence: "Architecture is documented, but production identity, persistence, consent, and moderation are absent." },
  { area: "Operations", score: 52, evidence: "Repository quality and CI exist; hosting, observability, analytics, deployment, and rollback remain unapproved." },
  { area: "Persona completion", score: 29, evidence: "All personas have discovery entry points, but high-value tasks depend on data, identity, and workflow products." },
];

export function validateEcosystemAudit() {
  const errors: string[] = [];
  if (personaAudits.length !== 13) errors.push(`Expected 13 personas, received ${personaAudits.length}.`);
  const gaps = createEcosystemGaps();
  if (gaps.length !== 100) errors.push(`Expected Top 100 gaps, received ${gaps.length}.`);
  const ids = new Set<string>();
  for (const gap of gaps) {
    if (ids.has(gap.id)) errors.push(`Duplicate ecosystem gap: ${gap.id}`);
    ids.add(gap.id);
  }
  return errors;
}
