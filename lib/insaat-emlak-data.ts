export type InsaatGuide = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
  institution: string;
  metricSummary: string;
  summary: string;
  seoDescription: string;
  highlights: string[];
  steps: string[];
  officialUrl: string;
  updatedAt: string;
};

export const INSAAT_GUIDES: InsaatGuide[] = [
  {
    id: "mustakil-ev-insaat-maliyeti",
    slug: "mustakil-ev-ve-villa-insaat-maliyeti-hesaplama",
    title: "Müstakil Ev, Betonarme, Çelik ve Prefabrik Ev İnşaat Maliyeti Hesaplama",
    shortTitle: "Müstakil Ev & Villa m² İnşaat Maliyeti",
    badge: "KABA + ANAHTAR TESLİM",
    institution: "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı Yapı Yaklaşık Birim Maliyetleri",
    metricSummary: "Betonarme: 19.500–28.000 TL/m² · Çelik: 17.500–24.500 TL/m² · Prefabrik: 12.500–17.500 TL/m²",
    summary:
      "Arsa üzerine 100 m², 120 m², 150 m² veya 200 m² müstakil ev yaptırmak isteyenler için kaba inşaat (temel, demir, beton, duvar, çatı) ve ince işçilik (tesisat, cephe, doğrama, mutfak/banyo) dahil anahtar teslim maliyet kırılımı.",
    seoDescription:
      "100 m², 120 m² ve 150 m² müstakil ev inşaat maliyeti ne kadar? Betonarme, hafif çelik ve prefabrik ev m² birim fiyatları, kaba inşaat ve anahtar teslim bütçe hesaplama.",
    highlights: [
      "100 m² betonarme evde ortalama 4,5 – 5,5 ton inşaat demiri ve 95 – 115 m³ C30 hazır beton kullanılır",
      "Toplam inşaat bütçesinin yaklaşık %42'si kaba inşaat, %48'i ince işçilik ve %10'u proje/ruhsat/SGK gideridir",
      "Bakanlık Yapı Sınıfı (III-A ve III-B) birim maliyetleri ruhsat harcı ve asgari işçilik hesabında esas alınır",
    ],
    steps: [
      "Belediyeden arsanızın imar durum belgesini (TAKS/KAKS ve kat adedi) alın ve zemin etüdü yaptırın.",
      "Mimari, statik, mekanik ve elektrik projelerini hazırlatarak yapı ruhsatı başvurusu yapın.",
      "Yapı denetim kuruluşu gözetiminde temel, kaba inşaat ve ince imalat aşamalarını tamamlayıp İskân (Yapı Kullanma İzin Belgesi) alın.",
    ],
    officialUrl: "https://www.csb.gov.tr",
    updatedAt: "2026-07-25",
  },
  {
    id: "yarisi-bizden-kentsel-donusum",
    slug: "yarisi-bizden-kentsel-donusum-hibe-ve-kredi-hesaplama",
    title: "Yarısı Bizden Kentsel Dönüşüm Kampanyası (Hibe + Kredi + Tahliye Desteği) Hesaplama",
    shortTitle: "Yarısı Bizden Hibe & Kredi Hesaplama",
    badge: "700 BİN TL HİBE + 700 BİN TL KREDİ",
    institution: "Kentsel Dönüşüm Başkanlığı (Çevre, Şehircilik ve İklim Değişikliği Bakanlığı)",
    metricSummary: "Konut başına 700.000 TL Hibe + 700.000 TL Kredi + 100.000 TL Taşınma Desteği (Toplam 1.500.000 TL)",
    summary:
      "Riskli yapıların yenilenmesi için devlet tarafından her bir konut hak sahibine verilen 700 bin TL karşılıksız hibe, 2 yıl geri ödemesiz ve 10 yıl vadeli 700 bin TL yapım kredisi ile 100 bin TL tek seferlik tahliye/taşınma desteğini hesaplar.",
    seoDescription:
      "Yarısı Bizden kentsel dönüşüm kampanyası şartları ve geri ödeme tablosu: 700 bin TL hibe, 700 bin TL kredi ve 100 bin TL taşınma desteği nasıl alınır?",
    highlights: [
      "700.000 TL hibe kısmı geri ödemesizdir; doğrudan bina yapım hakedişlerine aktarılır",
      "700.000 TL kredi kısmında ruhsat tarihinden itibaren ilk 24 ay ödeme yoktur; 10 yıl (120 ay) vade uygulanır",
      "İlk yıl faizsiz olan kredide sonraki yıllarda artış oranı TÜFE'nin yarısı (maksimum %15/30 sınırı) ile sınırlandırılır",
    ],
    steps: [
      "Lisanslı kuruluş aracılığıyla binanız için Riskli Yapı Tespiti yaptırın ve kat malikleriyle uzlaşma sağlayın.",
      "Müteahhit firma ile sözleşme imzalayıp yeni yapı ruhsatını alın.",
      "Hak sahipliği tespiti sonrasında hibe ve kredi sözleşmesiyle ödemelerin müteahhit hakedişlerine aktarılmasını başlatın.",
    ],
    officialUrl: "https://www.turkiye.gov.tr/csb-hak-sahipleri-icin-kira-yardimi-basvurusu",
    updatedAt: "2026-07-25",
  },
  {
    id: "toki-sosyal-konut-arsa",
    slug: "toki-sosyal-konut-ve-ilk-evim-arsa-basvuru-rehberi",
    title: "TOKİ Sosyal Konut, İlk Evim Arsa ve Kura Başvuru Şartları & Taksit Hesaplama",
    shortTitle: "TOKİ Sosyal Konut & İlk Evim Arsa",
    badge: "%10 PEŞİNAT · 240 AY VADE",
    institution: "Toplu Konut İdaresi Başkanlığı (TOKİ)",
    metricSummary: "2+1 ve 3+1 Konutlarda %10 Peşinat · 240 Ay Vade · Müstakil ve Müşterek İmarlı Arsa Tahsisi",
    summary:
      "Evi olmayan dar ve orta gelirli vatandaşlar, gençler, emekliler, engelliler ve şehit/gazi yakınları için TOKİ tarafından 81 ilde yürütülen sosyal konut ve altyapısı hazır imarlı arsa projelerinin başvuru kriterleri ve taksit yapısı.",
    seoDescription:
      "TOKİ sosyal konut ve İlk Evim Arsa başvuru şartları: Hane gelir sınırı, yaş şartı, e-Devlet TOKİ kura sonucu sorgulama ve 240 ay vadeli taksit hesaplama.",
    highlights: [
      "Başvuru sahibinin, eşinin ve velayeti altındaki çocuklarının üzerine kayıtlı tapuda bağımsız konut bulunmaması şarttır",
      "Genç kategorisi (18-30 yaş), Emekliler (%20 kontenjan) ve Engelliler (%5 kontenjan) için ayrı kura çekilir",
      "İlk Evim Arsa tahsislerinde 2 yıl içinde inşaatına başlama ve 10 yıl faizsiz sabit taksit imkânı sunulur",
    ],
    steps: [
      "TOKİ resmî duyuru takviminde e-Devlet 'TOKİ Konut / İş Yeri Başvurusu' ekranından il ve proje seçimi yapın.",
      "Ziraat Bankası veya Halkbank nezdinde açılan başvuru hesabına başvuru bedelini yatırın.",
      "Noter huzurunda yapılan hak sahipliği kurasını e-Devlet TOKİ Kura Sonucu Sorgulama ekranından takip edin.",
    ],
    officialUrl: "https://www.turkiye.gov.tr/toplu-konut-idaresi-baskanligi-toki",
    updatedAt: "2026-07-25",
  },
  {
    id: "arsa-taks-kaks-emsal",
    slug: "arsa-taks-kaks-emsal-ve-kat-karsiligi-hesaplama",
    title: "Arsa İmar Durumu (TAKS / KAKS / Emsal) ve Kat Karşılığı Daire Paylaşımı Hesaplama",
    shortTitle: "Arsa TAKS / KAKS (Emsal) & Kat Karşılığı",
    badge: "İMAR & MÜTEAHHİT PAYI ROBOTU",
    institution: "Planlı Alanlar İmar Yönetmeliği Standartları",
    metricSummary: "Taban Oturumu = Arsa m² × TAKS · Toplam İnşaat Alanı = Arsa m² × KAKS (Emsal) × 1,30 Brüt Katsayısı",
    summary:
      "Arsanızın yüzölçümüne, TAKS (Taban Alanı Katsayısı) ve KAKS/Emsal değerine göre kaç m² bina oturumu yapılacağını, toplam kaç daire çıkacağını ve kat karşılığı sözleşmede arsa sahibine kaç daire düşeceğini hesaplar.",
    seoDescription:
      "Arsa TAKS KAKS (emsal) hesaplama robotu: Arsaya kaç m² inşaat yapılır, kaç kat ve kaç daire çıkar? Kat karşılığı müteahhit arsa sahibi daire paylaşımı.",
    highlights: [
      "TAKS (Örn: 0.30), binanın zeminde oturabileceği maksimum taban alanını belirler",
      "KAKS / Emsal (Örn: 1.50), tüm katların toplam net emsal inşaat alanını belirler",
      "Balkon, merdiven evi, asansör ve ortak alanlarla birlikte brüt inşaat alanı emsal alanın yaklaşık %25-%30 fazlasına ulaşır",
    ],
    steps: [
      "Tapu parsel numaranızla ilgili belediyenin e-İmar uygulamasından TAKS, KAKS ve Yençok (kat yüksekliği) değerlerini öğrenin.",
      "Arsa m² × KAKS formülüyle emsale dahil alanı ve ortalama daire büyüklüğüne göre toplam daire sayısını hesaplayın.",
      "Bölgesel arsa payı oranına (%35 – %50) göre arsa sahibi ve müteahhit paylaşım tablosunu oluşturun.",
    ],
    officialUrl: "https://parselsorgu.tkgm.gov.tr",
    updatedAt: "2026-07-25",
  },
  {
    id: "demir-beton-malzeme-fiyatlari",
    slug: "hazir-beton-inssat-demiri-ve-malzeme-fiyatlari",
    title: "Güncel İnşaat Demiri (Ton), Hazır Beton (C25/C30 m³) ve Kaba İnşaat Malzeme Hesaplama",
    shortTitle: "İnşaat Demiri, Hazır Beton & Malzeme Hesabı",
    badge: "DEMİR TON & BETON m³ ROBOTU",
    institution: "Bölgesel Demir-Çelik Fabrikaları & Hazır Beton Birim Endeksi",
    metricSummary: "1 m² Betonarme İnşaat İçin Ortalama 45–52 kg Demir ve 0,95–1,10 m³ Hazır Beton",
    summary:
      "Kaba inşaat bütçesinin en büyük iki kalemi olan Q8–Q32 nervürlü inşaat demiri (ton) ve C25/C30/C35 hazır beton (m³) miktarlarını inşaat alanınıza göre hesaplar.",
    seoDescription:
      "100 m² ev için kaç ton demir ve kaç mikser (m³) hazır beton gider? Güncel inşaat demiri ton fiyatı ve C30 hazır beton m³ maliyeti hesaplama.",
    highlights: [
      "Radye temel ve perde beton yoğunluğuna göre 1 m² inşaat alanında ortalama 48 kg nervürlü çelik kullanılır",
      "Standart bir transmikser 8 ila 10 m³ hazır beton taşır; pompa bedeli döküm metrajına göre eklenir",
      "Gazbeton / tuğla duvar ve çimento-kum-çatı kerestesi kaba inşaatın kalan %30'luk bölümünü oluşturur",
    ],
    steps: [
      "Statik projedeki metraj cetvelinden (poz listesinden) toplam ince ve kalın demir tonajını kontrol edin.",
      "Temel, perde, kolon ve döşeme beton sınıflarına (C25/C30/C35) göre hazır beton santrallerinden teklif alın.",
      "Her beton dökümünde yapı denetim laboratuvarı tarafından taze beton numunesi alınmasını sağlayın.",
    ],
    officialUrl: "https://www.csb.gov.tr",
    updatedAt: "2026-07-25",
  },
  {
    id: "bina-guclendirme-deprem-testi",
    slug: "bina-guclendirme-ve-deprem-performans-analizi-maliyeti",
    title: "Bina Güçlendirme Maliyeti, Deprem Performans Analizi ve Yıkıp Yapma Karşılaştırması",
    shortTitle: "Bina Güçlendirme vs Yıkıp Yapma Maliyeti",
    badge: "TBDY DEPREM PERFORMANS",
    institution: "Türkiye Bina Deprem Yönetmeliği (TBDY) & Kentsel Dönüşüm Başkanlığı",
    metricSummary: "Güçlendirme Maliyeti: Yeniden Yapım Maliyetinin %30 – %45'i (%40 Üzerinde Yıkıp Yapmak Daha Ekonomik)",
    summary:
      "Mevcut apartman veya müstakil binalarda karot ve röntgen ile yapılan Deprem Performans Analizi sürecini, karbon fiber (CFRP) / çelik manto / perde duvar güçlendirme maliyetini ve yeniden yapım alternatifini karşılaştırır.",
    seoDescription:
      "Bina güçlendirme maliyeti ne kadar? Deprem performans analizi, kolon güçlendirme (karbon fiber / manto) fiyatları ve kentsel dönüşümle karşılaştırma.",
    highlights: [
      "Güçlendirme maliyeti yeniden yapım bedelinin %40'ını aşıyorsa mühendislik ve ekonomi açısından yıkıp yeniden yapmak önerilir",
      "Kat Mülkiyeti Kanunu'na göre bina güçlendirme kararı için kat maliklerinin 4/5 çoğunluğu gerekir",
      "Güçlendirme projesi onaylandıktan sonra daire tahliyesi süresi yeniden yapıma göre çok daha kısadır (4–6 ay)",
    ],
    steps: [
      "Yetkili üniversite veya deprem mühendisliği bürosuna TBDY kapsamlı Deprem Performans Analizi yaptırın.",
      "Analiz sonucunda 'Kontrollü Hasar' performans hedefini sağlayacak güçlendirme projesini hazırlatın.",
      "Güçlendirme bütçesini Yarısı Bizden kentsel dönüşüm hibe/kredi avantajlarıyla karşılaştırarak nihai kararı verin.",
    ],
    officialUrl: "https://www.csb.gov.tr",
    updatedAt: "2026-07-25",
  },
];

