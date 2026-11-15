export type SupportCategory = "all" | "aile_cocuk" | "evlilik_genc" | "bakim_engelli" | "fatura_kira" | "iskur_kosgeb";

export type SupportProgram = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: Exclude<SupportCategory, "all">;
  badge: string;
  institution: string;
  amountSummary: string;
  paymentFrequency: string;
  incomeRuleType: "no_limit" | "one_third_min_wage" | "two_thirds_min_wage" | "entrepreneur";
  maxPerCapitaIncomeTL: number | null;
  requiresChildren?: boolean;
  summary: string;
  seoDescription: string;
  requirements: string[];
  steps: string[];
  applicationChannel: string;
  officialUrl: string;
  updatedAt: string;
};

// 2026 referans hane içi kişi başı gelir eşikleri (Net asgari ücretin 1/3 ve 2/3 dilimleri)
export const ONE_THIRD_THRESHOLD = 9358;
export const TWO_THIRDS_THRESHOLD = 18716;

export const SUPPORT_PROGRAMS: SupportProgram[] = [
  {
    id: "dogum-cocuk-yardimi",
    slug: "dogum-ve-cocuk-yardimi",
    title: "Yeni Doğum ve Çocuk Yardımı Başvuru Şartları (1., 2., 3. Çocuk Parası)",
    shortTitle: "Yeni Doğum ve Çocuk Yardımı (5.000 TL / Ay)",
    category: "aile_cocuk",
    badge: "GELİR ŞARTSIZ · E-DEVLET",
    institution: "Aile ve Sosyal Hizmetler Bakanlığı",
    amountSummary: "1. çocuk 5.000 TL tek seferlik · 2. çocuk 1.500 TL/ay · 3. ve sonraki çocuklar 5.000 TL/ay",
    paymentFrequency: "Çocuk 5 yaşını (60 ay) tamamlayana kadar her ay düzenli ödeme",
    incomeRuleType: "no_limit",
    maxPerCapitaIncomeTL: null,
    requiresChildren: true,
    summary:
      "Türk vatandaşlarına yeni doğan çocuklar için gelir şartı aranmaksızın verilen doğrudan nakdi aile desteğidir. 2. çocuk için aylık 1.500 TL, 3. ve sonraki çocuklar için aylık 5.000 TL çocuk 5 yaşını doldurana kadar annenin hesabına yatırılır.",
    seoDescription:
      "Doğum yardımı ve çocuk parası başvuru şartları: 1. çocuk 5.000 TL, 2. çocuk aylık 1.500 TL, 3. çocuk aylık 5.000 TL e-Devlet başvuru ekranı ve 60 aylık ödeme hesaplama.",
    requirements: [
      "Türkiye Cumhuriyeti vatandaşı veya Mavi Kart sahibi olmak",
      "Canlı doğumun gerçekleşmiş olması ve nüfus müdürlüğünde Kimlik Paylaşım Sistemine (KPS) kaydı",
      "Hane gelir şartı aranmaz; çalışan, emekli veya çalışmayan tüm aileler başvurabilir",
    ],
    steps: [
      "Çocuğun doğum raporunun ardından nüfus müdürlüğünden kimlik kaydını tamamlayın.",
      "e-Devlet Kapısı üzerinden 'Aile ve Sosyal Hizmetler Bakanlığı - Doğum Yardımı Başvurusu' ekranına girin.",
      "Ödemenin yatırılacağı IBAN / PTT bilgisini onaylayarak başvuruyu tamamlayın.",
    ],
    applicationChannel: "e-Devlet Kapısı (Doğum Yardımı Başvurusu)",
    officialUrl: "https://www.turkiye.gov.tr/ashb-dogum-yardimi-basvurusu",
    updatedAt: "2026-07-25",
  },
  {
    id: "sed-yardimi",
    slug: "aile-destek-ve-sed-yardimi",
    title: "SED Yardımı ve Aile Sosyal Destek Ödemesi Gelir Kriteri Hesaplama",
    shortTitle: "SED Yardımı (Okul & Çocuk Bakım Maaşı)",
    category: "aile_cocuk",
    badge: "AYLIK DÜZENLİ ÖDEME",
    institution: "Aile ve Sosyal Hizmetler Bakanlığı",
    amountSummary: "Çocuğun eğitim kademesine göre aylık ortalama 6.500 TL – 11.500 TL",
    paymentFrequency: "Her ayın 15'i ile 20'si arasında düzenli aylık ödeme",
    incomeRuleType: "one_third_min_wage",
    maxPerCapitaIncomeTL: ONE_THIRD_THRESHOLD,
    requiresChildren: true,
    summary:
      "Ekonomik güçlük çeken ailelerin çocuklarının okul, kırtasiye, beslenme ve temel bakım giderlerini karşılamak üzere okul öncesi, ilköğretim, ortaöğretim ve yükseköğrenim kademelerine göre her ay ödenir.",
    seoDescription:
      "SED yardımı (Sosyal ve Ekonomik Destek) ne kadar, kimlere verilir? Okul öncesi, ilkokul, lise ve üniversite çocuk bakım maaşı gelir sınırı ve e-Devlet başvuru rehberi.",
    requirements: [
      "Hane içinde kişi başına düşen gelirin net asgari ücretin 1/3'ünün altında olması",
      "Hanede eğitim gören veya bakım desteğine ihtiyaç duyan çocuk bulunması",
      "Sosyal Hizmet Merkezi uzmanlarının yaptığı sosyal inceleme raporunun olumlu olması",
    ],
    steps: [
      "e-Devlet üzerinden 'Sosyal ve Ekonomik Destek (SED) Ön Başvurusu' formunu doldurun.",
      "Sistem üzerinden veya Sosyal Hizmet Merkezi davetinde çocukların öğrenci belgelerini paylaşın.",
      "Onay sonrasında ödemeleri her ay PTT veya tanımlı banka hesabınızdan takip edin.",
    ],
    applicationChannel: "e-Devlet SED Başvurusu veya İl/İlçe Sosyal Hizmet Merkezleri",
    officialUrl: "https://www.turkiye.gov.tr/ashb-sosyal-ekonomik-destek-on-basvurusu",
    updatedAt: "2026-07-25",
  },
  {
    id: "aile-genclik-evlilik-kredisi",
    slug: "evlenecek-genclere-150-bin-tl-faizsiz-evlilik-kredisi",
    title: "Evlenecek Gençlere 150.000 TL Faizsiz Evlilik Kredisi (Aile ve Gençlik Fonu)",
    shortTitle: "150.000 TL Faizsiz Evlilik Kredisi",
    category: "evlilik_genc",
    badge: "FAİZSİZ · 2 YIL ÖDEMESİZ",
    institution: "Aile ve Sosyal Hizmetler Bakanlığı",
    amountSummary: "150.000 TL (0 Faiz · İlk 24 ay geri ödemesiz · 48 ay eşit taksit)",
    paymentFrequency: "Nikâh bildirimi sonrası tek seferde hesaba aktarım",
    incomeRuleType: "two_thirds_min_wage",
    maxPerCapitaIncomeTL: TWO_THIRDS_THRESHOLD,
    summary:
      "81 ilin tamamında yeni evlenecek genç çiftlere sunulan, ilk 2 yılı geri ödemesiz ve 48 ay vadeli tamamen faizsiz 150.000 TL tutarındaki çeyiz ve ev kurma desteğidir.",
    seoDescription:
      "Aile ve Gençlik Fonu 150 bin TL faizsiz evlilik kredisi başvuru şartları, yaş sınırı (18-29), gelir kriteri ve 2 yıl geri ödemesiz aylık taksit tablosu.",
    requirements: [
      "Başvuru tarihinde her iki eş adayının da 18–29 yaş aralığında olması (30 yaşından gün almamış olmak)",
      "Çiftlerin son 6 aylık toplam gelir ortalamasının 2 asgari ücretten fazla olmaması",
      "Resmî nikâh tarihine en az 2 ay, en fazla 6 ay kalmış olması ve evlilik öncesi eğitim programına katılmak",
    ],
    steps: [
      "Belediyeden alınan resmî nikâh gününüzle birlikte e-Devlet 'Evlenecek Gençlerin Desteklenmesi Projesi' ekranına girin.",
      "Eş adayının e-Devlet üzerinden başvuruyu onaylamasını sağlayın.",
      "Bakanlığın sunduğu ücretsiz evlilik öncesi eğitim ve danışmanlık modülünü tamamlayın.",
    ],
    applicationChannel: "e-Devlet / ailegenclikfonu.aile.gov.tr",
    officialUrl: "https://www.turkiye.gov.tr/ashb-evlenecek-genclere-destek-projesi",
    updatedAt: "2026-07-25",
  },
  {
    id: "evde-bakim-maasi",
    slug: "evde-bakim-maasi-ve-engelli-ayligi",
    title: "Evde Bakım Maaşı ve 65 Yaş / Engelli Aylığı Gelir Sınırı Hesaplama",
    shortTitle: "Evde Bakım Maaşı & Engelli/Yaşlı Aylığı",
    category: "bakim_engelli",
    badge: "MEMUR KATSAYILI AYLIK",
    institution: "Aile ve Sosyal Hizmetler Bakanlığı & SYDV",
    amountSummary: "Evde Bakım: Aylık 10.125 TL+ · 65 Yaş ve %40-%70+ Engelli Aylığı düzenli ödeme",
    paymentFrequency: "Her ay düzenli banka veya PTT ödemesi",
    incomeRuleType: "two_thirds_min_wage",
    maxPerCapitaIncomeTL: TWO_THIRDS_THRESHOLD,
    summary:
      "Tam bağımlı (ağır engelli) raporu bulunan vatandaşların ailesi yanında bakımını üstlenen yakınlarına ödenen Evde Bakım Maaşı ile sosyal güvencesi olmayan 65 yaş üstü ve engelli vatandaşlara bağlanan 2022 sayılı Kanun aylıklarını kapsar.",
    seoDescription:
      "Evde bakım maaşı ne kadar, gelir kriteri nasıl hesaplanır? 65 yaş yaşlılık aylığı ve engelli maaşı kişi başı gelir sınırı ve e-Devlet sorgulama rehberi.",
    requirements: [
      "Evde bakım için sağlık kurulu raporunda 'Tam Bağımlı' (çocuklarda 'Çok İleri Düzeyde ÖGV') ibaresi",
      "Evde bakım maaşında kişi başı gelirin net asgari ücretin 2/3'ünden az olması",
      "65 yaş ve engelli aylığında SGK geliri olmaması ve kişi başı gelirin asgari ücretin 1/3'ünden az olması",
    ],
    steps: [
      "Yetkili devlet/şehir hastanesinden alınan e-Rapor veya ÇÖZGER belgesini hazırlayın.",
      "Evde bakım için Aile ve Sosyal Hizmetler İl/İlçe Müdürlüğüne; 65 yaş/engelli aylığı için e-Devlet Sosyal Yardım ekranına başvurun.",
      "Ödeme durumunu her ay e-Devlet üzerinden T.C. kimlik numaranızla sorgulayın.",
    ],
    applicationChannel: "e-Devlet Sosyal Yardım Başvuru Hizmeti & İl Müdürlükleri",
    officialUrl: "https://www.turkiye.gov.tr/ashb-engelli-evde-bakim-odeme-bilgileri-sorgulama",
    updatedAt: "2026-07-25",
  },
  {
    id: "dogalgaz-elektrik-fatura-destegi",
    slug: "dogalgaz-elektrik-fatura-ve-kira-destegi",
    title: "Doğalgaz Tüketim Desteği, Elektrik Faturası Yardımı ve Kira Desteği",
    shortTitle: "Doğalgaz, Elektrik & Kira Yardımı",
    category: "fatura_kira",
    badge: "FATURA & KİRA DESTEĞİ",
    institution: "Aile Bakanlığı & Çevre, Şehircilik ve İklim Değişikliği Bakanlığı",
    amountSummary: "Doğalgaz: 1.500–3.500 TL/yıl · Elektrik: 155 kWh/ay · Dönüşüm Kira: 5.500–8.000 TL/ay",
    paymentFrequency: "Fatura ibrazıyla PTT'den aylık indirim & aylık kira ödemesi",
    incomeRuleType: "one_third_min_wage",
    maxPerCapitaIncomeTL: ONE_THIRD_THRESHOLD,
    summary:
      "Dar gelirli ev sahibi ve kiracı hanelere verilen Doğalgaz ve Elektrik Faturası Tüketim Desteği ile kentsel dönüşüm kapsamındaki konutlarda malik ve kiracılara ödenen karşılıksız kira yardımlarını içerir.",
    seoDescription:
      "e-Devlet doğalgaz tüketim desteği, elektrik faturası yardımı ve kentsel dönüşüm kira yardımı başvuru şartları. Kiracılar ve ev sahipleri nasıl başvurur?",
    requirements: [
      "Doğalgaz/elektrik desteği için ikamet adresinde geçerli abonelik ve SYDV gelir kriteri uygunluğu",
      "Kentsel dönüşüm kira yardımı için riskli yapı tespiti onaylanmış binada malik veya kiracı olmak (gelir şartı aranmaz)",
      "Evde tıbbi cihaza bağlı kronik hasta varsa ek Elektrik Tüketim Desteği ve kesinti güvencesi",
    ],
    steps: [
      "Enerji destekleri için e-Devlet 'Sosyal Yardım Başvuru Hizmeti' ekranından abone numaranızı girerek başvurun.",
      "Onaylanan doğalgaz/elektrik desteğini PTT şubelerinden veya e-Devlet 'PTT Üzerinden Yapılan Kurum Ödemeleri' ekranından faturanıza yansıtın.",
      "Kentsel dönüşüm kira yardımı için e-Devlet 'Hak Sahipleri İçin Kira Yardımı Başvurusu' ekranını kullanın.",
    ],
    applicationChannel: "e-Devlet Sosyal Yardım & Kentsel Dönüşüm Kira Başvurusu",
    officialUrl: "https://www.turkiye.gov.tr/ashb-sosyal-yardim-basvuru-hizmeti",
    updatedAt: "2026-07-25",
  },
  {
    id: "kosgeb-girisimci-hibe",
    slug: "kosgeb-girisimci-hibesi-ve-iskur-iup",
    title: "KOSGEB Kadın / Genç Girişimci Hibesi ve İŞKUR İşgücü Uyum Programı (İUP)",
    shortTitle: "KOSGEB 2 Milyon TL Destek & İŞKUR İUP",
    category: "iskur_kosgeb",
    badge: "HİBE + YARI ZAMANLI GELİR",
    institution: "KOSGEB & Türkiye İş Kurumu (İŞKUR)",
    amountSummary: "KOSGEB İş Geliştirme: 150.000 TL – 2.000.000 TL · İŞKUR İUP: Günlük Cep Harçlığı + GSS",
    paymentFrequency: "Proje/kuruluş ödemesi (KOSGEB) & Aylık çalışma günü ödemesi (İŞKUR)",
    incomeRuleType: "entrepreneur",
    maxPerCapitaIncomeTL: null,
    summary:
      "Kendi işini kurmak isteyen kadın, genç ve teknoloji girişimcilerine KOSGEB tarafından sağlanan kuruluş/makine-teçhizat destekleri ile İŞKUR'un kamu kurumlarında haftada 3 gün çalışma imkânı sunan İşgücü Uyum Programını (İUP) kapsar.",
    seoDescription:
      "KOSGEB kadın ve genç girişimci hibe desteği 2 milyon TL başvuru şartları ve İŞKUR İşgücü Uyum Programı (İUP / TYP) günlük ödeme hesaplama rehberi.",
    requirements: [
      "KOSGEB desteği için ücretsiz KOSGEB e-Akademi Girişimcilik Eğitimini iş kurmadan önce tamamlamak",
      "Kadın, genç (<30 yaş), engelli ve birinci derece şehit/gazi yakınlarına kuruluş desteğinde ek limit",
      "İŞKUR İUP için 18 yaşını doldurmuş, İŞKUR'a kayıtlı işsiz olmak (örgün üniversite öğrencileri de başvurabilir)",
    ],
    steps: [
      "Girişimciler için lms.kosgeb.gov.tr üzerinden Geleneksel veya İleri Girişimci eğitimini tamamlayın.",
      "Şirket kuruluşu sonrası e-Devlet KOSGEB ekranından İş Kurma / İş Geliştirme çağrısına başvurun.",
      "İŞKUR İUP için esube.iskur.gov.tr üzerinden ilinizdeki kamu kurumlarının açık İUP ilanlarına başvurun.",
    ],
    applicationChannel: "KOSGEB e-Hizmetler & İŞKUR e-Şube (esube.iskur.gov.tr)",
    officialUrl: "https://www.kosgeb.gov.tr/site/tr/genel/destekler/3/destekler",
    updatedAt: "2026-07-25",
  },
];

