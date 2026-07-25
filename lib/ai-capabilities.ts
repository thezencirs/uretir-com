export type AICapabilityState = "implemented_contract" | "foundation" | "blocked_external_data" | "planned";

export type AICapability = {
  id: string;
  name: string;
  priority: number;
  state: AICapabilityState;
  outcome: string;
  products: string[];
  prerequisites: string[];
  principalRisk: string;
};

const capability = (
  id: string,
  name: string,
  priority: number,
  state: AICapabilityState,
  outcome: string,
  products: string[],
  prerequisites: string[],
  principalRisk: string,
): AICapability => ({ id, name, priority, state, outcome, products, prerequisites, principalRisk });

export const aiCapabilities: AICapability[] = [
  capability("source-grounded-retrieval", "Kaynak temelli erişim", 1, "foundation", "Yanıtı yalnızca izinli ve izlenebilir kayıtlardan kurar.", ["uretir-ai", "tesvik-ai", "ihracat-ai"], ["authority-ready corpus", "retrieval evaluation"], "Yanlış veya bağlam dışı kaynağı kanıt gibi sunmak."),
  capability("citation-rendering", "İddia düzeyinde kaynak gösterimi", 2, "implemented_contract", "Kullanıcıya kaynak, tarih ve kapsamı görünür kılar.", ["uretir-ai", "tesvik-ai", "document-ai"], ["claim-source mapping"], "Genel bir kaynağı özel bir iddiaya bağlamak."),
  capability("freshness-enforcement", "Tazelik ve son kullanım kapısı", 3, "implemented_contract", "Süresi geçmiş kaydı yanıt üretiminden çıkarır.", ["tesvik-ai", "puan-ai", "fiyat-ai"], ["review schedule", "expiry policy"], "Eski tarih veya koşulla karar verdirmek."),
  capability("uncertainty-labels", "Belirsizlik etiketleme", 4, "implemented_contract", "Eksik ve çelişkili kanıtı kesin sonuçtan ayırır.", ["all"], ["shared answer contract"], "Aşırı güvenli dil."),
  capability("entity-resolution", "Varlık çözümleme", 5, "foundation", "Benzer şirket, ürün ve kurum adlarını ayırır.", ["uretir-ai", "factory-ai", "supply-chain-ai"], ["aliases", "stable IDs", "review queue"], "Yanlış varlık birleştirme."),
  capability("cross-product-handoff", "Ürünler arası bağlam aktarımı", 6, "planned", "Kullanıcıyı bağlam kaybetmeden ilgili AI ürününe taşır.", ["all"], ["shared identity", "consent model"], "Gereksiz veri paylaşımı."),
  capability("universal-search-retrieval", "Evrensel arama erişimi", 7, "implemented_contract", "Kamuya açık içerik ve ürünleri tek sözleşmeyle bulur.", ["uretir-ai", "trend-ai"], ["search adapter", "publication filter"], "İnceleme kayıtlarını üretimde sızdırmak."),
  capability("follow-up-planning", "Takip sorusu planlama", 8, "planned", "Eksik karar girdilerini en az soruyla tamamlar.", ["puan-ai", "tesvik-ai", "investment-ai"], ["question policy", "completion tests"], "Gereksiz veya hassas veri istemek."),
  capability("source-conflict-detection", "Kaynak çelişkisi tespiti", 9, "planned", "Farklı resmî kayıtlar arasındaki uyuşmazlığı işaretler.", ["tesvik-ai", "compliance-ai", "ihracat-ai"], ["versioned source snapshots"], "Sessizce yanlış kaynağı seçmek."),
  capability("update-alerts", "Değişiklik ve son tarih uyarıları", 10, "blocked_external_data", "Kaydedilen konu değiştiğinde kullanıcıyı bilgilendirir.", ["tesvik-ai", "puan-ai", "standards-ai"], ["identity", "notification consent", "change feeds"], "Yanlış veya gecikmiş bildirim."),
  capability("research-workspace", "Kaydedilebilir araştırma çalışma alanı", 11, "planned", "Kaynak, not ve karşılaştırmaları kullanıcı hesabında toplar.", ["all"], ["identity", "data retention", "export/delete"], "Kullanıcı verisini amaç dışı saklamak."),
  capability("multilingual-retrieval", "Çok dilli erişim", 12, "planned", "Türkçe soruyu yabancı resmî kaynaklarla güvenli eşler.", ["ihracat-ai", "standards-ai", "uretir-ai"], ["terminology map", "translation evaluation"], "Hukuki veya teknik anlamı bozmak."),
  capability("document-extraction", "Belge alanı çıkarımı", 13, "planned", "Belgeyi sayfa referanslı yapılandırılmış kayda dönüştürür.", ["document-ai", "tesvik-ai"], ["OCR benchmark", "document rights"], "Yanlış alanı kesin veri gibi kaydetmek."),
  capability("eligibility-precheck", "Yapılandırılmış uygunluk ön kontrolü", 14, "implemented_contract", "Yalnızca potansiyel eşleşme ve eksik bilgi üretir.", ["tesvik-ai"], ["verified programme rules"], "Nihai uygunluk kararı izlenimi vermek."),
  capability("programme-matching", "Resmî program eşleştirme", 15, "blocked_external_data", "Profili güncel program kayıtlarıyla karşılaştırır.", ["tesvik-ai"], ["programme ingestion", "amendment checks"], "Kapanmış çağrıyı açık göstermek."),
  capability("application-checklist", "Başvuru kontrol listesi", 16, "foundation", "Belge ve hazırlık eksiklerini kaynağa bağlı açıklar.", ["tesvik-ai", "ihracat-ai"], ["document requirement model"], "Her başvuru için aynı listeyi kullanmak."),
  capability("factory-matching", "Fabrika kabiliyeti eşleme", 17, "blocked_external_data", "Üretim ihtiyacını doğrulanmış tesis kabiliyetiyle eşler.", ["factory-ai"], ["verified factory registry"], "Doğrulanmamış kapasite iddiası."),
  capability("machine-process-matching", "Makine–proses eşleme", 18, "planned", "Süreç gereksiniminden makine sınıfı araştırması çıkarır.", ["machine-ai"], ["machine taxonomy", "expert review"], "Marka veya performans uydurmak."),
  capability("standards-mapping", "Standart kapsamı eşleme", 19, "blocked_external_data", "Ürün ve pazarı standart araştırma yollarına bağlar.", ["standards-ai", "compliance-ai"], ["licensed metadata", "scope review"], "Uygulanabilirlik konusunda hukuki kesinlik."),
  capability("energy-scenarios", "Enerji senaryo modelleme", 20, "blocked_external_data", "Tesis seçeneklerini veri, varsayım ve hassasiyetle karşılaştırır.", ["energy-ai", "investment-ai"], ["tariff feeds", "audited calculator"], "Yanlış birim veya tarife."),
  capability("export-market-comparison", "İhracat pazarı kanıt karşılaştırması", 21, "foundation", "Pazarları tek skor yerine kanıt matrisiyle karşılaştırır.", ["ihracat-ai"], ["trade adapters", "market methodology"], "Korelasyonu talep kanıtı sanmak."),
  capability("supply-risk-map", "Tedarik riski haritalama", 22, "planned", "Tedarik bağımlılığı ve alternatif araştırma yollarını gösterir.", ["supply-chain-ai"], ["supplier registry", "trade data"], "Şirket riski hakkında temelsiz çıkarım."),
  capability("unit-normalisation", "Fiyat ve birim normalizasyonu", 23, "planned", "Birim, kur, kalite ve teslim kapsamını karşılaştırılabilir kılar.", ["fiyat-ai", "energy-ai"], ["unit ontology", "FX provenance"], "Karşılaştırılamaz teklifleri eşitlemek."),
  capability("human-escalation", "İnsan incelemesine yönlendirme", 24, "implemented_contract", "Yüksek riskli veya belirsiz sonucu uzman kuyruğuna taşır.", ["all"], ["risk taxonomy", "named owners"], "Uzman desteği varmış gibi vaat etmek."),
  capability("answer-audit", "Yanıt değerlendirme ve denetim", 25, "planned", "Doğruluk, kaynak, tazelik ve faydayı sürüm bazında ölçer.", ["all"], ["golden datasets", "red-team cases", "audit log"], "Yalnızca akıcılığı kalite sanmak."),
];

export function validateAICapabilities() {
  const errors: string[] = [];
  if (aiCapabilities.length !== 25) errors.push(`Expected 25 AI capabilities, received ${aiCapabilities.length}.`);
  const ids = new Set<string>();
  for (const item of aiCapabilities) {
    if (ids.has(item.id)) errors.push(`Duplicate AI capability id: ${item.id}`);
    if (!item.products.length || !item.prerequisites.length) errors.push(`Incomplete AI capability: ${item.id}`);
    ids.add(item.id);
  }
  return errors;
}
