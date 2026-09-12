import type { EditorialEntityReference, EditorialPublishingRecord, EditorialSourceReference } from "@/lib/editorial-engine";
import type { SearchIntentKind } from "@/lib/search-intent";

export type ContentHubId = "uretir-ai" | "puan-ai" | "tesvik-ai" | "fiyat-ai" | "ihracat-ai";
export type HubGuideStatus = "in_review" | "published";
export type HubAvailability = "verified_service" | "sample" | "foundation" | "future_integration";

export type HubFaq = {
  question: string;
  answer: string;
};

export type HubGuide = {
  slug: string;
  hubId: ContentHubId;
  title: string;
  description: string;
  question: string;
  intent: SearchIntentKind;
  status: HubGuideStatus;
  createdAt: string;
  updatedAt: string;
  readingTimeMinutes: number;
  quickAnswer: string;
  answers: {
    what: string;
    why: string;
    how: string;
    who: string;
    when: string;
    where: string;
  };
  steps: string[];
  pitfalls: string[];
  relatedTopics: string[];
  sources: EditorialSourceReference[];
  faq: HubFaq[];
  relatedGuideSlugs: string[];
  relatedPaths: Array<{ label: string; href: string; type: string }>;
  /** Optional enrichments become mandatory at the publication authority gate. */
  examples?: Array<{ title: string; context?: string; text: string }>;
  advantages?: string[];
  disadvantages?: string[];
  useCases?: string[];
  keyTakeaways?: string[];
  entityRelations?: EditorialEntityReference[];
  editorial?: EditorialPublishingRecord;
};

export type ContentHub = {
  id: ContentHubId;
  name: string;
  path: string;
  eyebrow: string;
  title: string;
  description: string;
  availability: HubAvailability;
  availabilityLabel: string;
  availabilityNote: string;
  accent: string;
  productPromise: string;
  intents: string[];
  capabilities: Array<{ title: string; description: string }>;
  faq: HubFaq[];
  cta: { title: string; description: string; label: string; href: string };
};

const accessedAt = "2026-07-25";

const sources = {
  nist: {
    id: "nist-ai-rmf",
    title: "AI Risk Management Framework",
    href: "https://www.nist.gov/itl/ai-risk-management-framework",
    kind: "official_report",
    publisher: "National Institute of Standards and Technology",
    accessedAt,
    officialDocument: true,
  },
  bddk: {
    id: "bddk-card-regulations",
    title: "Banka Kartları ve Kredi Kartları Kanununa İlişkin Düzenlemeler",
    href: "https://www.bddk.org.tr/Mevzuat/Liste/51",
    kind: "official_report",
    publisher: "BDDK",
    accessedAt,
    officialDocument: true,
  },
  kosgeb: {
    id: "kosgeb-home",
    title: "KOSGEB destek ve duyuruları",
    href: "https://www.kosgeb.gov.tr/?lang=tr",
    kind: "official_support_program",
    publisher: "KOSGEB",
    accessedAt,
  },
  tubitak: {
    id: "tubitak-industry",
    title: "Sanayi destekleri",
    href: "https://tubitak.gov.tr/tr/destekler/sanayi",
    kind: "official_support_program",
    publisher: "TÜBİTAK",
    accessedAt,
  },
  tradeSupports: {
    id: "trade-export-supports",
    title: "İhracat destekleri",
    href: "https://ticaret.gov.tr/destekler/ihracat-destekleri",
    kind: "official_support_program",
    publisher: "T.C. Ticaret Bakanlığı",
    accessedAt,
  },
  tradeExport: {
    id: "trade-export-hub",
    title: "İhracat bilgi merkezi",
    href: "https://ticaret.gov.tr/ihracat",
    kind: "official_announcement",
    publisher: "T.C. Ticaret Bakanlığı",
    accessedAt,
  },
  tradeSources: {
    id: "trade-information-sources",
    title: "Ticari bilgi kaynakları",
    href: "https://ticaret.gov.tr/ihracat/ticari-bilgi-kaynaklari",
    kind: "official_report",
    publisher: "T.C. Ticaret Bakanlığı",
    accessedAt,
  },
  tuik: {
    id: "tuik-data-portal",
    title: "TÜİK Veri Portalı",
    href: "https://veriportali.tuik.gov.tr/tr",
    kind: "official_statistic",
    publisher: "Türkiye İstatistik Kurumu",
    accessedAt,
  },
} satisfies Record<string, EditorialSourceReference>;