export type EducationLevel = "all" | "kpss_sartsiz" | "lise" | "onlisans" | "lisans";
export type InstitutionGroup = "all" | "bakanlik" | "belediye" | "saglik" | "adliye_guvenlik" | "iskur_isci";

export type RecruitmentTrack = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  institution: string;
  group: Exclude<InstitutionGroup, "all">;
  educationLevels: Array<Exclude<EducationLevel, "all">>;
  minKpssScore: number;
  positions: string[];
  badge: string;
  quotaType: string;
  summary: string;
  seoDescription: string;
  requirements: string[];
  applicationPortal: string;
  officialUrl: string;
  updatedAt: string;
};

export const RECRUITMENT_TRACKS: RecruitmentTrack[] = [
  {
    id: "kpss-sartsiz-iskur-kamu-isci",
    slug: "kpss-sartsiz-kamu-isci-alimi-ve-iskur-iup",
    title: "KPSS Şartsız Kamu İşçisi Alımı, Noter Kurası ve İŞKUR İUP İlanları",
    shortTitle: "KPSS Şartsız Kamu İşçisi & İUP Alımları",
    institution: "Bakanlıklar, Devlet Hastaneleri, Üniversiteler, Belediyeler & İŞKUR",
    group: "iskur_isci",
    educationLevels: ["kpss_sartsiz", "lise", "onlisans", "lisans"],
    minKpssScore: 0,
    positions: [
      "Temizlik Görevlisi (Sürekli İşçi)",
      "Klinik Destek Elemanı",
      "Özel Güvenlik Görevlisi (Silahlı/Silahsız)",
      "Bakım-Onarım / Elektrik / Sıhhi Tesisat Teknisyeni",
      "Şoför ve İş Makinesi Operatörü",
    ],
    badge: "KPSS ŞARTSIZ · NOTER KURASI",
    quotaType: "4857 Sayılı İş Kanunu Sürekli İşçi & İŞKUR Kurum Dışı Kamu İşçi İlanları",
    summary:
      "KPSS puan şartı aranmaksızın ilköğretim, lise, önlisans ve lisans mezunlarının İŞKUR e-Şube üzerinden başvurabildiği; noter huzurunda çekilen kura veya uygulamalı sınavla yapılan sürekli kamu işçisi ve belediye şirket personeli alımlarıdır.",
    seoDescription:
      "KPSS şartsız memur ve sürekli kamu işçisi alımı ilanları: İŞKUR e-Şube temizlik, güvenlik, şoför, klinik destek ve belediye kurum dışı işçi alımı başvuru ekranı.",
    requirements: [
      "18 yaşını tamamlamış ve ilanda belirtilen üst yaş sınırını (genellikle 35 veya 40) aşmamış olmak",
      "En az ilköğretim veya ortaöğretim (lise) mezunu olmak (KPSS şartı aranmaz)",
      "İlan edilen il veya ilçede ikamet ediyor olmak (ADNKS adres kaydı)",
    ],
    applicationPortal: "İŞKUR e-Şube (esube.iskur.gov.tr) & Kurum Dışı Kamu İşçi İlanları",
    officialUrl: "https://esube.iskur.gov.tr/Istihdam/AcikIsIlanAra.aspx",
    updatedAt: "2026-07-25",
  },
  {
    id: "dusuk-kpss-bakanlik-sozlesmeli",
    slug: "dusuk-kpss-puaniyla-50-55-60-memur-alimi",
    title: "50, 55 ve 60 KPSS Puanıyla Sözleşmeli Memur ve Personel Alan Kurumlar",
    shortTitle: "50 - 60 KPSS İle Bakanlık & Üniversite Alımları",
    institution: "Adalet Bakanlığı, Gençlik ve Spor Bakanlığı, Aile Bakanlığı & Devlet Üniversiteleri",
    group: "bakanlik",
    educationLevels: ["lise", "onlisans", "lisans"],
    minKpssScore: 50,
    positions: [
      "Büro Personeli (4/B Sözleşmeli)",
      "Destek Personeli (Yurt Yönetim / Temizlik / İklimlendirme)",
      "Koruma ve Güvenlik Görevlisi",
      "Yurt Yönetim Memuru",
      "Sosyal Çalışmacı / Psikolog / Çocuk Gelişimcisi",
    ],
    badge: "50 - 60 KPSS TABAN PUAN",
    quotaType: "657 Sayılı Kanun 4/B Sözleşmeli Personel (Mülakatsız KPSS Sıralaması veya Sözlü Sınav)",
    summary:
      "KPSS B grubu (P94 Lise, P93 Önlisans, P3 Lisans) puan türlerinden 50, 55 veya 60 taban puan barajıyla Cumhurbaşkanlığı Kariyer Kapısı üzerinden yapılan sözleşmeli kamu personeli alımlarıdır. Üniversite ve bakanlık destek/büro kadrolarında mülakatsız doğrudan KPSS sıralaması uygulanmaktadır.",
    seoDescription:
      "50, 55 ve 60 KPSS puanıyla memur alımı yapan bakanlıklar ve üniversiteler. Lise P94, Önlisans P93 ve Lisans P3 büro personeli, güvenlik ve destek personeli başvuru rehberi.",
    requirements: [
      "İlgili yılın KPSS (P94 Ortaöğretim, P93 Önlisans veya P3 Lisans) sınavından en az 50 veya 60 puan almış olmak",
      "657 sayılı Devlet Memurları Kanunu'nun 48. maddesindeki genel şartları taşımak",
      "Güvenlik kadroları için geçerli Özel Güvenlik Kimlik Kartı ve boy/kilo şartını sağlamak",
    ],
    applicationPortal: "Cumhurbaşkanlığı Kariyer Kapısı (isealimkariyerkapisi.cbiko.gov.tr)",
    officialUrl: "https://isealimkariyerkapisi.cbiko.gov.tr",
    updatedAt: "2026-07-25",
  },
  {
    id: "belediye-zabita-itfaiye-alimi",
    slug: "belediye-zabita-ve-itfaiye-eri-alimi",
    title: "Belediye Zabıta Memuru, İtfaiye Eri ve Düz Memur Alımı İlanları",
    shortTitle: "Belediye Zabıta, İtfaiye Eri & VHKİ Alımı",
    institution: "Büyükşehir, İl ve İlçe Belediyeleri (Mahalli İdareler)",
    group: "belediye",
    educationLevels: ["lise", "onlisans", "lisans"],
    minKpssScore: 60,
    positions: [
      "Zabıta Memuru (GİH Sınıfı)",
      "İtfaiye Eri (TH / GİH Sınıfı)",
      "Veri Hazırlama ve Kontrol İşletmeni (VHKİ)",
      "Tahsildar / Düz Memur / Mühendis / Mimar",
    ],
    badge: "60 KPSS · KADROLU MEMUR",
    quotaType: "657 Sayılı Kanun Kadrolu Belediye Memuru (KPSS + Uygulamalı Parkur)",
    summary:
      "Büyükşehir, il ve ilçe belediyelerinin Resmî Gazete ve Kariyer Kapısı'nda yayımladığı kadrolu zabıta memuru, itfaiye eri ve VHKİ (düz memur) alımlarıdır. Genellikle 55–65 KPSS taban puan şartı ile başvuru alınır.",
    seoDescription:
      "Belediye zabıta memuru, itfaiye eri ve VHKİ düz memur alımı ilanları: KPSS taban puanı, yaş sınırı (30 yaş), boy-kilo şartları ve başvuru takvimi.",
    requirements: [
      "Zabıta ve İtfaiye Eri kadroları için sınavın yapıldığı tarihte 30 yaşını doldurmamış olmak",
      "Erkeklerde en az 1.67 m, kadınlarda en az 1.60 m boyunda olmak ve boy-kilo farkının ±10 kg'ı aşmaması",
      "En az B veya C sınıfı sürücü belgesine sahip olmak ve KPSS'den ilanda belirtilen (genellikle 60) puanı almak",
    ],
    applicationPortal: "Resmî Gazete Çeşitli İlanlar & Kariyer Kapısı Kamu İlanları",
    officialUrl: "https://www.resmigazete.gov.tr/ilanlar/eskiilanlar/index.htm",
    updatedAt: "2026-07-25",
  },
  {
    id: "saglik-bakanligi-adliye-ikm",
    slug: "emekli-banka-promosyonu-karsilastirma",
    title: "Emekli ve Memur Banka Promosyonu Karşılaştırma (En Yüksek Promosyon Veren Bankalar)",
    shortTitle: "Emekli & Memur Banka Promosyonu Tablosu",
    institution: "SGK (SSK, Bağ-Kur, Emekli Sandığı) Anlaşmalı Kamu ve Özel Bankalar",
    group: "adliye_guvenlik",
    educationLevels: ["kpss_sartsiz", "lise", "onlisans", "lisans"],
    minKpssScore: 0,
    positions: [
      "SSK / Bağ-Kur / Emekli Sandığı Maaş Taşıma Promosyonu",
      "Dul ve Yetim Aylığı Banka Promosyonu",
      "Kamu Kurumu Memur Maaş Promosyon Anlaşmaları",
    ],
    badge: "NAKİT PROMOSYON · 20.000 TL'YE VARAN",
    quotaType: "3 Yıl Maaş Taahhüdü Karşılığı Peşin Nakit + Ek Ödül Promosyonu",
    summary:
      "Emekli maaşını veya kamu maaşını 3 yıl süreyle aynı bankadan alma taahhüdü veren vatandaşlara Ziraat Bankası, VakıfBank, Halkbank, Yapı Kredi, İş Bankası, Garanti BBVA ve Akbank tarafından ödenen güncel nakit promosyon tutarlarını karşılaştırır.",
    seoDescription:
      "Emekli banka promosyonu ne kadar oldu? En yüksek emekli promosyonu veren bankalar (Ziraat, VakıfBank, Halkbank, Yapı Kredi, Garanti, Akbank, İş Bankası) maaş dilimi tablosu.",
    requirements: [
      "SGK (4A SSK, 4B Bağ-Kur veya 4C Emekli Sandığı) emekli aylığı veya hak sahibi aylığı alıyor olmak",
      "e-Devlet veya banka mobil uygulaması üzerinden maaşı seçilen bankaya taşıyıp 3 yıllık taahhüt vermek",
      "Daha önce başka bankadan alınan promosyon varsa kalan sürenin kıstelyevm (oranlı) iadesini yapmak",
    ],
    applicationPortal: "e-Devlet Banka/Adres Değişikliği & Banka Mobil Uygulamaları",
    officialUrl: "https://www.turkiye.gov.tr/sosyal-guvenlik-kurumu",
    updatedAt: "2026-07-25",
  },
  {
    id: "memur-emekli-maas-zammi",
    slug: "memur-ve-emekli-maas-zammi-hesaplama",
    title: "Memur ve Emekli Maaş Zammı + Enflasyon Farkı Hesaplama Robotu",
    shortTitle: "Memur & Emekli Maaş Zammı Hesaplayıcı",
    institution: "Hazine ve Maliye Bakanlığı & TÜİK Enflasyon Farkı Katsayısı",
    group: "saglik",
    educationLevels: ["lise", "onlisans", "lisans"],
    minKpssScore: 65,
    positions: [
      "Öğretmen, Polis Memuru, Hemşire, Doktor, Mühendis",
      "Vaiz / İmam-Hatip, Zabıta, İnfaz ve Koruma Memuru (İKM)",
      "Memur Emeklisi (4C) ve SSK/Bağ-Kur Emeklisi (4A/4B)",
    ],
    badge: "MAAŞ & ENFLASYON FARKI ROBOTU",
    quotaType: "6 Aylık TÜFE Enflasyon Farkı + Toplu Sözleşme Zam Oranı Hesaplaması",
    summary:
      "Mevcut net maaşınızı, unvanınızı ve açıklanan 6 aylık TÜİK enflasyon farkı + toplu sözleşme zam oranını girerek yeni dönemde elinize geçecek net zamlı maaşı ve 14 günlük maaş farkını saniyeler içinde hesaplayın.",
    seoDescription:
      "Memur ve emekli maaş zammı hesaplama robotu: Öğretmen, polis, hemşire, mühendis ve emekli yeni zamlı maaş tablosu ve 6 aylık enflasyon farkı hesaplayıcı.",
    requirements: [
      "Memur ve memur emeklileri için Toplu Sözleşme zammı + 6 aylık TÜFE enflasyon farkı uygulanır",
      "SSK ve Bağ-Kur emeklileri için doğrudan son 6 aylık TÜİK TÜFE değişim oranı uygulanır",
      "Aile yardımı ödeneği (eş ve çocuk yardımı) memur maaş katsayısıyla birlikte otomatik artar",
    ],
    applicationPortal: "e-Devlet Hazine ve Maliye Bakanlığı e-Bordro Sorgulama",
    officialUrl: "https://www.turkiye.gov.tr/maliye-e-bordro-sorgulama",
    updatedAt: "2026-07-25",
  },
];

