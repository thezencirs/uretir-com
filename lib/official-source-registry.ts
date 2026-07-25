export type OfficialSourceDomain =
  | "incentives"
  | "trade"
  | "statistics"
  | "energy"
  | "agriculture"
  | "employment"
  | "law"
  | "standards"
  | "patents"
  | "procurement"
  | "tax"
  | "environment"
  | "education"
  | "companies"
  | "research";

export type OfficialSource = {
  id: string;
  name: string;
  authority: string;
  scope: "TR" | "EU" | "GLOBAL";
  url: string;
  domains: OfficialSourceDomain[];
  dataTypes: string[];
  integrationMode: "manual_reference" | "api_candidate" | "feed_candidate";
  verificationStatus: "verified_portal";
  reviewedAt: string;
  notes: string;
};

const reviewedAt = "2026-07-25";

function source(
  id: string,
  name: string,
  authority: string,
  scope: OfficialSource["scope"],
  url: string,
  domains: OfficialSourceDomain[],
  dataTypes: string[],
  integrationMode: OfficialSource["integrationMode"],
  notes: string,
): OfficialSource {
  return { id, name, authority, scope, url, domains, dataTypes, integrationMode, verificationStatus: "verified_portal", reviewedAt, notes };
}

/**
 * Curated entry points only. A verified portal is not evidence that a dated
 * record is still current; every imported record needs its own source URL,
 * retrieval time, verification time, fingerprint, and review schedule.
 */
