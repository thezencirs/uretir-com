export type Company = {
  slug: string;
  name: string;
  logo: string;
  sector: string;
  foundedYear: number;
  headquarters: string;
  employeeCount: string;
  website: string;
  description: string;
  activityArea: string;
  mainProducts: string[];
  subProducts: string[];
  exportCountries: string[];
  facilities: string[];
  brands: string[];
  certifications: string[];
  sustainability: string;
  faqs: Array<{ question: string; answer: string }>;
  color: string;
};

export const companies: Company[] = [
  {
    slug: "tupras",
    name: "TÜPRAŞ",
    logo: "🛢️",
    sector: "Enerji & Petrokimya",
    foundedYear: 1961,
    headquarters: "Kocaeli, Türkiye",
    employeeCount: "5.000+",
    website: "https://www.tupras.com.tr",
    description: "Türkiye'nin en büyük sanayi kuruluşu olan TÜPRAŞ, ham petrolü işleyerek benzin, motorin, jet yakıtı, LPG ve petrokimya ürünleri üretir. Dört rafineride yılda 30 milyon tonun üzerinde ham petrol işleme kapasitesine sahiptir.",
    activityArea: "Ham petrol rafinasyonu, petrokimya üretimi, enerji kaynakları işleme ve dağıtımı.",
    mainProducts: ["Benzin", "Motorin (Dizel)", "Jet Yakıtı", "LPG", "Fuel Oil", "Nafta"],
    subProducts: ["Asfalt", "Baz Yağ", "Solvent", "Kükürt", "Petrol Koku", "Propilen"],
    exportCountries: ["ABD", "İtalya", "İspanya", "Hollanda", "Mısır", "İsrail", "Yunanistan", "Malta"],
    facilities: ["İzmit Rafinerisi (Kocaeli)", "İzmir Rafinerisi (Aliağa)", "Kırıkkale Rafinerisi", "Batman Rafinerisi"],
    brands: ["TÜPRAŞ"],
    certifications: ["ISO 9001", "ISO 14001", "ISO 45001", "ISO 50001", "OHSAS 18001"],
    sustainability: "TÜPRAŞ, 2050 yılına kadar karbon nötrlüğü hedeflemektedir. Yenilenebilir enerji yatırımları, enerji verimliliği projeleri ve hidrojen üretimi çalışmalarıyla sürdürülebilir dönüşümü hızlandırmaktadır. Rafineri atık ısısından elektrik üretimi yapılmakta ve su geri kazanım oranı yıllık %85'in üzerinde seyretmektedir.",
    faqs: [
      { question: "TÜPRAŞ ne üretir?", answer: "TÜPRAŞ, ham petrolü işleyerek benzin, motorin, jet yakıtı, LPG, fuel oil, nafta, asfalt ve petrokimya ürünleri üretmektedir." },
      { question: "TÜPRAŞ'ın kaç rafinerisi var?", answer: "TÜPRAŞ'ın İzmit, İzmir (Aliağa), Kırıkkale ve Batman olmak üzere 4 rafinerisi bulunmaktadır." },
      { question: "TÜPRAŞ Türkiye'nin en büyük şirketi mi?", answer: "Evet, TÜPRAŞ ciro bazında Türkiye'nin en büyük sanayi kuruluşudur ve İstanbul Sanayi Odası 500 Büyük Sanayi Kuruluşu listesinde sürekli olarak ilk sıralarda yer almaktadır." },
    ],
    color: "#d97835",
  },
  {
    slug: "kipas-holding",
    name: "Kipaş Holding",
    logo: "🧵",
    sector: "Tekstil & Enerji",
    foundedYear: 1984,
    headquarters: "Kahramanmaraş, Türkiye",
    employeeCount: "8.000+",
    website: "https://www.kipas.com.tr",
    description: "Kipaş Holding, Türkiye'nin entegre tekstil sektörünün önde gelen gruplarından biridir. İplik, dokuma, boyama, konfeksiyon ve enerji üretimi alanlarında faaliyet göstermekte; pamuktan hazır giyime kadar tüm değer zincirini bünyesinde barındırmaktadır.",
    activityArea: "Entegre tekstil üretimi (iplik, dokuma, boyama, konfeksiyon), enerji üretimi (HES, RES, doğal gaz) ve tarımsal faaliyetler.",
    mainProducts: ["İplik", "Ham ve Boyalı Kumaş", "Konfeksiyon", "Ev Tekstili"],
    subProducts: ["Pamuk Elyafı", "Polyester İplik", "Denim Kumaş", "Havlu", "Nevresim Takımı", "Enerji (Elektrik)"],
    exportCountries: ["Almanya", "İngiltere", "İtalya", "Fransa", "İspanya", "ABD", "Rusya", "Orta Doğu"],
    facilities: ["Kahramanmaraş Entegre Tekstil Tesisi", "Kahramanmaraş Enerji Santralleri", "Gaziantep Denim Tesisi"],
    brands: ["Kipaş", "Kipas Denim", "Kipaş Enerji"],
    certifications: ["ISO 9001", "ISO 14001", "OEKO-TEX Standard 100", "GOTS (Global Organic Textile Standard)", "BCI (Better Cotton Initiative)"],
    sustainability: "Kipaş Holding, organik pamuk kullanımını artırarak ve su tüketimini azaltarak sürdürülebilir tekstil üretimini benimsemektedir. Hidroelektrik ve rüzgâr enerji santralleriyle kendi elektrik ihtiyacının büyük bölümünü yenilenebilir kaynaklardan karşılamaktadır.",
    faqs: [
      { question: "Kipaş Holding ne üretir?", answer: "Kipaş Holding iplik, dokuma kumaş, denim, konfeksiyon, ev tekstili ürünleri ve enerji üretmektedir." },
      { question: "Kipaş Holding nerede?", answer: "Kipaş Holding'in merkezi Kahramanmaraş'tadır. Gaziantep'te de denim üretim tesisleri bulunmaktadır." },
      { question: "Kipaş Holding'in enerji yatırımları nelerdir?", answer: "Kipaş Holding, hidroelektrik santralleri (HES), rüzgâr enerji santralleri (RES) ve doğal gaz çevrim santralleri işletmektedir." },
    ],
    color: "#8b80c2",
  },
  {
    slug: "aselsan",
    name: "ASELSAN",
    logo: "🛡️",
    sector: "Savunma & Teknoloji",
    foundedYear: 1975,
    headquarters: "Ankara, Türkiye",
    employeeCount: "10.000+",
    website: "https://www.aselsan.com.tr",
    description: "ASELSAN, Türkiye'nin en büyük savunma sanayi şirketidir. Elektronik harp, radar, haberleşme, elektro-optik, silah ve komuta kontrol sistemleri başta olmak üzere ileri teknoloji ürünler tasarlar ve üretir. Dünya savunma şirketleri sıralamasında ilk 50'de yer almaktadır.",
    activityArea: "Savunma elektroniği, haberleşme ve bilgi teknolojileri, radar ve elektronik harp, elektro-optik, silah sistemleri ve sivil teknoloji çözümleri.",
    mainProducts: ["Radar Sistemleri", "Elektronik Harp Sistemleri", "Haberleşme Sistemleri", "Silah Sistemleri", "Elektro-Optik Sistemler"],
    subProducts: ["Termal Kameralar", "Gece Görüş Cihazları", "Uçaksavar Sistemleri", "Drone Savunma Sistemleri", "Trafik Yönetim Sistemleri", "Enerji Yönetim Sistemleri", "Tıbbi Cihazlar"],
    exportCountries: ["Azerbaycan", "Pakistan", "Katar", "Suudi Arabistan", "BAE", "Malezya", "Kazakistan", "Gürcistan", "Özbekistan", "Ukrayna"],
    facilities: ["Macunköy Tesisi (Ankara)", "Akyurt Tesisi (Ankara)", "Gölbaşı Tesisi (Ankara)", "İstanbul Teknopark"],
    brands: ["ASELSAN", "ASELSAN REHİS"],
    certifications: ["NATO AQAP-2110", "NATO AQAP-2210", "ISO 9001", "ISO 27001", "AS9100", "CMMI Seviye 3"],
    sustainability: "ASELSAN, üretim süreçlerinde enerji verimliliğini artırmakta ve yenilenebilir enerji kaynaklarına yatırım yapmaktadır. Ar-Ge harcamalarının önemli bir kısmını çevre dostu teknolojilere ayırmakta ve çalışanlarına sürdürülebilirlik eğitimleri vermektedir.",
    faqs: [
      { question: "ASELSAN ne üretir?", answer: "ASELSAN; radar, elektronik harp, haberleşme, elektro-optik, silah ve komuta kontrol sistemleri ile sivil teknoloji çözümleri üretmektedir." },
      { question: "ASELSAN dünyanın en büyük kaçıncı savunma şirketi?", answer: "ASELSAN, Defense News Top 100 listesinde dünyanın en büyük 50 savunma şirketi arasında yer almaktadır." },
      { question: "ASELSAN sivil ürünler üretiyor mu?", answer: "Evet, ASELSAN trafik yönetim sistemleri, enerji yönetim çözümleri, tıbbi cihazlar ve güvenlik kameraları gibi sivil alanda da ürünler geliştirmektedir." },
    ],
    color: "#78a5b6",
  },
  {
    slug: "arcelik",
    name: "Arçelik",
    logo: "🏭",
    sector: "Beyaz Eşya & Elektronik",
    foundedYear: 1955,
    headquarters: "İstanbul, Türkiye",
    employeeCount: "40.000+",
    website: "https://www.arcelikglobal.com",
    description: "Arçelik, Koç Topluluğu bünyesinde faaliyet gösteren ve 145'ten fazla ülkede ürünlerini satan küresel bir beyaz eşya ve tüketici elektroniği üreticisidir. 12 ülkede 30'dan fazla üretim tesisine sahip olup dünya genelinde ikinci büyük beyaz eşya üreticisidir.",
    activityArea: "Beyaz eşya, küçük ev aletleri, tüketici elektroniği ve klima sistemleri üretimi.",
    mainProducts: ["Bulaşık Makinesi", "Çamaşır Makinesi", "Buzdolabı", "Fırın", "Klima"],
    subProducts: ["Kurutma Makinesi", "Televizyon", "Elektrikli Süpürge", "Ankastre Ürünler", "Robot Süpürge", "Mikrodalga Fırın", "Çay ve Kahve Makinesi"],
    exportCountries: ["Almanya", "İngiltere", "Fransa", "İtalya", "Romanya", "Rusya", "Güney Afrika", "Pakistan", "Bangladeş", "Tayland", "Hindistan"],
    facilities: ["Çayırova Fabrikası (Kocaeli)", "Bolu Fabrikası", "Eskişehir Fabrikası", "Ankara Fabrikası", "Tuzla Fabrikası (İstanbul)", "Romanya Fabrikası", "Rusya Fabrikası", "Güney Afrika Fabrikası", "Tayland Fabrikası"],
    brands: ["Arçelik", "Beko", "Grundig", "Blomberg", "Arctic", "Defy", "Dawlance", "Hitachi"],
    certifications: ["ISO 9001", "ISO 14001", "ISO 50001", "SA8000", "Carbon Trust Standard"],
    sustainability: "Arçelik, 2030 yılına kadar üretim tesislerinde karbon nötrlüğü hedeflemektedir. Geri dönüştürülmüş plastik kullanım oranını %40'a çıkarmış, enerji tüketimini son 10 yılda %35 azaltmıştır. Denizlerden toplanan plastiklerden çamaşır makinesi tamburu üreten ilk şirketler arasındadır.",
    faqs: [
      { question: "Arçelik ne üretir?", answer: "Arçelik; bulaşık makinesi, çamaşır makinesi, buzdolabı, fırın, klima, televizyon ve küçük ev aletleri üretmektedir." },
      { question: "Arçelik'in kaç markası var?", answer: "Arçelik, Beko, Grundig, Blomberg, Arctic, Defy, Dawlance ve Hitachi gibi 10'dan fazla global markaya sahiptir." },
      { question: "Arçelik kaç ülkeye ihracat yapıyor?", answer: "Arçelik, 145'ten fazla ülkeye ihracat yapmakta ve 12 ülkede 30'dan fazla üretim tesisi işletmektedir." },
    ],
    color: "#769d32",
  },
  {
    slug: "ford-otosan",
    name: "Ford Otosan",
    logo: "🚗",
    sector: "Otomotiv",
    foundedYear: 1959,
    headquarters: "Kocaeli, Türkiye",
    employeeCount: "13.000+",
    website: "https://www.fordotosan.com.tr",
    description: "Ford Otosan, Ford Motor Company ve Koç Holding ortaklığında faaliyet gösteren Türkiye'nin en büyük otomotiv üreticisidir. Hafif ticari araç üretiminde Avrupa lideri olan şirket, Transit ailesinin küresel üretim üssüdür ve Türkiye'nin en fazla ihracat yapan şirketleri arasında yer almaktadır.",
    activityArea: "Binek ve ticari araç üretimi, motor ve şanzıman üretimi, araç tasarımı ve Ar-Ge.",
    mainProducts: ["Ford Transit", "Ford Transit Custom", "Ford Courier", "Ford Trucks (Ağır Ticari)"],
    subProducts: ["Ecotorq Motor", "Otomatik Şanzıman", "Yedek Parça", "Ford E-Transit (Elektrikli)", "Ford F-MAX"],
    exportCountries: ["Almanya", "Fransa", "İngiltere", "İtalya", "İspanya", "Hollanda", "Belçika", "Avusturya", "Polonya", "Rusya", "İsrail", "Cezayir", "Fas"],
    facilities: ["Gölcük Fabrikası (Kocaeli)", "Yeniköy Fabrikası (Kocaeli)", "İnönü Fabrikası (Eskişehir)", "Craiova Fabrikası (Romanya)"],
    brands: ["Ford", "Ford Trucks"],
    certifications: ["ISO 9001", "ISO 14001", "ISO 45001", "IATF 16949", "ISO 50001"],
    sustainability: "Ford Otosan, 2030 yılına kadar üretim tesislerinde %100 yenilenebilir enerji kullanımı hedeflemektedir. Kocaeli fabrikalarında güneş enerjisi panelleri kurulmuş, atık su geri kazanım oranı %90'ın üzerine çıkarılmıştır. Elektrikli araç üretimi için Gölcük fabrikasında yatırım yapılmaktadır.",
    faqs: [
      { question: "Ford Otosan ne üretir?", answer: "Ford Otosan; Ford Transit, Transit Custom, Courier hafif ticari araçları, Ford Trucks ağır ticari araçları ve Ecotorq motorları üretmektedir." },
      { question: "Ford Otosan Avrupa'da kaçıncı?", answer: "Ford Otosan, hafif ticari araç üretiminde Avrupa'nın en büyük üreticisidir ve Transit ailesinin küresel üretim merkezidir." },
      { question: "Ford Otosan elektrikli araç üretiyor mu?", answer: "Evet, Ford Otosan Gölcük fabrikasında Ford E-Transit üretimi yapmakta ve elektrikli araç yatırımlarını hızlandırmaktadır." },
    ],
    color: "#b26959",
  },
];

export function getCompany(slug: string) {
  return companies.find((company) => company.slug === slug);
}

export function getAllCompanySlugs() {
  return companies.map((company) => company.slug);
}