export const BANK_PROMOTIONS = [
  {
    bank: "Kamu Bankaları (Ziraat, VakıfBank, Halkbank)",
    tier1: "8.000 TL (10.000 TL altı maaş)",
    tier2: "10.000 TL (10.000 – 14.999 TL)",
    tier3: "12.000 TL (15.000 – 19.999 TL)",
    tier4: "12.000 TL+ (20.000 TL ve üzeri maaş)",
    bonus: "Bankkart / Troy ile fatura ve market harcamasına ek puan avantajı",
    url: "https://www.ziraatbank.com.tr",
  },
  {
    bank: "Yapı Kredi",
    tier1: "6.250 TL + Ek Ödül",
    tier2: "10.000 TL + Ek Ödül",
    tier3: "12.500 TL + Ek Ödül",
    tier4: "15.000 TL – 20.000 TL'ye varan nakit + fatura/kart ödülü",
    bonus: "2 yeni otomatik fatura talimatı ve kredi kartı harcamasına ek nakit",
    url: "https://www.yapikredi.com.tr",
  },
  {
    bank: "Akbank",
    tier1: "6.250 TL",
    tier2: "10.000 TL",
    tier3: "12.500 TL",
    tier4: "15.000 TL nakit + 2.500 TL chip-para (Toplam 17.500 TL)",
    bonus: "Otomatik fatura talimatı başına 500 TL, toplam 2.500 TL chip-para",
    url: "https://www.akbank.com",
  },
  {
    bank: "Garanti BBVA",
    tier1: "6.250 TL",
    tier2: "10.000 TL",
    tier3: "12.500 TL",
    tier4: "15.000 TL'ye varan nakit promosyon + mobil müşteri bonusu",
    bonus: "Emekli maaş müşterilerine ücretsiz EFT/FAST ve bonus kampanyası",
    url: "https://www.garantibbva.com.tr",
  },
  {
    bank: "Türkiye İş Bankası",
    tier1: "5.000 TL",
    tier2: "8.000 TL",
    tier3: "10.000 TL",
    tier4: "12.000 TL nakit promosyon + Maximum Kart MaxiPuan ayrıcalığı",
    bonus: "Diğer banka ATM'lerinden ayda 2 kez ücretsiz nakit çekim",
    url: "https://www.isbank.com.tr",
  },
];