export const officialSources: OfficialSource[] = [
  source("kosgeb", "KOSGEB", "Küçük ve Orta Ölçekli İşletmeleri Geliştirme ve Destekleme İdaresi", "TR", "https://www.kosgeb.gov.tr/", ["incentives"], ["support programmes", "calls", "application guidance"], "feed_candidate", "Primary source for KOSGEB programmes; programme pages must be captured individually."),
  source("tubitak", "TÜBİTAK Destekleri", "Türkiye Bilimsel ve Teknolojik Araştırma Kurumu", "TR", "https://tubitak.gov.tr/tr/destekler", ["incentives", "research"], ["research programmes", "industry programmes", "calls"], "feed_candidate", "Use the programme and call page as claim-level evidence."),
  source("sanayi-destek", "Sanayi ve Teknoloji Bakanlığı Destek ve Teşvikleri", "T.C. Sanayi ve Teknoloji Bakanlığı", "TR", "https://www.sanayi.gov.tr/destek-ve-tesvikler", ["incentives", "statistics"], ["investment incentives", "industrial supports"], "feed_candidate", "Primary policy and programme entry point."),
  source("yatirima-destek", "Yatırıma Destek Platformu", "T.C. Sanayi ve Teknoloji Bakanlığı", "TR", "https://www.yatirimadestek.gov.tr/", ["incentives"], ["regional supports", "investment guidance", "development agency calls"], "feed_candidate", "Regional records still require issuer and call-page verification."),
  source("ticaret-destek", "Ticaret Bakanlığı Destekleri", "T.C. Ticaret Bakanlığı", "TR", "https://www.ticaret.gov.tr/destekler", ["incentives", "trade"], ["export supports", "service supports", "e-export supports"], "feed_candidate", "Use the current decision, circular, and application page together."),
  source("kolay-ihracat", "Kolay İhracat Platformu", "T.C. Ticaret Bakanlığı", "TR", "https://www.kolayihracat.gov.tr/", ["trade"], ["market guidance", "export guides", "country information"], "manual_reference", "Guidance source; legal requirements must be checked against current official rules."),
  source("turk-eximbank", "Türk Eximbank", "Türkiye İhracat Kredi Bankası", "TR", "https://www.eximbank.gov.tr/", ["trade", "incentives"], ["export credits", "insurance", "guarantees"], "feed_candidate", "Product terms are time-sensitive and must never be cached without a review date."),
  source("tkdk", "TKDK", "Tarım ve Kırsal Kalkınmayı Destekleme Kurumu", "TR", "https://www.tkdk.gov.tr/", ["agriculture", "incentives"], ["IPARD calls", "guides", "announcements"], "feed_candidate", "Call versions, amendments, deadlines, and eligible provinces require record-level verification."),
  source("tarim-orman", "Tarım ve Orman Bakanlığı", "T.C. Tarım ve Orman Bakanlığı", "TR", "https://www.tarimorman.gov.tr/", ["agriculture", "incentives", "statistics"], ["agricultural supports", "regulations", "announcements"], "feed_candidate", "Use the responsible general directorate and current communiqué where available."),
  source("tarsim", "TARSİM", "Tarım Sigortaları Havuzu", "TR", "https://www.tarsim.gov.tr/", ["agriculture"], ["insurance products", "tariffs", "application guidance"], "manual_reference", "Insurance scope and tariffs are period-specific."),
  source("iskur", "İŞKUR", "Türkiye İş Kurumu", "TR", "https://www.iskur.gov.tr/", ["employment", "incentives"], ["employment programmes", "employer services", "training"], "feed_candidate", "Eligibility conclusions belong to the competent institution."),
  source("sgk", "SGK", "Sosyal Güvenlik Kurumu", "TR", "https://www.sgk.gov.tr/", ["employment", "law"], ["employer incentives", "circulars", "social security guidance"], "feed_candidate", "Pair guidance with current legislation and circulars."),
  source("resmi-gazete", "Resmî Gazete", "T.C. Cumhurbaşkanlığı İdari İşler Başkanlığı", "TR", "https://www.resmigazete.gov.tr/", ["law"], ["laws", "decrees", "regulations", "communiqués"], "feed_candidate", "Canonical publication source for enacted rules."),
  source("mevzuat", "Mevzuat Bilgi Sistemi", "T.C. Cumhurbaşkanlığı", "TR", "https://www.mevzuat.gov.tr/", ["law"], ["consolidated legislation"], "manual_reference", "Record the legislation number and access date."),
  source("tuik", "TÜİK Veri Portalı", "Türkiye İstatistik Kurumu", "TR", "https://data.tuik.gov.tr/", ["statistics"], ["industrial production", "trade", "prices", "business statistics"], "api_candidate", "Store dataset code, period, unit, revision status, and retrieval time."),
  source("tcmb-evds", "TCMB EVDS", "Türkiye Cumhuriyet Merkez Bankası", "TR", "https://evds3.tcmb.gov.tr/", ["statistics", "trade"], ["exchange rates", "financial and economic series"], "api_candidate", "Series metadata and revision behavior are part of provenance."),
  source("epdk", "EPDK", "Enerji Piyasası Düzenleme Kurumu", "TR", "https://www.epdk.gov.tr/", ["energy", "statistics", "law"], ["market reports", "licenses", "tariffs", "official statistics"], "feed_candidate", "Monthly and annual reports may be revised; retain revision metadata."),
  source("epias", "EPİAŞ Şeffaflık Platformu", "Enerji Piyasaları İşletme A.Ş.", "TR", "https://seffaflik.epias.com.tr/", ["energy", "statistics"], ["electricity and gas market data"], "api_candidate", "Units, market, interval, and data publication time are mandatory."),
  source("teias", "TEİAŞ", "Türkiye Elektrik İletim A.Ş.", "TR", "https://www.teias.gov.tr/", ["energy", "statistics"], ["installed capacity", "generation", "transmission statistics"], "feed_candidate", "Use published report or dataset version."),
  source("botas", "BOTAŞ", "Boru Hatları ile Petrol Taşıma A.Ş.", "TR", "https://www.botas.gov.tr/", ["energy"], ["tariffs", "natural gas announcements", "reports"], "feed_candidate", "Tariffs and notices are effective-date sensitive."),
  source("mta", "MTA", "Maden Tetkik ve Arama Genel Müdürlüğü", "TR", "https://www.mta.gov.tr/", ["statistics", "research"], ["geology", "mineral resources", "maps", "reports"], "manual_reference", "Respect map and report licensing terms."),
  source("tse", "Türk Standardları Enstitüsü", "Türk Standardları Enstitüsü", "TR", "https://www.tse.org.tr/", ["standards"], ["standards catalogue", "certification services"], "manual_reference", "Do not reproduce copyrighted standard text; link catalogue metadata."),
  source("turkak", "TÜRKAK", "Türk Akreditasyon Kurumu", "TR", "https://www.turkak.org.tr/", ["standards"], ["accredited bodies", "accreditation guidance"], "manual_reference", "Accreditation scope and validity must be checked at query time."),
  source("turkpatent", "TÜRKPATENT", "Türk Patent ve Marka Kurumu", "TR", "https://www.turkpatent.gov.tr/", ["patents"], ["patents", "trademarks", "designs", "geographical indications"], "api_candidate", "Search results are discovery signals, not freedom-to-operate advice."),
  source("kap", "Kamuyu Aydınlatma Platformu", "Merkezi Kayıt Kuruluşu", "TR", "https://www.kap.org.tr/", ["companies"], ["company disclosures", "financial statements", "material events"], "feed_candidate", "Issuer disclosure and period are mandatory provenance."),
  source("rekabet", "Rekabet Kurumu", "Rekabet Kurumu", "TR", "https://www.rekabet.gov.tr/", ["law", "companies"], ["decisions", "sector inquiries", "announcements"], "feed_candidate", "Decisions should be linked by number and date."),
  source("kik", "Kamu İhale Kurumu", "Kamu İhale Kurumu", "TR", "https://www.ihale.gov.tr/", ["procurement", "law"], ["procurement legislation", "decisions", "statistics"], "feed_candidate", "Use EKAP for individual notices where permitted."),
  source("ekap", "EKAP", "Kamu İhale Kurumu", "TR", "https://ekap.kik.gov.tr/", ["procurement"], ["procurement notices", "tender information"], "manual_reference", "Access and reuse constraints must be reviewed before automation."),
  source("gib", "Gelir İdaresi Başkanlığı", "T.C. Hazine ve Maliye Bakanlığı", "TR", "https://www.gib.gov.tr/", ["tax", "law"], ["tax guidance", "communiqués", "forms"], "feed_candidate", "General information is not case-specific tax advice."),
  source("e-devlet", "e-Devlet Kapısı", "T.C. Cumhurbaşkanlığı Dijital Dönüşüm Ofisi", "TR", "https://www.turkiye.gov.tr/", ["law", "companies"], ["public service entry points", "registries"], "manual_reference", "Never automate authenticated personal services without explicit authority."),
  source("cevre", "Çevre, Şehircilik ve İklim Değişikliği Bakanlığı", "T.C. Çevre, Şehircilik ve İklim Değişikliği Bakanlığı", "TR", "https://www.csb.gov.tr/", ["environment", "law", "incentives"], ["environmental rules", "permits", "announcements"], "feed_candidate", "Use the competent directorate and current legal instrument."),
  source("btk", "BTK", "Bilgi Teknolojileri ve İletişim Kurumu", "TR", "https://www.btk.gov.tr/", ["law", "statistics"], ["sector data", "authorisations", "regulations"], "feed_candidate", "Sector reports may have separate publication calendars."),
  source("uab", "Ulaştırma ve Altyapı Bakanlığı", "T.C. Ulaştırma ve Altyapı Bakanlığı", "TR", "https://www.uab.gov.tr/", ["trade", "statistics", "law"], ["transport policy", "logistics statistics", "regulations"], "feed_candidate", "Use modal directorate sources for operational requirements."),
  source("yok", "YÖK", "Yükseköğretim Kurulu", "TR", "https://www.yok.gov.tr/", ["education", "statistics"], ["higher education statistics", "announcements"], "feed_candidate", "Use dataset year and definition."),
  source("yok-tez", "YÖK Ulusal Tez Merkezi", "Yükseköğretim Kurulu", "TR", "https://tez.yok.gov.tr/UlusalTezMerkezi/", ["education", "research"], ["thesis metadata"], "manual_reference", "Respect author permissions and full-text access conditions."),
  source("tobb", "TOBB", "Türkiye Odalar ve Borsalar Birliği", "TR", "https://www.tobb.org.tr/", ["companies", "statistics", "trade"], ["company statistics", "sector reports", "capacity reports"], "feed_candidate", "Clarify public-body status and dataset reuse terms per source."),
  source("osbuk", "OSBÜK", "Organize Sanayi Bölgeleri Üst Kuruluşu", "TR", "https://osbuk.org/", ["companies", "statistics"], ["organised industrial zone information", "announcements"], "feed_candidate", "Zone records need responsible OSB confirmation."),
  source("kalkinma-kutuphanesi", "Kalkınma Kütüphanesi", "T.C. Sanayi ve Teknoloji Bakanlığı", "TR", "https://www.kalkinmakutuphanesi.gov.tr/", ["research", "statistics", "incentives"], ["regional plans", "agency reports", "analyses"], "manual_reference", "Use report publisher, year, and document URL."),
  source("eu-funding-tenders", "EU Funding & Tenders Portal", "European Commission", "EU", "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home", ["incentives", "procurement", "research"], ["calls", "programmes", "projects", "tenders"], "api_candidate", "Call status, topic identifier, deadline, and version must be verified."),
  source("cordis", "CORDIS", "European Commission", "EU", "https://cordis.europa.eu/", ["research", "incentives"], ["EU-funded projects", "results", "publications"], "api_candidate", "Useful for project evidence; not a source of programme eligibility decisions."),
  source("eurostat", "Eurostat", "European Commission", "EU", "https://ec.europa.eu/eurostat/data", ["statistics", "trade", "energy"], ["official European statistics", "PRODCOM", "Comext"], "api_candidate", "Store dataset code, dimensions, unit, flags, and retrieval time."),
  source("access2markets", "Access2Markets", "European Commission", "EU", "https://trade.ec.europa.eu/access-to-markets/", ["trade", "law"], ["tariffs", "taxes", "procedures", "rules of origin"], "manual_reference", "Product classification and destination context are mandatory."),
  source("ted", "Tenders Electronic Daily", "European Union", "EU", "https://ted.europa.eu/", ["procurement"], ["EU public procurement notices"], "api_candidate", "Use notice identifier, version, status, and publication date."),
  source("echa", "ECHA", "European Chemicals Agency", "EU", "https://echa.europa.eu/", ["law", "standards", "environment"], ["chemical regulations", "substance information", "guidance"], "api_candidate", "Regulatory duties require substance, use, role, and current legal context."),
  source("un-comtrade", "UN Comtrade", "United Nations Statistics Division", "GLOBAL", "https://comtrade.un.org/", ["trade", "statistics"], ["international merchandise trade"], "api_candidate", "Store reporter, partner, flow, classification, code, period, and revision."),
  source("wto-data", "WTO Data", "World Trade Organization", "GLOBAL", "https://data.wto.org/", ["trade", "statistics"], ["trade indicators", "tariffs", "services trade"], "api_candidate", "Indicator definitions and reporting periods must travel with values."),
  source("world-bank-data", "World Bank Open Data", "World Bank", "GLOBAL", "https://data.worldbank.org/", ["statistics"], ["development indicators", "country data"], "api_candidate", "Use indicator code, year, source, and methodology."),
  source("wits", "World Integrated Trade Solution", "World Bank", "GLOBAL", "https://wits.worldbank.org/", ["trade", "statistics"], ["trade", "tariffs", "non-tariff measures"], "api_candidate", "Respect underlying provider definitions and licensing."),
  source("faostat", "FAOSTAT", "Food and Agriculture Organization of the United Nations", "GLOBAL", "https://www.fao.org/faostat/", ["agriculture", "statistics"], ["agriculture", "food", "land", "emissions", "trade"], "api_candidate", "Use domain, item, element, unit, area, year, and flags."),
  source("oecd-data-explorer", "OECD Data Explorer", "Organisation for Economic Co-operation and Development", "GLOBAL", "https://data-explorer.oecd.org/", ["statistics", "trade", "research"], ["economic", "industry", "productivity", "innovation indicators"], "api_candidate", "Store dataset and series identifiers plus revision metadata."),
];

export function getOfficialSource(id: string) {
  return officialSources.find((item) => item.id === id);
}

export function validateOfficialSourceRegistry() {
  const errors: string[] = [];
  if (officialSources.length !== 50) errors.push(`Expected 50 official sources, received ${officialSources.length}.`);
  const ids = new Set<string>();
  const urls = new Set<string>();
  for (const item of officialSources) {
    if (ids.has(item.id)) errors.push(`Duplicate source id: ${item.id}`);
    if (urls.has(item.url)) errors.push(`Duplicate source URL: ${item.url}`);
    if (!item.url.startsWith("https://")) errors.push(`Non-HTTPS source URL: ${item.id}`);
    if (!item.domains.length || !item.dataTypes.length) errors.push(`Incomplete source coverage: ${item.id}`);
    ids.add(item.id);
    urls.add(item.url);
  }
  return errors;
}