export type EmlakGuide = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  badge: string;
  institution: string;
  metricSummary: string;
  summary: string;
  seoDescription: string;
  highlights: string[];
  steps: string[];
  officialUrl: string;
  updatedAt: string;
};

export const EMLAK_GUIDES: EmlakGuide[] = [
  {
    id: "tufe-kira-artis-orani",
    slug: "tufe-kira-artis-orani-ve-kira-zammi-hesaplama",
    title: "TÜFE Kira Artış Oranı ve Konut / İş Yeri Kira Zammı Hesaplama Robotu",
    shortTitle: "TÜFE Kira Artış Oranı & Kira Zammı",
    badge: "TÜİK 12 AYLIK TÜFE ORTALAMASI",
    institution: "Türkiye İstatistik Kurumu (TÜİK) & Türk Borçlar Kanunu Madde 344",
    metricSummary: "Kira Artış Üst Sınırı = TÜİK Son 12 Aylık TÜFE Ortalaması (Konut ve Çatılı İş Yeri İçin Ortak Yasal Tavan)",
    summary:
      "Türk Borçlar Kanunu'nun 344. maddesi uyarınca hem konut hem de çatılı iş yeri kiralarında uygulanabilecek en yüksek yasal kira zam oranını (TÜİK 12 aylık TÜFE ortalaması) ve yeni kira bedelini hesaplar.",
    seoDescription:
      "Bu ay TÜFE kira artış oranı yüzde kaç oldu? Konut ve iş yeri yasal kira zammı hesaplama robotu ile mevcut kiranıza göre yeni kira tutarını hesaplayın.",
    highlights: [
      "%25 sabit kira sınırı sona ermiştir; konut ve iş yerlerinde yasal üst sınır yeniden TÜİK 12 aylık TÜFE ortalamasıdır",
      "Ev sahibi 12 aylık TÜFE ortalamasının üzerinde zam talep edemez; ancak taraflar daha düşük bir oranda anlaşabilir",
      "5 yılı dolduran kira sözleşmelerinde kira bedeli TÜFE, emsal kira ve taşınmazın durumu gözetilerek belirlenir",
    ],
    steps: [
      "Her ayın 3'ünde saat 10.00'da TÜİK tarafından açıklanan 'On İki Aylık Ortalamalara Göre TÜFE (%)' oranını kontrol edin.",
      "Mevcut net kira bedelinizi EmlakAI Kira Zammı Robotuna girerek yasal tavan artış tutarını hesaplayın.",
      "Yeni kira bedelini banka açıklamasına 'Kira Bedeli (Ay/Yıl)' belirterek IBAN üzerinden gönderin.",
    ],
    officialUrl: "https://www.tuik.gov.tr",
    updatedAt: "2026-07-25",
  },
  {
    id: "tapu-harci-hesaplama",
    slug: "tapu-harci-ve-doner-sermaye-bedeli-hesaplama",
    title: "Tapu Harcı (%4 Alıcı-Satıcı Payı), Döner Sermaye ve Emlakçı Komisyonu Hesaplama",
    shortTitle: "Tapu Harcı & Döner Sermaye Hesaplama",
    badge: "%2 ALICI + %2 SATICI TAPU HARCI",
    institution: "Tapu ve Kadastro Genel Müdürlüğü (TKGM) & Gelir İdaresi Başkanlığı",
    metricSummary: "Tapu Harcı: %2 Alıcı + %2 Satıcı (Toplam %4) + TKGM Döner Sermaye Ücreti + Maks. %4+KDV Hizmet Bedeli",
    summary:
      "Konut, arsa, tarla veya iş yeri alım-satımında tapu müdürlüğüne ödenecek %4 tapu harcını, döner sermaye bedelini ve taşınmaz ticareti yönetmeliğine göre emlak danışmanı hizmet bedelini kuruşu kuruşuna hesaplar.",
    seoDescription:
      "Tapu harcı hesaplama robotu: Ev ve arsa satışında %4 tapu harcı ne kadar tutar? Alıcı-satıcı payı, döner sermaye ücreti ve emlakçı komisyonu hesaplama.",
    highlights: [
      "Yasal olarak tapu harcı satış bedelinin binde 20'si (%2) alıcıdan, binde 20'si (%2) satıcıdan olmak üzere toplam %4 tahsil edilir",
      "Tapuda beyan edilen satış bedeli belediye emlak vergisi rayiç değerinden ve kullanılan konut kredisinden düşük olamaz",
      "Gerçek satış bedelinin altında beyan yapılması halinde Gelir İdaresi Başkanlığı %25 vergi ziyaı cezası uygular",
    ],
    steps: [
      "Satıcı tarafından WebTapu (webtapu.tkgm.gov.tr) üzerinden satış başvurusu oluşturulur.",
      "Cep telefonunuza gelen SMS'teki 13 haneli seri numarasıyla e-Devlet veya kamu bankalarından tapu harcı ve döner sermaye ödenir.",
      "Randevu saatinde tapu müdürlüğünde (veya Güvenli Ödeme Sistemi ile) ıslak imzalar atılarak tescil tamamlanır.",
    ],
    officialUrl: "https://webtapu.tkgm.gov.tr",
    updatedAt: "2026-07-25",
  },
  {
    id: "konut-kredisi-hesaplama",
    slug: "konut-kredisi-faiz-orani-ve-aylik-taksit-hesaplama",
    title: "Konut Kredisi Faiz Oranları, Aylık Taksit ve Krediye Uygunluk (LTV) Hesaplama",
    shortTitle: "Konut Kredisi Aylık Taksit & Faiz Robotu",
    badge: "120 AY VADE · BDDK LTV KURALLARI",
    institution: "BDDK Konut Kredisi Sınırları & Banka Konut Finansmanı",
    metricSummary: "60 – 120 Ay Vade · KKDF ve BSMV Muafiyeti · İlk Evini Alacaklara Yüksek Kredi/Değer Oranı",
    summary:
      "Çekmek istediğiniz konut kredisi tutarına, vade sayısına (60–120 ay) ve aylık faiz oranına göre aylık taksitinizi, toplam geri ödemeyi ve BDDK'nın birinci/ikinci el konutlar için uyguladığı ekspertiz kredi limitini hesaplar.",
    seoDescription:
      "Konut kredisi hesaplama robotu: 1 milyon TL, 2 milyon TL ve 3 milyon TL konut kredisinin 120 ay vadeli aylık taksiti ve toplam geri ödemesi ne kadar?",
    highlights: [
      "Bireysel konut kredilerinde ihtiyaç kredisinden farklı olarak %15 KKDF ve %15 BSMV vergisi alınmaz",
      "Kendisinin, eşinin veya 18 yaş altı çocuğunun üzerine kayıtlı evi olmayanlarda (İlk Ev) kredi/ekspertiz oranı çok daha yüksektir",
      "SPK lisanslı gayrimenkul değerleme (ekspertiz) raporu ile kat irtifakı veya kat mülkiyeti tapusu zorunludur",
    ],
    steps: [
      "Alacağınız konutun tapu fotokopisiyle bankaya ön başvuru yaparak SPK lisanslı ekspertiz talebi oluşturun.",
      "Ekspertiz değerine göre onaylanan kredi tutarı için ödeme planını inceleyin.",
      "Tapu devri günü banka ipotek evraklarıyla işlemi tamamlayıp krediyi satıcı hesabına aktarın.",
    ],
    officialUrl: "https://www.bddk.org.tr",
    updatedAt: "2026-07-25",
  },
  {
    id: "konut-kira-carpani",
    slug: "konut-kira-carpani-ve-amortisman-suresi-hesaplama",
    title: "Konut Kira Çarpanı (Amortisman Süresi) ve Bölgesel m² Adil Değer Hesaplama",
    shortTitle: "Konut Kira Çarpanı & Amortisman Yılı",
    badge: "YATIRIM GERİ DÖNÜŞ ANALİZİ",
    institution: "TCMB Konut Fiyat Endeksi (KFE) & Bölgesel Kira/Satış Medyanı",
    metricSummary: "Amortisman Yılı = Satış Fiyatı ÷ (Aylık Kira × 12) · 14–16 Yıl Altı Yüksek Kira Getirili Fırsat",
    summary:
      "Satın almayı düşündüğünüz daire veya dükkanın satış fiyatını aylık kira potansiyeliyle karşılaştırarak kaç yılda (kaç kira çarpanında) kendini amorti ettiğini ve adil piyasa değerini hesaplar.",
    seoDescription:
      "Konut kira çarpanı ve amortisman süresi hesaplama: Alacağınız ev kaç yılda kendini amorti ediyor? Kira gelirine göre evin gerçek değeri ne kadar?",
    highlights: [
      "Türkiye genelinde konutlarda 180–200 ay (15–16,5 yıl) ideal denge; 15 yıl altı ise yüksek kira getirili fırsat kabul edilir",
      "Ticari dükkan ve mağazalarda ise ideal amortisman süresi genellikle 12–15 yıl aralığındadır",
      "22 yılın üzerindeki konutlarda satış fiyatı kira gelirine kıyasla primli olduğundan sıkı pazarlık önerilir",
    ],
    steps: [
      "İlgilendiğiniz dairenin satış fiyatını ve aynı apartmandaki/sokaktaki güncel kira bedelini öğrenin.",
      "EvAI / EmlakAI Kira Çarpanı Robotuna değerleri girerek amortisman yılını ve yıllık brüt kira getirisini (%) görün.",
      "16 yıllık adil değer fiyatını referans alarak satıcıya rasyonel teklifinizi sunun.",
    ],
    officialUrl: "https://www.tcmb.gov.tr",
    updatedAt: "2026-07-25",
  },
  {
    id: "milli-emlak-hazine-arsasi",
    slug: "milli-emlak-hazine-arsasi-ve-kamu-ihale-ilanlari",
    title: "Milli Emlak Hazine Arsası Satışları, KDV/Harç Muafiyeti ve Kamu Taşınmaz İhaleleri",
    shortTitle: "Milli Emlak Hazine Arsası & Kamu İhale",
    badge: "KDV YOK · TAPU HARCI YOK · 24 AY TAKSİT",
    institution: "Milli Emlak Genel Müdürlüğü (Çevre, Şehircilik ve İklim Değişikliği Bakanlığı)",
    metricSummary: "Hazine Taşınmaz Satışlarında KDV Muafiyeti + Tapu Harcı Muafiyeti + 5 Yıl Emlak Vergisi Muafiyeti",
    summary:
      "Milli Emlak tarafından 81 ilde ihale yoluyla satışa çıkarılan Hazineye ait arsa, tarla, bağ-bahçe ve konutların başvuru kurallarını, vergi muafiyetlerini ve peşin/taksitli ödeme avantajlarını açıklar.",
    seoDescription:
      "Milli Emlak satılık Hazine arsaları ve tarla ihaleleri: KDV ve tapu harcı muafiyeti, %25 peşinatla 24 ay taksit imkânı ve e-Devlet başvuru rehberi.",
    highlights: [
      "Milli Emlak'tan satın alınan Hazine taşınmazlarında KDV (%10/%20) ve %4 Tapu Harcı ödenmez",
      "Satışı yapılan Hazine arsaları satış tarihini takip eden 5 yıl boyunca belediye Emlak Vergisinden muaftır",
      "İhale bedelinin peşin ödenmesi halinde %20 indirim uygulanır; talep edilirse %25 peşinatla 24 aya kadar taksit yapılır",
    ],
    steps: [
      "milliemlak.gov.tr üzerinden il ve ilçenizdeki güncel satış/kiralama ihalelerini ve tahmin edilen bedeli inceleyin.",
      "İhale saatinden önce tahmin edilen bedelin %10-%20'si oranındaki geçici teminatı defterdarlık/malmüdürlüğü veznesine yatırın.",
      "Komisyon huzurunda yapılan açık teklif veya kapalı zarf ihalesine katılarak teklifinizi verin.",
    ],
    officialUrl: "https://www.milliemlak.gov.tr",
    updatedAt: "2026-07-25",
  },
  {
    id: "deger-artis-kazanci-kira-vergisi",
    slug: "deger-artis-kazanci-vergisi-ve-kira-geliri-beyannamesi",
    title: "5 Yıl İçinde Satılan Evde Değer Artış Kazancı Vergisi ve Kira Geliri İstisnası Hesaplama",
    shortTitle: "Değer Artış Kazancı & Kira Vergisi",
    badge: "5 YIL KURALI · Yİ-ÜFE ENDEKSLEME",
    institution: "Gelir İdaresi Başkanlığı (GİB) — Hazır Beyan Sistemi",
    metricSummary: "Tapu İktisap Tarihinden İtibaren 5 Tam Yıl Geçtikten Sonra Satılan Konutlarda Gelir Vergisi 0 TL",
    summary:
      "Satın aldığı konut veya arsayı 5 yıl dolmadan satanların Yİ-ÜFE endekslemesiyle ödeyeceği Değer Artış Kazancı Vergisini ve ev sahiplerinin yıllık konut kira geliri istisnası beyannamesini açıklar.",
    seoDescription:
      "Ev satışında 5 yıl kuralı ve değer artış kazancı vergisi hesaplama: Yİ-ÜFE endekslemesi nasıl yapılır, kimler vergiden muaftır, kira beyannamesi ne zaman verilir?",
    highlights: [
      "Gayrimenkulün tapuda edinme tarihinden itibaren 5 tam yıl geçtikten sonra satılması halinde kazanç ne olursa olsun vergi doğmaz",
      "Miras veya bağış (ivazsız) yoluyla edinilen taşınmazların satışında 5 yıl şartı aranmaksızın Değer Artış Kazancı Vergisi yoktur",
      "5 yıl içinde yapılan satışlarda alış bedeli TÜİK Yİ-ÜFE oranında bugünkü değere endekslenerek sadece reel fark vergilendirilir",
    ],
    steps: [
      "Tapu alış tarihiniz ile satış tarihiniz arasındaki Yİ-ÜFE endeks artış oranını kontrol edin.",
      "Endekslenmiş alış maliyeti, tapu harcı ve kredi faiz giderlerini satış bedelinden düşün.",
      "Yıllık istisna sınırını aşan net kazanç veya kira geliri için Mart ayında GİB Hazır Beyan (hazirbeyan.gib.gov.tr) sisteminden beyanname verin.",
    ],
    officialUrl: "https://hazirbeyan.gib.gov.tr",
    updatedAt: "2026-07-25",
  },
];

export function getInsaatGuideBySlug(slug: string): InsaatGuide | undefined {
  return INSAAT_GUIDES.find((item) => item.slug === slug);
}

export function getEmlakGuideBySlug(slug: string): EmlakGuide | undefined {
  return EMLAK_GUIDES.find((item) => item.slug === slug);
}