export const contentHubs: ContentHub[] = [
  {
    id: "uretir-ai",
    name: "UretirAI",
    path: "/uretir-ai",
    eyebrow: "Bilgi ekosisteminin merkezi",
    title: "Üretim sorularını kaynaklarla birlikte araştırın.",
    description: "UretirAI; şirket, ürün, teknoloji, fabrika ve rehberleri tek bir açıklanabilir keşif akışında birleştirmek üzere hazırlanan bilgi asistanıdır.",
    availability: "foundation",
    availabilityLabel: "Bilgi temeli hazırlanıyor",
    availabilityNote: "Canlı yapay zekâ yanıtı henüz sunulmuyor. Bu merkez bugün editoryal rehberlere erişim sağlar; gelecekte yalnızca kaynaklandırılmış Uretir kayıtlarını kullanacaktır.",
    accent: "#78a5b6",
    productPromise: "Bir yanıt vermekle kalmayıp kanıtı, belirsizliği ve sonraki araştırma yollarını göstermek.",
    intents: ["Ne üretir?", "Kim üretir?", "Nasıl üretir?", "Nerede üretir?", "Neden üretir?"],
    capabilities: [
      { title: "Kaynaklı yanıt", description: "Her iddianın dayandığı içeriği ve güncellik bilgisini görünür kılar." },
      { title: "Varlık keşfi", description: "Şirket, ürün, teknoloji, makine ve sektör ilişkilerini birlikte sunar." },
      { title: "Devam eden yol", description: "İlgili rehber, şirket, araç ve konu kümelerine doğal geçiş kurar." },
    ],
    faq: [
      { question: "UretirAI şu anda canlı mı?", answer: "Hayır. Bilgi mimarisi ve editoryal rehberler kullanılabilir; canlı yanıt üretimi gelecekte, kaynak ve kalite kontrolleri tamamlandığında açılacaktır." },
      { question: "Gelecekte yanıtlarını nereden alacak?", answer: "Onaylanmış Uretir içeriklerinden, doğrulanmış varlık ilişkilerinden ve açıkça belirtilen birincil kaynaklardan." },
      { question: "Bir yanıt kesin değilse ne olacak?", answer: "Belirsizlik açıkça belirtilecek; kullanıcıya doğrulama için kaynak ve izlenecek adımlar gösterilecektir." },
    ],
    cta: { title: "Doğru soruyla başlayın.", description: "Kaynak değerlendirme ve üretim araştırması rehberleriyle güvenilir bir araştırma akışı kurun.", label: "Rehberleri incele", href: "#rehberler" },
  },
  {
    id: "puan-ai",
    name: "PuanAI",
    path: "/puan-ai",
    eyebrow: "Alışveriş karar asistanı",
    title: "Kart, taksit ve toplam maliyet kararını şeffaflaştırın.",
    description: "PuanAI, alışveriş bağlamını anlayıp yalnızca güncel resmî kaynak, geçerli tarih ve doğrulama kaydı bulunan kampanyaları açıklanabilir biçimde karşılaştırır.",
    availability: "verified_service",
    availabilityLabel: "Doğrulanmış kampanya hizmeti",
    availabilityNote: "Kaynağı, parmak izi, son kontrolü veya geçerlilik tarihi eksik olan kayıtlar otomatik olarak yanıtlardan çıkarılır.",
    accent: "#c8f560",
    productPromise: "En yüksek görünen ödülü değil, koşullar ve toplam maliyet içinde en uygun kararı açıklamak.",
    intents: ["En uygun kart hangisi?", "Taksit mantıklı mı?", "Toplam maliyet nedir?", "Kampanya nasıl doğrulanır?"],
    capabilities: [
      { title: "Doğal danışman akışı", description: "Harcama türü, tutar ve önceliğe göre sorularla bağlamı netleştirir." },
      { title: "Açıklanabilir sonuç", description: "Varsayım, uygunluk, son tarih ve veri durumunu sonuçla birlikte gösterir." },
      { title: "Alışveriş rehberleri", description: "Kararı kart, taksit, puan ve maliyet rehberleriyle derinleştirir." },
    ],
    faq: [
      { question: "PuanAI kampanya verileri güncel mi?", answer: "Yalnızca geçerli resmî kaynak ve tazelik kontrolünden geçen kampanyalar gösterilir. İşlemden hemen önce resmî kaynağı yeniden kontrol edin." },
      { question: "PuanAI bir kartı neden önerdiğini açıklar mı?", answer: "Evet. Sonuç; kullanılan varsayımları, eşleşen koşulları ve kontrol edilmesi gereken noktaları birlikte gösterir." },
      { question: "Bir kampanya doğrulanamazsa ne olur?", answer: "PuanAI kampanyayı önermez ve güncel kampanya doğrulanamadığını açıkça söyler." },
    ],
    cta: { title: "Alışveriş kararını doğrulayın.", description: "Sorunuzu doğal dille yazın; PuanAI yalnızca doğrulanmış kayıtları koşulları ve resmî kaynaklarıyla karşılaştırsın.", label: "PuanAI'a sor", href: "/puan-ai" },
  },
  {
    id: "tesvik-ai",
    name: "TesvikAI",
    path: "/tesvik-ai",
    eyebrow: "Üretim teşvikleri bilgi merkezi",
    title: "Destek araştırmasını doğru sorular ve resmî kaynaklarla başlatın.",
    description: "TesvikAI; işletme profili, yatırım konusu ve başvuru hazırlığını resmî kurum kaynaklarına bağlayan bir teşvik bilgi merkezi olarak hazırlanıyor.",
    availability: "foundation",
    availabilityLabel: "Editoryal temel hazır",
    availabilityNote: "Canlı uygunluk hesabı veya açık çağrı önerisi yapılmaz. Program koşulları ve tarihler yalnızca ilgili kurumun güncel resmî sayfasından doğrulanmalıdır.",
    accent: "#8b80c2",
    productPromise: "Kullanıcıyı tek bir destek adına yöneltmek yerine doğru kurum, uygunluk soruları, belgeler ve doğrulama adımlarıyla hazırlamak.",
    intents: ["Hangi destek bana uygun?", "Başvuruya nasıl hazırlanırım?", "Hangi belgeler gerekir?", "Bilgiyi nereden doğrularım?"],
    capabilities: [
      { title: "Uygunluk çerçevesi", description: "İşletme, proje, gider ve zaman koşullarını başvuru öncesinde ayrıştırır." },
      { title: "Resmî kaynak rotası", description: "KOSGEB, TÜBİTAK ve Ticaret Bakanlığı gibi yetkili kaynaklara yönlendirir." },
      { title: "Bakımı kolay rehberler", description: "Değişen programları kaynak, güncelleme ve inceleme kayıtlarıyla yönetir." },
    ],
    faq: [
      { question: "TesvikAI uygunluk kararı verir mi?", answer: "Hayır. Nihai uygunluk ve kabul kararı yetkili kuruma aittir; TesvikAI hazırlık ve kaynak keşfi sağlar." },
      { question: "Açık program tarihleri neden burada listelenmiyor?", answer: "Tarihler ve koşullar değişebilir. İnsan editoryal kontrolü ve güncel resmî kaynak doğrulaması olmadan süreli bilgi yayımlanmaz." },
      { question: "Hangi kurumlar izlenecek?", answer: "Öncelik KOSGEB, TÜBİTAK, Ticaret Bakanlığı ve ilgili resmî destek kurumlarıdır; her kaynak yayıncı ve erişim tarihiyle kaydedilir." },
    ],
    cta: { title: "Başvuru dosyanızı hazırlayın.", description: "Program aramadan önce işletme, proje, bütçe ve belge hazırlığını tamamlayın.", label: "Hazırlık rehberleri", href: "#rehberler" },
  },
  {
    id: "fiyat-ai",
    name: "FiyatAI",
    path: "/fiyat-ai",
    eyebrow: "Fiyat ve maliyet okuryazarlığı",
    title: "Fiyatı değil, karşılaştırılabilir toplam maliyeti okuyun.",
    description: "FiyatAI; hammadde, enerji ve üretim girdilerini kaynak, birim, tarih ve kapsam farklarıyla değerlendirmek üzere hazırlanan analiz merkezidir.",
    availability: "future_integration",
    availabilityLabel: "Gelecek veri entegrasyonu",
    availabilityNote: "Canlı fiyat, emtia kotasyonu veya satın alma önerisi sunulmaz. Bugünkü içerik fiyat serilerini ve teklifleri güvenli karşılaştırma yöntemini öğretir.",
    accent: "#d97835",
    productPromise: "Tek bir rakam yerine birim, kalite, teslim, kur, vergi ve zaman farklarını görünür kılmak.",
    intents: ["Fiyatlar nasıl karşılaştırılır?", "Trend nasıl okunur?", "Toplam maliyet nedir?", "Kaynak güvenilir mi?"],
    capabilities: [
      { title: "Karşılaştırılabilir veri", description: "Birim, para birimi, kalite ve teslim kapsamını aynı zemine getirir." },
      { title: "Kaynak ve zaman", description: "Her veri noktasını yayıncı, dönem ve güncelleme bilgisiyle değerlendirir." },
      { title: "Satın alma bağlamı", description: "Fiyatı lojistik, stok, ödeme ve kalite riskiyle birlikte ele alır." },
    ],
    faq: [
      { question: "FiyatAI canlı fiyat gösteriyor mu?", answer: "Hayır. Canlı ve doğrulanmış sağlayıcı entegrasyonu kurulana kadar fiyat iddiası yayımlanmaz." },
      { question: "İki teklif neden doğrudan karşılaştırılamayabilir?", answer: "Birim, kalite sınıfı, teslim şekli, para birimi, vergi ve ödeme vadesi farklı olabilir." },
      { question: "Resmî istatistikler teklif fiyatı yerine geçer mi?", answer: "Hayır. İstatistikler eğilimi anlamaya yardımcı olabilir; belirli bir satın alma için tedarikçi teklifi ve sözleşme koşulları ayrıca değerlendirilmelidir." },
    ],
    cta: { title: "Karşılaştırma standardınızı kurun.", description: "Teklifleri aynı birim ve kapsam içinde değerlendirmek için yöntem rehberlerini kullanın.", label: "Fiyat rehberleri", href: "#rehberler" },
  },
  {
    id: "ihracat-ai",
    name: "IhracatAI",
    path: "/ihracat-ai",
    eyebrow: "Üreticiler için ihracat bilgi merkezi",
    title: "Hedef pazar kararını belge, kaynak ve süreçlerle hazırlayın.",
    description: "IhracatAI; pazar araştırması, GTİP, destek, belge ve lojistik başlıklarını resmî bilgi kaynaklarıyla bir araya getirmek üzere hazırlanıyor.",
    availability: "foundation",
    availabilityLabel: "Bilgi mimarisi hazır",
    availabilityNote: "Vergi, GTİP, mevzuat veya hedef pazar konusunda otomatik kesin karar verilmez. Güncel gereklilikler yetkili kurumlar ve uzmanlarla doğrulanmalıdır.",
    accent: "#b26959",
    productPromise: "İhracatı tek bir pazar önerisine indirgemeden ürün, ülke, mevzuat, lojistik ve destek ilişkileri içinde açıklamak.",
    intents: ["İhracata hazır mıyım?", "Hedef pazar nasıl seçilir?", "Hangi belgeler gerekir?", "Destekleri nereden izlerim?"],
    capabilities: [
      { title: "Hazırlık kontrolü", description: "Ürün, kapasite, uygunluk, fiyatlama ve operasyon gereksinimlerini birlikte değerlendirir." },
      { title: "Resmî bilgi rotası", description: "Ticaret Bakanlığı kaynakları ve doğrulama adımlarını görünür kılar." },
      { title: "Konu kümeleri", description: "Pazar, GTİP, destek, lojistik ve belge rehberlerini birbirine bağlar." },
    ],
    faq: [
      { question: "IhracatAI hedef pazar seçer mi?", answer: "Şimdilik hayır. Rehberler karar kriterlerini ve resmî araştırma kaynaklarını açıklar." },
      { question: "GTİP bilgisi kesin kabul edilebilir mi?", answer: "Hayır. Ürünün teknik özellikleri ve güncel mevzuat dikkate alınmalı; gerektiğinde gümrük müşaviri veya yetkili kurum doğrulaması alınmalıdır." },
      { question: "İhracat destekleri güncel mi?", answer: "Bu merkez süreli destek iddiası yayımlamaz. Güncel kapsam ve başvuru koşulları doğrudan Ticaret Bakanlığı kaynaklarından kontrol edilmelidir." },
    ],
    cta: { title: "İhracata hazırlık seviyenizi görün.", description: "Ürün ve işletme hazırlığını kontrol edin, ardından resmî pazar ve destek kaynaklarına ilerleyin.", label: "İhracat rehberleri", href: "#rehberler" },
  },
];