export type GalaxyCluster = {
  id: "yardim-tasarruf" | "memur-kariyer" | "finans-gundem" | "teknoloji-uretim";
  name: string;
  badge: string;
  tagline: string;
  description: string;
  accentColor: string;
  tools: Array<{
    slug: string;
    href: string;
    badge: string;
    title: string;
    desc: string;
    metric: string;
  }>;
};

export const GALAXY_CLUSTERS: GalaxyCluster[] = [
  {
    id: "yardim-tasarruf",
    name: "1. Galaksi: Yardım, Teşvik & Tasarruf Evreni",
    badge: "AİLE YARDIMLARI · BANKA PUAN · İNDİRİM",
    tagline: "Hane bütçesini büyüten devlet destekleri, kredi kartı puanları ve gerçek dip fiyatlar.",
    description:
      "Aile ve çocuk yardımlarından 150 bin TL faizsiz evlilik kredisine, banka kampanya puanlarından 360 günlük sahte indirim dedektörüne kadar cebinizi koruyan araçlar.",
    accentColor: "emerald",
    tools: [
      {
        slug: "tesvik-ai",
        href: "/tesvik-ai",
        badge: "AİLE YARDIMLARI & HİBE",
        title: "TeşvikAI · Aile Yardımları, e-Devlet Sosyal Destek ve Hibe Robotu",
        desc: "Hane gelirinizi ve kişi sayısını girin; Doğum Yardımı (5.000 TL), SED Maaşı, 150 Bin TL Faizsiz Evlilik Kredisi, Evde Bakım ve KOSGEB hibelerinden size çıkanları görün.",
        metric: "Gelir Kriteri Robotu · e-Devlet Linkli",
      },
      {
        slug: "puan-ai",
        href: "/puan-ai",
        badge: "BANKA & KART PUAN",
        title: "PuanAI · Kredi Kartı Kampanya ve Taksit Asistanı",
        desc: "Axess, Bonus, World, Maximum, Bankkart, Paraf ve CardFinans kampanyalarını harcamadan önce karşılaştırın; cüzdanınızdaki kartla maksimum puanı yakalayın.",
        metric: "8 Banka Resmî Dizin · FreeClaude AI",
      },
      {
        slug: "indirim-ai",
        href: "/indirim-ai",
        badge: "GERÇEK İNDİRİM RADARI",
        title: "İndirimAI · 30/90/360 Gün Fiyat Geçmişi & Dip Fiyatlar",
        desc: "Şişirilmiş etiket indirimlerini eleyin. Mağaza fiyat geçmişini banka kartı puanıyla birleştirerek cebinizden çıkacak gerçek dip maliyeti hesaplayın.",
        metric: "Sahte İndirim Dedektörü · Kuponlar",
      },
    ],
  },
  {
    id: "memur-kariyer",
    name: "2. Galaksi: Memur, Kariyer & Kamu İlan Evreni",
    badge: "MEMUR ALIMI · KPSS ROBOTU · MAAŞ & PROMOSYON",
    tagline: "KPSS şartsız kamu işçisi ilanları, 50-60 puanla memur alımları ve maaş/promosyon hesaplama.",
    description:
      "Bakanlık, belediye, hastane ve İŞKUR güncel personel alımlarını eğitim ve KPSS puanınıza göre filtreleyin; memur maaş zammı ve emekli banka promosyonlarını karşılaştırın.",
    accentColor: "amber",
    tools: [
      {
        slug: "memur-ai",
        href: "/memur-ai",
        badge: "KAMU İLAN & KPSS ROBOTU",
        title: "MemurAI · Kamu Personeli Alımı, KPSS Puan Robotu ve Promosyon",
        desc: "KPSS şartsız noter kurası ilanlarını, 50-60 KPSS ile memur alan kurumları, İŞKUR İUP başvurularını, memur maaş zammını ve emekli banka promosyonlarını tek ekranda hesaplayın.",
        metric: "Kariyer Kapısı · İŞKUR · Maaş Robotu",
      },
      {
        slug: "kpss-sartsiz-isci",
        href: "/memur-ai/kpss-sartsiz-kamu-isci-alimi-ve-iskur-iup",
        badge: "KPSS ŞARTSIZ KURA",
        title: "KPSS Şartsız Kamu İşçisi & İŞKUR İUP Başvuru Rehberi",
        desc: "Belediye, devlet hastanesi ve bakanlıklarda KPSS şartı aranmadan noter kurasıyla yapılan temizlik, güvenlik, şoför ve klinik destek alımları.",
        metric: "İŞKUR e-Şube · Günlük Cep Harçlığı",
      },
      {
        slug: "emekli-promosyon",
        href: "/memur-ai/emekli-banka-promosyonu-karsilastirma",
        badge: "BANKA PROMOSYON YARIŞI",
        title: "Emekli & Memur Banka Promosyonu Karşılaştırma Tablosu",
        desc: "Maaş diliminize göre Ziraat, VakıfBank, Halkbank, Yapı Kredi, Akbank, Garanti BBVA ve İş Bankası güncel nakit promosyon tutarlarını karşılaştırın.",
        metric: "20.000 TL'ye Varan Nakit Promosyon",
      },
    ],
  },
  {
    id: "finans-gundem",
    name: "3. Galaksi: Finans, Varlık & Gündem Evreni",
    badge: "MEVDUAT FAİZİ · ALTIN/DÖVİZ · EMLAK · OTOMOBİL · 81 İL HABER",
    tagline: "Yatırım, konut, otomobil ve Türkiye gündemini birincil verilerle doğrulayın.",
    description:
      "32 günlük mevduat faiz getirisinden konut kira çarpanına (amortisman süresi), 2. el araç ekspertiz değerlemesinden 81 il canlı haber haritasına kadar tüm piyasa masaları.",
    accentColor: "sky",
    tools: [
      {
        slug: "finans-ai",
        href: "/finans-ai",
        badge: "CANLI PİYASA & FAİZ",
        title: "FinansAI · Döviz, Gram Altın, Mevduat Faizi ve BIST 100",
        desc: "TCMB gösterge kurları, 24 ayar gram altın, Borsa İstanbul, 32 günlük net mevduat faizi simülatörü ve kişisel yatırım sepeti çevirici.",
        metric: "TCMB & BIST Kaynaklı · Faiz Robotu",
      },
      {
        slug: "ev-ai",
        href: "/ev-ai",
        badge: "EMLAK & KAMU İHALE",
        title: "EvAI · Konut Kira Çarpanı, m² Endeksi ve Kamu İhaleleri",
        desc: "Satılık daire ve arsaları bölgesel m² medyanı ve kira amortisman süresiyle (yıl) test edin; resmî kamu/icra taşınmaz ilanlarını haritada inceleyin.",
        metric: "Kira Amortisman Hesaplayıcı · Haritalı",
      },
      {
        slug: "araba-ai",
        href: "/araba-ai",
        badge: "SIFIR & 2. EL OTOMOBİL",
        title: "ArabaAI · Sıfır Araç Liste Fiyatları ve 2. El Değerleme",
        desc: "BYD, Renault, Toyota, VW, Peugeot, Ford sıfır liste fiyatlarını ve 2. el araçlarda yaş, KM, boya/değişen farkına göre adil piyasa değerini hesaplayın.",
        metric: "Ekspertiz & Pazarlık Hesaplayıcı",
      },
      {
        slug: "haber-ai",
        href: "/haber-ai",
        badge: "81 İL GÜNDEM HARİTASI",
        title: "HaberAI · 81 İl Kaynaklı Türkiye Gündem Haritası",
        desc: "Türkiye'nin 81 ilindeki ekonomi, üretim, bilim ve yerel gelişmeleri birincil haber kaynağı ve zaman damgasıyla interaktif harita üzerinde takip edin.",
        metric: "81 İl Canlı Harita · Kaynak Doğrulamalı",
      },
    ],
  },
  {
    id: "teknoloji-uretim",
    name: "4. Galaksi: Teknoloji, Yapay Zekâ & Spor/Oyun Evreni",
    badge: "ÜRETİRAİ · SPOR xG · OYUN RADARI · EKOSİSTEM",
    tagline: "Yapay zekâ bilgi grafiği, Süper Lig xG analizi ve dijital oyun ekonomisi.",
    description:
      "Türkiye'nin sanayi ve teknoloji bilgi grafiğini, Süper Lig/UEFA ülke puanı istatistiklerini ve Steam MENA-USD oyun indirimlerini keşfedin.",
    accentColor: "violet",
    tools: [
      {
        slug: "uretir-ai",
        href: "/uretir-ai",
        badge: "BİLGİ GRAFİĞİ & SANAYİ",
        title: "ÜretirAI · Türkiye Üretim, Teknoloji ve Şirket Bilgi Grafiği",
        desc: "Türkiye'nin sanayi kuruluşlarını, teknoloji kümelerini, üretim standartlarını ve şirket-fabrika ilişkilerini doğrulanmış bilgi grafiğinde inceleyin.",
        metric: "Doğrulanmış Varlık & İlişki Grafiği",
      },
      {
        slug: "spor-ai",
        href: "/spor-ai",
        badge: "FUTBOL & VERİ ANALİZİ",
        title: "SporAI · Süper Lig xG Analizi ve UEFA Ülke Puanı",
        desc: "Süper Lig gol beklentisi (xG) tablolarını, şampiyonluk olasılıklarını ve Türkiye'nin UEFA ülke puanı sıralamasındaki anlık durumunu inceleyin.",
        metric: "Süper Lig xG · UEFA Katsayı Radarı",
      },
      {
        slug: "oyun-ai",
        href: "/oyun-ai",
        badge: "OYUN & MENA-USD RADARI",
        title: "OyunAI · Steam MENA-USD İndirimleri ve Türk Stüdyoları",
        desc: "Steam MENA-USD bölgesel fiyat düşüşlerini, haftanın ücretsiz oyunlarını, Türk oyun stüdyolarını ve refleks/hafıza oyunlarını keşfedin.",
        metric: "Steam Dip Fiyatlar · Oyun Ekosistemi",
      },
    ],
  },
];

export function getSupportProgramBySlug(slug: string): SupportProgram | undefined {
  return SUPPORT_PROGRAMS.find((item) => item.slug === slug);
}

export function getRecruitmentTrackBySlug(slug: string): RecruitmentTrack | undefined {
  return RECRUITMENT_TRACKS.find((item) => item.slug === slug);
}