const commonRelatedPaths = [
  { label: "Tüm AI merkezleri", href: "/araclar", type: "AI araçları" },
  { label: "Üretim bilgi ekosistemi", href: "/ekosistem", type: "Ekosistem" },
  { label: "Üretim makaleleri", href: "/blog", type: "Rehberler" },
];

export const hubGuides: HubGuide[] = [
  {
    slug: "uretim-sorusu-nasil-arastirilir",
    hubId: "uretir-ai",
    title: "Bir üretim sorusu nasıl güvenilir biçimde araştırılır?",
    description: "Ürün, şirket, süreç ve teknoloji sorularını varlıklara ayırarak kanıtlanabilir bir araştırma rotası kurun.",
    question: "Bir üretim sorusunun güvenilir cevabına nasıl ulaşırım?",
    intent: "öğrenme",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 6,
    quickAnswer: "Soruyu önce ürün, üretici, süreç, yer ve amaç bileşenlerine ayırın; her iddia için birincil kaynağı, tarihini ve kapsamını kaydedin; eksik kalan ilişkileri açıkça belirsiz olarak işaretleyin.",
    answers: {
      what: "Üretim araştırması, tek bir metin araması değil; ürün, şirket, sektör, teknoloji, makine ve coğrafya varlıkları arasındaki ilişkileri doğrulama işidir.",
      why: "Aynı isim farklı ürünleri veya şirketleri ifade edebilir. Varlıkları ayırmak yanlış eşleşme ve bağlam dışı sonuç riskini azaltır.",
      how: "Soruyu beş Uretir sütununa bölün, birincil kaynakları toplayın, tarih ve kapsamı karşılaştırın, çelişkileri not edin.",
      who: "Satın alma ekipleri, girişimciler, öğrenciler, yatırım araştırmacıları, üreticiler ve editörler için uygundur.",
      when: "Bir ürün, üretici, süreç, yatırım veya teknoloji hakkında karar vermeden ve içerik yayımlamadan önce uygulanmalıdır.",
      where: "Resmî kurumlar, şirketlerin resmî belgeleri, standart kuruluşları ve Uretir'in editoryal olarak onaylanmış kayıtları içinde yürütülür.",
    },
    steps: ["Soruyu NE, KİM, NASIL, NEREDE ve NEDEN alt sorularına ayırın.", "Her özel isim için tekil bir varlık kaydı ve alternatif adlar oluşturun.", "İddiaları kaynak, yayın tarihi, erişim tarihi ve kapsamla birlikte kaydedin.", "İki kaynak çelişiyorsa sonucu kesinleştirmek yerine farkı görünür kılın.", "Okuyucuya ilgili şirket, ürün, teknoloji ve rehber yollarını gösterin."],
    pitfalls: ["Tek bir ikincil kaynağı kesin gerçek kabul etmek", "Aynı isimli şirket veya ürünleri birleştirmek", "Kaynağın tarihini ve kapsamını atlamak", "Belirsizliği gizlemek"],
    relatedTopics: ["Bilgi grafiği", "Kaynak doğrulama", "Varlık çözümleme", "Editoryal inceleme"],
    sources: [sources.nist],
    faq: [
      { question: "Kaç kaynak yeterlidir?", answer: "Sabit bir sayı yoktur. Kritik iddialar için doğrudan ve güncel birincil kaynak; çelişki varsa kapsamı açıklayan ek kaynak gerekir." },
      { question: "Şirket sitesi tek başına yeterli mi?", answer: "Şirketin kendi faaliyeti için birincil kaynaktır; bağımsız performans, pazar payı veya karşılaştırma iddiaları için tek başına yeterli değildir." },
    ],
    relatedGuideSlugs: ["ai-cevabinda-kaynak-nasil-degerlendirilir", "tesvik-basvurusuna-hazirlik", "ihracata-hazirlik-kontrol-listesi"],
    relatedPaths: [...commonRelatedPaths, { label: "Şirket ve ürün keşfi", href: "/ne-uretir", type: "Kim üretir?" }, { label: "UretirAI merkezi", href: "/uretir-ai", type: "AI aracı" }],
  },
  {
    slug: "ai-cevabinda-kaynak-nasil-degerlendirilir",
    hubId: "uretir-ai",
    title: "Bir AI cevabındaki kaynaklar nasıl değerlendirilir?",
    description: "AI yanıtlarını kaynak yakınlığı, güncellik, kapsam ve belirsizlik ölçütleriyle inceleyin.",
    question: "Bir AI yanıtına ne zaman güvenebilirim?",
    intent: "doğrulama",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 5,
    quickAnswer: "Yanıtın akıcılığına değil; iddiaların izlenebilir kaynaklara dayanmasına, kaynakların güncel ve konuya doğrudan ilgili olmasına ve belirsizliklerin açıkça belirtilmesine güvenin.",
    answers: {
      what: "Kaynak değerlendirme, AI yanıtındaki her karar etkileyen iddianın hangi belgeye dayandığını ve o belgenin neyi gerçekten desteklediğini kontrol etmektir.",
      why: "AI sistemleri ikna edici ancak eksik, eski veya bağlam dışı yanıtlar üretebilir.",
      how: "İddia-kaynak eşleşmesini, yayıncıyı, tarihi, kapsamı, bağımsız doğrulamayı ve belirsizlik notlarını tek tek kontrol edin.",
      who: "AI ile araştırma yapan herkes; özellikle finansal, hukuki, teşvik, fiyat ve yatırım kararı veren kullanıcılar.",
      when: "Yanıt eyleme, ödeme yapmaya, başvuruya veya yayıma dönüşmeden önce.",
      where: "Kaynağın özgün belgesinde veya resmî yayıncı sayfasında; yalnızca AI özetinde değil.",
    },
    steps: ["Yanıttaki karar etkileyen iddiaları ayırın.", "Her iddianın yanında doğrudan kaynak olup olmadığını kontrol edin.", "Kaynağın ilgili cümleyi gerçekten destekleyip desteklemediğini okuyun.", "Tarih, yetki alanı ve hedef kitle farklarını not edin.", "Kritik kararlarda bağımsız uzman veya yetkili kurum doğrulaması alın."],
    pitfalls: ["Kaynak sayısını kalite sanmak", "Arama sonucu özetini kaynak kabul etmek", "Güncelliği kontrol etmemek", "AI'ın belirsizliği kesinlik gibi sunmasına izin vermek"],
    relatedTopics: ["AI güveni", "Kaynak yakınlığı", "Güncellik", "Belirsizlik"],
    sources: [sources.nist],
    faq: [
      { question: "Resmî kaynak her zaman yeterli midir?", answer: "Yetki alanındaki kural veya program için güçlüdür; ancak uygulama bağlamı, güncellik ve belirli durumunuza uygunluk ayrıca değerlendirilmelidir." },
      { question: "Kaynak yoksa yanıt kullanılabilir mi?", answer: "Fikir üretimi için kullanılabilir; doğrulanabilir olgulara veya önemli kararlara temel olmamalıdır." },
    ],
    relatedGuideSlugs: ["uretim-sorusu-nasil-arastirilir", "kampanya-bilgisi-nasil-dogrulanir", "ihracat-destekleri-resmi-kaynaklar"],
    relatedPaths: [...commonRelatedPaths, { label: "UretirAI merkezi", href: "/uretir-ai", type: "AI aracı" }, { label: "TesvikAI merkezi", href: "/tesvik-ai", type: "AI aracı" }],
  },
  {
    slug: "online-alisveriste-kart-secimi",
    hubId: "puan-ai",
    title: "Online alışverişte kart seçimi nasıl yapılır?",
    description: "Ödül görünümünün ötesine geçerek uygunluk, toplam maliyet ve ödeme güvenliğini birlikte değerlendirin.",
    question: "Online alışveriş için en uygun kartı nasıl seçerim?",
    intent: "karşılaştırma",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 6,
    quickAnswer: "Kartı yalnızca kampanya ödülüne göre değil; işyeri uygunluğu, harcama eşiği, vade, ücret, iade koşulları ve alışveriş sonrası toplam maliyet üzerinden karşılaştırın.",
    answers: {
      what: "Kart seçimi, belirli alışveriş için ödeme araçlarının net fayda ve koşullarını aynı tabloda karşılaştırmaktır.",
      why: "Yüksek görünen ödül; eşik, kategori dışı işlem, ücret veya kaçırılan son tarih nedeniyle gerçek faydaya dönüşmeyebilir.",
      how: "Alışveriş tutarı ve işyerini sabitleyin; koşulları doğrulayın; net faydayı toplam maliyetten düşün; alternatif kartla karşılaştırın.",
      who: "Birden fazla kartı olan veya yeni kart başvurusu düşünmeden mevcut seçeneklerini anlamak isteyen kullanıcılar.",
      when: "Ödeme yöntemini seçmeden ve kampanyaya katılım gerekiyorsa satın alma öncesinde.",
      where: "Kartı veren bankanın resmî uygulama, web sitesi ve sözleşme belgelerinde doğrulanır.",
    },
    steps: ["Alışveriş tutarı, kategori, işyeri ve tarihi netleştirin.", "Mevcut kartlarınızı listeleyin; yalnızca yeni kart tekliflerine odaklanmayın.", "Katılım, eşik, üst sınır, taksit ve iade koşullarını resmî kanalda okuyun.", "Puanın kullanım kısıtını ve geçerlilik süresini hesaba katın.", "Net fayda ve toplam geri ödeme üzerinden karar verin."],
    pitfalls: ["Örnek kampanyayı canlı sanmak", "Yalnızca ödül tutarına bakmak", "İade halinde ödül geri alımını atlamak", "Kart ücretini ve borçlanma maliyetini yok saymak"],
    relatedTopics: ["Kredi kartı", "Online alışveriş", "Net fayda", "Kampanya doğrulama"],
    sources: [sources.bddk],
    faq: [
      { question: "En çok puan veren kart her zaman en iyi kart mıdır?", answer: "Hayır. Uygunluk, kullanım kısıtı, ücret ve toplam geri ödeme hesaba katılmadan 'en iyi' sonucu verilemez." },
      { question: "PuanAI sonucu işlem için yeterli midir?", answer: "Hayır. PuanAI yalnızca doğrulanmış kayıtları gösterse de koşullar değişebilir; her kampanya işlemden hemen önce bankanın resmî kanalında ayrıca kontrol edilmelidir." },
    ],
    relatedGuideSlugs: ["taksit-ve-toplam-maliyet-rehberi", "kampanya-bilgisi-nasil-dogrulanir", "hammadde-fiyati-nasil-karsilastirilir"],
    relatedPaths: [...commonRelatedPaths, { label: "PuanAI danışmanı", href: "/puan-ai", type: "AI aracı" }, { label: "PuanAI kampanya alanı", href: "/puan-ai#pa-explorer-title", type: "Doğrulanmış veri" }],
  },
  {
    slug: "taksit-ve-toplam-maliyet-rehberi",
    hubId: "puan-ai",
    title: "Taksit ve toplam maliyet nasıl karşılaştırılır?",
    description: "Aylık ödeme kolaylığı ile toplam geri ödeme yükünü birbirinden ayıran karar çerçevesi.",
    question: "Taksitli alışveriş gerçekten avantajlı mı?",
    intent: "karşılaştırma",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 6,
    quickAnswer: "Taksidi aylık ödeme küçüklüğüyle değil; peşin fiyat, taksitli toplam, kart borcunun tam ödeme planı ve vazgeçilen alternatif fayda ile karşılaştırın.",
    answers: {
      what: "Toplam maliyet, ürün fiyatına ek olarak vade farkı, ücret, faiz riski ve ödeme planının nakit akışına etkisini kapsar.",
      why: "Aylık tutarın düşük olması toplam maliyetin düşük olduğu anlamına gelmez.",
      how: "Peşin ve taksitli toplamı aynı para birimi ve tarihte yazın; ek ücretleri ekleyin; borcun tamamını zamanında ödeme kapasitesini test edin.",
      who: "Taksitli satın alma düşünen bireyler ve işletme harcaması planlayan küçük ekipler.",
      when: "Ödeme ekranında taksit seçmeden ve bütçe taahhüdü vermeden önce.",
      where: "Satıcı ödeme ekranı, banka kart koşulları ve hesap özetinde kontrol edilir.",
    },
    steps: ["Peşin fiyatı kaydedin.", "Taksitli toplam tutarı ve taksit sayısını kaydedin.", "Vade farkı, ücret ve olası gecikme maliyetini ayırın.", "Aylık nakit akışında tüm taksitleri birlikte görün.", "Tasarruf veya ödül varsa yalnızca gerçekten kullanılabilir kısmı düşün."],
    pitfalls: ["Aylık taksidi toplam maliyet sanmak", "Diğer kart borçlarını hesaba katmamak", "Koşullu ödülü kesin kazanç saymak", "Gecikme riskini yok saymak"],
    relatedTopics: ["Taksit", "Nakit akışı", "Toplam geri ödeme", "Bütçe"],
    sources: [sources.bddk],
    faq: [
      { question: "Sıfır faiz ifadesi her zaman ek maliyet yok demek midir?", answer: "Hayır. Peşin ve taksitli satış fiyatı, ücretler ve koşullar ayrı ayrı kontrol edilmelidir." },
      { question: "Taksit sayısı arttıkça avantaj artar mı?", answer: "Genellikle otomatik olarak artmaz; nakit akışı rahatlığı ile toplam maliyet ve borç süresi birlikte değerlendirilmelidir." },
    ],
    relatedGuideSlugs: ["online-alisveriste-kart-secimi", "kampanya-bilgisi-nasil-dogrulanir", "fiyat-serisi-nasil-okunur"],
    relatedPaths: [...commonRelatedPaths, { label: "PuanAI danışmanı", href: "/puan-ai#danisman", type: "AI aracı" }, { label: "FiyatAI merkezi", href: "/fiyat-ai", type: "AI aracı" }],
  },
  {
    slug: "kampanya-bilgisi-nasil-dogrulanir",
    hubId: "puan-ai",
    title: "Bir kart kampanyası nasıl doğrulanır?",
    description: "Kaynak, katılım, uygunluk, tarih ve iade koşullarını işlemden önce kontrol edin.",
    question: "Gördüğüm kampanyanın bana uygun ve güncel olduğunu nasıl anlarım?",
    intent: "doğrulama",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 5,
    quickAnswer: "Kampanyayı bankanın resmî kanalında bulun; başlangıç-bitiş tarihi, kart ve müşteri uygunluğu, katılım yöntemi, işyeri kapsamı, eşikler ve iade koşullarını işlemden önce kaydedin.",
    answers: {
      what: "Kampanya doğrulama, bir duyurunun güncel sürümünü ve sizin işlem koşullarınızla eşleşmesini kontrol etmektir.",
      why: "Kampanyalar değişebilir, kişiye özel olabilir veya belirli işyeri ve işlem türlerini dışarıda bırakabilir.",
      how: "Resmî kaynağı açın, güncellik ve kapsamı kontrol edin, katılımı tamamlayın ve koşulların ekran görüntüsü veya bağlantısını saklayın.",
      who: "Kart kampanyasıyla ödeme yapmayı planlayan her kullanıcı.",
      when: "Satın alma işleminden hemen önce ve ödülün hesaba geçmesi gereken tarihte.",
      where: "Bankanın resmî uygulaması, web sitesi, sözleşmesi veya yetkili müşteri hizmetleri kanalı.",
    },
    steps: ["Kaynağın gerçekten kartı veren bankaya ait olduğunu kontrol edin.", "Kampanya tarihini ve son güncelleme bilgisini okuyun.", "Kart, müşteri, sektör, işyeri ve işlem türü uygunluğunu eşleştirin.", "Katılım gerekiyorsa işlemden önce tamamlayın.", "Ödül üst sınırı, kullanım süresi ve iade koşullarını kaydedin."],
    pitfalls: ["Sosyal medya görselini tek kaynak kabul etmek", "Kampanya başlığını koşulların tamamı sanmak", "Katılım adımını atlamak", "Eski ekran görüntüsünü güncel kabul etmek"],
    relatedTopics: ["Kampanya koşulları", "Güncellik", "Uygunluk", "Resmî kaynak"],
    sources: [sources.bddk],
    faq: [
      { question: "PuanAI bir kampanyayı doğrulanmış olarak işaretleyecek mi?", answer: "Gelecekte yalnızca kaynak kimliği, güncellik, kapsam ve kontrol zamanı doğrulanan kayıtlar bu etiketi alabilir." },
      { question: "Kampanya sayfası değişirse ne yapmalıyım?", answer: "İşlem anındaki güncel koşulları esas alın ve gerekirse bankanın yetkili kanalından teyit alın." },
    ],
    relatedGuideSlugs: ["online-alisveriste-kart-secimi", "ai-cevabinda-kaynak-nasil-degerlendirilir", "tesvik-basvurusuna-hazirlik"],
    relatedPaths: [...commonRelatedPaths, { label: "PuanAI merkezi", href: "/puan-ai", type: "AI aracı" }, { label: "UretirAI merkezi", href: "/uretir-ai", type: "AI aracı" }],
  },
  {
    slug: "tesvik-basvurusuna-hazirlik",
    hubId: "tesvik-ai",
    title: "Teşvik başvurusuna nasıl hazırlanılır?",
    description: "Program aramasından önce proje, işletme, bütçe ve kanıt dosyanızı yapılandırın.",
    question: "Bir teşvik programına başvurmadan önce ne hazırlamalıyım?",
    intent: "hazırlık",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 7,
    quickAnswer: "Önce yatırım veya proje hedefini, işletme profilini, gider kalemlerini, takvimi ve beklenen çıktıları tek dosyada netleştirin; sonra güncel resmî program koşullarıyla eşleştirin.",
    answers: {
      what: "Başvuru hazırlığı, destek aramadan önce projenin gerekçe, faaliyet, bütçe, takvim, ekip ve çıktılarını kanıtlarla tanımlamaktır.",
      why: "Program adına göre başlamak, uygun olmayan çağrılara zaman ayırmaya ve eksik belgeye yol açabilir.",
      how: "İşletme ve proje profilini çıkarın; giderleri sınıflandırın; çıktıları ölçülebilir yazın; resmî uygunluk şartlarıyla eşleştirin.",
      who: "KOBİ'ler, girişimler, üreticiler, Ar-Ge ekipleri ve ihracat yatırımı planlayan işletmeler.",
      when: "Çağrı son tarihinden bağımsız olarak proje fikri netleştiğinde; başvuru dönemi açılmadan önce.",
      where: "İşletmenin proje dosyasında ve ilgili kurumun güncel elektronik başvuru veya duyuru kanalında.",
    },
    steps: ["İşletme bilgilerini ve yetkili kişileri güncelleyin.", "Projenin sorununu, hedefini ve ölçülebilir çıktısını yazın.", "Faaliyetleri sorumlu, süre ve maliyetle eşleştirin.", "Giderleri teklif ve teknik gerekçelerle destekleyin.", "Program koşullarını yalnızca güncel resmî kaynaktan kontrol edin.", "İçerik ve mali kontrol için ikinci bir göz incelemesi planlayın."],
    pitfalls: ["Programı projeden önce seçmek", "Destek oranını kesin gelir saymak", "Son tarihe yakın belge toplamaya başlamak", "Resmî duyuru yerine özet içerikle hareket etmek"],
    relatedTopics: ["KOSGEB", "TÜBİTAK", "Proje bütçesi", "Başvuru dosyası"],
    sources: [sources.kosgeb, sources.tubitak, sources.tradeSupports],
    faq: [
      { question: "Aynı proje birden fazla desteğe uygun olabilir mi?", answer: "Olabilir; ancak giderlerin mükerrer finansmanı ve programların birlikte kullanım şartları resmî belgelerden kontrol edilmelidir." },
      { question: "TesvikAI başvuruyu onaylar mı?", answer: "Hayır. Uygunluk ve kabul yetkili kuruma aittir; TesvikAI hazırlık ve kaynak keşfi sağlar." },
    ],
    relatedGuideSlugs: ["tesvik-uygunluk-kontrol-listesi", "tesvik-basvurusu-gerekli-belgeler", "ihracat-destekleri-resmi-kaynaklar"],
    relatedPaths: [...commonRelatedPaths, { label: "TesvikAI merkezi", href: "/tesvik-ai", type: "AI aracı" }, { label: "IhracatAI merkezi", href: "/ihracat-ai", type: "AI aracı" }],
  },
  {
    slug: "tesvik-uygunluk-kontrol-listesi",
    hubId: "tesvik-ai",
    title: "Teşvik uygunluğu nasıl ön değerlendirilir?",
    description: "İşletme, proje, gider, coğrafya ve zaman koşullarını başvuru öncesinde ayırın.",
    question: "Bir desteğe uygun olup olmadığımı nasıl kontrol ederim?",
    intent: "doğrulama",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 6,
    quickAnswer: "Uygunluğu beş katmanda kontrol edin: başvuru sahibi, proje konusu, desteklenebilir gider, uygulama yeri ve zaman koşulları. Her eşleşmenin yanına resmî belge maddesini ekleyin.",
    answers: {
      what: "Ön değerlendirme, başvurunun kabul edileceğini söylemek değil; temel uygunluk boşluklarını erken bulmaktır.",
      why: "Bir program genel olarak sektöre uygun görünse bile işletme yaşı, bölge, gider türü veya çağrı dönemi farklı olabilir.",
      how: "Koşulları kontrol listesine dönüştürün; her maddeyi evet, hayır veya doğrulanmalı olarak işaretleyin.",
      who: "Bir destek programını kısa listeye alan işletme sahipleri, proje ekipleri ve danışmanlar.",
      when: "Ayrıntılı başvuru metni ve teklif toplamaya başlamadan önce; ayrıca resmî çağrı güncellendiğinde.",
      where: "Program uygulama esasları, çağrı metni ve yetkili kurumun resmî başvuru sayfasında.",
    },
    steps: ["Başvuru sahibi türü ve kayıt koşullarını kontrol edin.", "Sektör, teknoloji ve faaliyet konusunu program kapsamıyla eşleştirin.", "Her gider kaleminin desteklenebilirliğini ayrı doğrulayın.", "Bölge, ölçek ve dönem koşullarını kaydedin.", "Belirsiz maddeler için yetkili kurumun açıklamasını veya yazılı görüşünü arayın."],
    pitfalls: ["Program adından uygunluk çıkarmak", "Geçmiş çağrı şartlarını güncel sanmak", "Desteklenmeyen gideri bütçenin merkezine koymak", "Ön değerlendirmeyi kurum kararı gibi sunmak"],
    relatedTopics: ["Uygunluk", "Çağrı metni", "Desteklenebilir gider", "Resmî doğrulama"],
    sources: [sources.kosgeb, sources.tubitak, sources.tradeSupports],
    faq: [
      { question: "Ön değerlendirme sonucu kesin midir?", answer: "Hayır. Resmî başvuru değerlendirmesi ve kurumun güncel yorumları belirleyicidir." },
      { question: "Koşullar ne sıklıkla kontrol edilmeli?", answer: "Başvuru başlangıcında, dosya tamamlanmadan önce ve gönderim gününde resmî kaynak yeniden kontrol edilmelidir." },
    ],
    relatedGuideSlugs: ["tesvik-basvurusuna-hazirlik", "tesvik-basvurusu-gerekli-belgeler", "ai-cevabinda-kaynak-nasil-degerlendirilir"],
    relatedPaths: [...commonRelatedPaths, { label: "TesvikAI merkezi", href: "/tesvik-ai", type: "AI aracı" }, { label: "UretirAI merkezi", href: "/uretir-ai", type: "AI aracı" }],
  },
  {
    slug: "tesvik-basvurusu-gerekli-belgeler",
    hubId: "tesvik-ai",
    title: "Teşvik başvuru belgeleri nasıl yönetilir?",
    description: "Değişen program listelerini kopyalamak yerine izlenebilir bir belge envanteri kurun.",
    question: "Başvuru belgelerini eksiksiz ve güncel nasıl tutarım?",
    intent: "hazırlık",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 6,
    quickAnswer: "Her belge için sahip, sürüm, tarih, geçerlilik, kaynak program maddesi ve teslim durumunu kaydeden bir envanter oluşturun; kesin listeyi güncel resmî çağrıdan alın.",
    answers: {
      what: "Belge yönetimi, yalnızca dosya toplamak değil; her belgenin doğru sürümünü, sahibini ve hangi koşulu kanıtladığını izlemektir.",
      why: "Programlara göre belge adı, formatı ve geçerlilik süresi değişebilir; eski liste kullanmak başvuruyu riske atar.",
      how: "Resmî listeyi envantere aktarın; sorumlu ve son tarih atayın; sürüm ve imza kontrolü yapın.",
      who: "Başvuru sahibi, mali işler, proje yöneticisi, teknik ekip ve yetkili imza sahipleri.",
      when: "Başvuru planı oluştuğunda başlar; gönderim öncesi son kez dondurulur ve arşivlenir.",
      where: "Erişim kontrollü kurumsal belge deposunda ve resmî elektronik başvuru sisteminde.",
    },
    steps: ["Güncel resmî belge listesinin bağlantısını ve erişim tarihini kaydedin.", "Her belgeye sorumlu kişi ve teslim tarihi atayın.", "Dosya adı, sürüm, imza ve geçerlilik kontrollerini standartlaştırın.", "Bütçe, faaliyet ve belgeler arasındaki tutarlılığı kontrol edin.", "Gönderilen nihai paketi değiştirilemez bir arşiv olarak saklayın."],
    pitfalls: ["İnternetteki eski kontrol listesini kullanmak", "Belgeyi hazırlayan ve onaylayanı karıştırmak", "Dosya sürümünü izlememek", "Gönderim kanıtını saklamamak"],
    relatedTopics: ["Belge envanteri", "Sürüm kontrolü", "Başvuru takvimi", "Denetim izi"],
    sources: [sources.kosgeb, sources.tubitak, sources.tradeSupports],
    faq: [
      { question: "Bu rehberde neden sabit belge listesi yok?", answer: "Belge gereksinimleri programa ve döneme göre değişebilir. Sabit liste yanlış güven yaratır; güncel resmî çağrı esas alınmalıdır." },
      { question: "Elektronik yükleme sonrası dosyalar saklanmalı mı?", answer: "Evet. Gönderilen sürüm, zaman damgası ve başvuru kanıtı kurum içi arşivde tutulmalıdır." },
    ],
    relatedGuideSlugs: ["tesvik-basvurusuna-hazirlik", "tesvik-uygunluk-kontrol-listesi", "ihracata-hazirlik-kontrol-listesi"],
    relatedPaths: [...commonRelatedPaths, { label: "TesvikAI merkezi", href: "/tesvik-ai", type: "AI aracı" }, { label: "IhracatAI merkezi", href: "/ihracat-ai", type: "AI aracı" }],
  },
  {
    slug: "hammadde-fiyati-nasil-karsilastirilir",
    hubId: "fiyat-ai",
    title: "Hammadde fiyatı nasıl karşılaştırılır?",
    description: "Birim, kalite, teslim, kur ve ödeme koşullarını normalize ederek teklifler arasında gerçek karşılaştırma yapın.",
    question: "İki hammadde teklifini nasıl aynı zeminde karşılaştırırım?",
    intent: "karşılaştırma",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 7,
    quickAnswer: "Teklifleri aynı miktar, kalite standardı, para birimi, teslim yeri, vergi kapsamı ve ödeme tarihinde normalize edin; sonra lojistik, fire, stok ve kalite riskini toplam maliyete ekleyin.",
    answers: {
      what: "Hammadde karşılaştırması, görünen birim fiyatları satın alma noktasındaki eşdeğer toplam maliyete dönüştürmektir.",
      why: "Ucuz görünen teklif; farklı kalite, daha yüksek fire, uzak teslim veya kısa ödeme vadesi nedeniyle pahalı olabilir.",
      how: "Teknik şartnameyi sabitleyin; birim ve para birimini eşitleyin; teslim, vergi, finansman ve kalite maliyetlerini ekleyin.",
      who: "Satın alma, finans, üretim planlama, kalite ve tedarik zinciri ekipleri.",
      when: "Teklif istemeden önce teknik kapsamı kurarken ve sipariş onayından hemen önce.",
      where: "Teklif karşılaştırma tablosu, teknik şartname, kalite belgeleri ve tedarikçi sözleşmesi içinde.",
    },
    steps: ["Ortak teknik şartname ve kabul kriteri oluşturun.", "Miktar, birim ve para birimini eşitleyin.", "Teslim yeri, lojistik, vergi ve ödeme vadesini normalize edin.", "Fire, kalite reddi, minimum sipariş ve stok maliyetini ekleyin.", "Sonucu duyarlılık senaryolarıyla test edin."],
    pitfalls: ["Farklı kalite sınıflarını aynı ürün sanmak", "Kur tarihini belirtmemek", "Teslim ve vergi kapsamını atlamak", "Tek fiyat noktasından trend sonucu çıkarmak"],
    relatedTopics: ["Hammadde", "Toplam sahip olma maliyeti", "Teknik şartname", "Tedarikçi"],
    sources: [sources.tuik],
    faq: [
      { question: "TÜİK verisi tedarikçi fiyatını doğrular mı?", answer: "Doğrudan doğrulamaz. Resmî istatistikler genel eğilimi anlamaya yardım eder; belirli teklif kendi kapsamıyla incelenmelidir." },
      { question: "En düşük birim fiyat seçilmeli mi?", answer: "Yalnızca kalite, teslim, ödeme ve risk koşulları eşitse anlamlıdır; aksi halde toplam maliyet karşılaştırılmalıdır." },
    ],
    relatedGuideSlugs: ["fiyat-serisi-nasil-okunur", "taksit-ve-toplam-maliyet-rehberi", "ihracata-hazirlik-kontrol-listesi"],
    relatedPaths: [...commonRelatedPaths, { label: "FiyatAI merkezi", href: "/fiyat-ai", type: "AI aracı" }, { label: "IhracatAI merkezi", href: "/ihracat-ai", type: "AI aracı" }],
  },
  {
    slug: "fiyat-serisi-nasil-okunur",
    hubId: "fiyat-ai",
    title: "Bir fiyat serisi nasıl doğru okunur?",
    description: "Baz dönem, birim, frekans ve kaynak değişikliklerini kontrol ederek eğilimi yorumlayın.",
    question: "Fiyat grafiğindeki artış veya düşüş ne anlama gelir?",
    intent: "öğrenme",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 6,
    quickAnswer: "Grafiği yorumlamadan önce serinin neyi ölçtüğünü, birimini, para birimini, frekansını, baz dönemini ve revizyon bilgisini okuyun; nominal fiyatı gerçek satın alma maliyetiyle karıştırmayın.",
    answers: {
      what: "Fiyat serisi, aynı tanımlı ölçümün zaman içindeki değerlerini gösterir; tek bir teklif veya tüm pazarın fiyatı değildir.",
      why: "Seri kapsamı ve baz değişikliği bilinmeden yüzdesel hareket yanlış yorumlanabilir.",
      how: "Meta veriyi okuyun, karşılaştırılan dönemleri eşitleyin, aykırı değer ve revizyonları işaretleyin, bağlam göstergeleriyle birlikte yorumlayın.",
      who: "Satın alma, finans, yatırım, fiyatlandırma ve içerik ekipleri.",
      when: "Bütçe, sözleşme, fiyat güncelleme veya pazar eğilimi kararı öncesinde.",
      where: "Veri sağlayıcının özgün portalında, seri açıklaması ve revizyon notlarıyla birlikte.",
    },
    steps: ["Seri adı ve kapsam tanımını okuyun.", "Birim, para birimi, frekans ve mevsimsellik bilgisini kaydedin.", "Aynı dönemleri karşılaştırın.", "Baz değişimi ve veri revizyonlarını kontrol edin.", "Eğilimi tek başına satın alma kararı yerine senaryo girdisi olarak kullanın."],
    pitfalls: ["Endeksi para tutarı sanmak", "Aylık ve yıllık değişimi karıştırmak", "Revizyonu atlamak", "Korelasyonu neden-sonuç gibi sunmak"],
    relatedTopics: ["Fiyat endeksi", "Trend", "Baz dönem", "Resmî istatistik"],
    sources: [sources.tuik],
    faq: [
      { question: "Fiyat endeksi ürünün güncel satış fiyatını gösterir mi?", answer: "Genellikle hayır. Endeks belirli bir kapsam içindeki değişimi ölçer; tekil piyasa teklifi değildir." },
      { question: "Tek aylık düşüş kalıcı trend midir?", answer: "Tek başına değildir. Daha uzun dönem, mevsimsellik, revizyon ve ilgili maliyet sürücüleri birlikte incelenmelidir." },
    ],
    relatedGuideSlugs: ["hammadde-fiyati-nasil-karsilastirilir", "taksit-ve-toplam-maliyet-rehberi", "uretim-sorusu-nasil-arastirilir"],
    relatedPaths: [...commonRelatedPaths, { label: "FiyatAI merkezi", href: "/fiyat-ai", type: "AI aracı" }, { label: "UretirAI merkezi", href: "/uretir-ai", type: "AI aracı" }],
  },
  {
    slug: "ihracata-hazirlik-kontrol-listesi",
    hubId: "ihracat-ai",
    title: "İhracata hazırlık kontrol listesi nasıl oluşturulur?",
    description: "Ürün, kapasite, uygunluk, fiyatlama, satış ve operasyon hazırlığını tek bir karar çerçevesinde değerlendirin.",
    question: "İşletmem ihracata başlamaya hazır mı?",
    intent: "hazırlık",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 8,
    quickAnswer: "Hazırlığı altı başlıkta puanlayın: ürün ve mevzuat, kapasite ve kalite, hedef müşteri, fiyat ve ödeme, lojistik ve belge, ekip ve destek. Kritik boşluklar kapanmadan pazar harcamasını büyütmeyin.",
    answers: {
      what: "İhracata hazırlık, satış isteğinden önce ürünün, işletmenin ve operasyonun sınır ötesi gereklilikleri karşılayabilme kapasitesidir.",
      why: "Pazar talebi olsa bile uygunluk belgesi, teslim kapasitesi, fiyatlama veya tahsilat eksikliği sürdürülebilir satışı engelleyebilir.",
      how: "Her başlığa kanıt ekleyin; hazır, geliştirilmeli veya kritik boşluk olarak işaretleyin; sahip ve tarih atayın.",
      who: "İhracata ilk kez başlayacak üreticiler ve yeni pazara girecek mevcut ihracatçılar.",
      when: "Hedef ülkeye satış yatırımı yapmadan ve müşteri taahhüdü vermeden önce; her yeni ürün-pazar eşleşmesinde.",
      where: "Şirketin ihracat çalışma dosyasında ve Ticaret Bakanlığı'nın güncel bilgi kaynaklarında.",
    },
    steps: ["Ürünün GTİP ve uygunluk gereksinimlerini uzmanla doğrulayın.", "Kapasite, kalite ve teslim performansı kanıtlarını hazırlayın.", "Hedef müşteri ve kanal hipotezini araştırın.", "Fiyatı kur, lojistik, vergi ve ödeme riskiyle test edin.", "Belge, sözleşme, tahsilat ve iade akışını yazın.", "Sorumlu ekip ve 90 günlük boşluk kapatma planı oluşturun."],
    pitfalls: ["Ülke seçimini yalnızca pazar büyüklüğüne dayandırmak", "GTİP'i tahmin etmek", "Lojistik ve tahsilat riskini fiyat dışında bırakmak", "Destek varlığını pazar talebi sanmak"],
    relatedTopics: ["Hedef pazar", "GTİP", "Lojistik", "İhracat fiyatlaması"],
    sources: [sources.tradeExport, sources.tradeSources],
    faq: [
      { question: "Hazırlık kontrolü olumluysa ihracat başarısı garanti midir?", answer: "Hayır. Kontrol listesi temel riskleri görünür kılar; müşteri doğrulaması ve saha öğrenmesi yine gereklidir." },
      { question: "GTİP'i Uretir belirleyebilir mi?", answer: "Hayır. Teknik ürün bilgisi ve güncel mevzuatla yetkili uzman doğrulaması gerekir." },
    ],
    relatedGuideSlugs: ["ihracat-destekleri-resmi-kaynaklar", "hammadde-fiyati-nasil-karsilastirilir", "tesvik-basvurusuna-hazirlik"],
    relatedPaths: [...commonRelatedPaths, { label: "IhracatAI merkezi", href: "/ihracat-ai", type: "AI aracı" }, { label: "TesvikAI merkezi", href: "/tesvik-ai", type: "AI aracı" }],
  },
  {
    slug: "ihracat-destekleri-resmi-kaynaklar",
    hubId: "ihracat-ai",
    title: "İhracat destekleri hangi resmî kaynaklardan izlenir?",
    description: "Destek özetleri yerine güncel kapsam, başvuru ve değişiklik bilgisini yetkili kaynaklardan takip edin.",
    question: "İhracat destekleri hakkında güvenilir ve güncel bilgiye nereden ulaşırım?",
    intent: "doğrulama",
    status: "in_review",
    createdAt: "2026-07-24",
    updatedAt: "2026-07-24",
    readingTimeMinutes: 6,
    quickAnswer: "Ticaret Bakanlığı'nın ihracat ve destek sayfalarını başlangıç noktası yapın; her program için uygulama belgesi, yararlanıcı, gider, tarih ve başvuru kanalını özgün resmî kaynaktan kaydedin.",
    answers: {
      what: "Resmî kaynak takibi, destek programlarının güncel uygulama belgeleri ve duyurularındaki değişiklikleri düzenli izlemektir.",
      why: "Destek oranı, kapsamı, başvuru kanalı ve uygunluk koşulları değişebilir; eski özetler yanlış yönlendirebilir.",
      how: "Yetkili kurum sayfasını izleyin; belge sürümü ve erişim tarihini kaydedin; değişiklikleri başvuru planına yansıtın.",
      who: "İhracatçı ve üretici işletmeler, proje ekipleri, mali işler ve danışmanlar.",
      when: "Program araştırmasının başında, başvuru dosyası hazırlanırken ve gönderim gününde.",
      where: "T.C. Ticaret Bakanlığı'nın resmî ihracat ve destek kanallarında.",
    },
    steps: ["Yetkili kurum ve programın özgün sayfasını bulun.", "Uygulama belgesi, genelge veya kararın sürümünü kaydedin.", "Yararlanıcı, gider, süre ve başvuru koşullarını ayrı çıkarın.", "Duyuru ve belge değişiklikleri için sorumlu atayın.", "Kritik yorumu yetkili kurum veya uzmanla doğrulayın."],
    pitfalls: ["Arama motoru özetini güncel kural sanmak", "Eski PDF'i son sürüm kabul etmek", "Destek tutarını kesin hak ediş saymak", "Başvuru ve ödeme koşullarını karıştırmak"],
    relatedTopics: ["İhracat desteği", "Ticaret Bakanlığı", "Resmî kaynak", "Güncelleme takibi"],
    sources: [sources.tradeSupports, sources.tradeExport, sources.tradeSources],
    faq: [
      { question: "Uretir güncel destek tutarlarını yayımlayacak mı?", answer: "Yalnızca kaynak sürümü, geçerlilik tarihi ve editoryal inceleme doğrulandığında; aksi halde kullanıcı doğrudan resmî kaynağa yönlendirilir." },
      { question: "Resmî sayfadaki özet yeterli mi?", answer: "İlk yönlendirme için yararlıdır; başvuru kararı için güncel uygulama belgesi ve ilgili koşullar da okunmalıdır." },
    ],
    relatedGuideSlugs: ["ihracata-hazirlik-kontrol-listesi", "tesvik-uygunluk-kontrol-listesi", "ai-cevabinda-kaynak-nasil-degerlendirilir"],
    relatedPaths: [...commonRelatedPaths, { label: "IhracatAI merkezi", href: "/ihracat-ai", type: "AI aracı" }, { label: "TesvikAI merkezi", href: "/tesvik-ai", type: "AI aracı" }],
  },
];

export function getContentHub(id: ContentHubId) {
  return contentHubs.find((hub) => hub.id === id);
}

export function getHubGuides(id: ContentHubId) {
  return hubGuides.filter((guide) => guide.hubId === id);
}

export function getHubGuide(slug: string) {
  return hubGuides.find((guide) => guide.slug === slug);
}
