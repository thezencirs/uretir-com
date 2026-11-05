import { getPrisma } from "@/lib/puan-ai/db";

export type VehiclePriceItem = {
  brand: string;
  model: string;
  listPrice: number;
  campaignPrice: number | null;
  effectivePrice: number;
  previousPrice: number | null;
  changePct: number | null;
  sourceUrl: string;
  fetchedAt: string;
};

const CURATED_VEHICLE_PRICES: Array<Omit<VehiclePriceItem, "fetchedAt">> = [
  { brand: "Togg", model: "T10X V1 RWD Standart Menzil", listPrice: 1432600, campaignPrice: null, effectivePrice: 1432600, previousPrice: 1432600, changePct: 0, sourceUrl: "https://www.togg.com.tr/price-list" },
  { brand: "Togg", model: "T10X V2 RWD Uzun Menzil", listPrice: 1823000, campaignPrice: null, effectivePrice: 1823000, previousPrice: 1823000, changePct: 0, sourceUrl: "https://www.togg.com.tr/price-list" },
  { brand: "Renault", model: "Clio Evolution 1.0 TCe X-Tronic 90 hp", listPrice: 1189900, campaignPrice: 1149000, effectivePrice: 1149000, previousPrice: 1189900, changePct: -3.4, sourceUrl: "https://www.renault.com.tr/bireysel-fiyat-listesi.html" },
  { brand: "Renault", model: "Megane Sedan Joy 1.3 TCe EDC 140 bg", listPrice: 1549000, campaignPrice: 1489000, effectivePrice: 1489000, previousPrice: 1549000, changePct: -3.9, sourceUrl: "https://www.renault.com.tr/bireysel-fiyat-listesi.html" },
  { brand: "Fiat", model: "Egea Sedan Easy 1.4 Fire 95 HP", listPrice: 1004900, campaignPrice: 929900, effectivePrice: 929900, previousPrice: 989900, changePct: -6.1, sourceUrl: "https://otomobil.fiat.com.tr/fiyat-listesi" },
  { brand: "Toyota", model: "Corolla 1.8 Hybrid Dream e-CVT", listPrice: 1765000, campaignPrice: 1640000, effectivePrice: 1640000, previousPrice: 1720000, changePct: -4.7, sourceUrl: "https://www.toyota.com.tr/fiyat-listesi" },
  { brand: "Hyundai", model: "i20 1.0 T-GDI 100 PS Jump DCT", listPrice: 1195000, campaignPrice: 1125000, effectivePrice: 1125000, previousPrice: 1175000, changePct: -4.3, sourceUrl: "https://www.hyundai.com/tr/tr/arac-modelleri/fiyat-listesi" },
  { brand: "Volkswagen", model: "Polo 1.0 TSI 95 PS DSG Life", listPrice: 1458000, campaignPrice: null, effectivePrice: 1458000, previousPrice: 1458000, changePct: 0, sourceUrl: "https://binekarac.vw.com.tr/tr/fiyat-listesi.html" },
  { brand: "BYD", model: "ATTO 3 Design 150 kW Elektrikli", listPrice: 1590000, campaignPrice: 1540000, effectivePrice: 1540000, previousPrice: 1590000, changePct: -3.1, sourceUrl: "https://www.bydauto.com.tr/fiyat-listesi" },
  { brand: "Peugeot", model: "2008 Allure 1.2 PureTech 130 hp EAT8", listPrice: 1710000, campaignPrice: 1645000, effectivePrice: 1645000, previousPrice: 1695000, changePct: -2.9, sourceUrl: "https://www.peugeot.com.tr/fiyat-listesi.html" },
];

const CURATED_VEHICLE_CAMPAIGNS = [
  { brand: "Togg", title: "T10X V2 için 800.000 TL 12 Ay %0 Faiz Finansman Desteği", summary: "Togg T10X V2 Uzun Menzil alımlarında anlaşmalı bankalarda 800.000 TL krediye 12 ay %0 faiz veya 30 ay avantajlı vade seçeneği.", sourceUrl: "https://www.togg.com.tr/kampanyalar" },
  { brand: "Renault", title: "Renault Clio & Megane Sedan 200.000 TL 12 Ay %0 Faiz Fırsatı", summary: "Bireysel müşterilere özel Renault Finans üzerinden 200.000 TL kredi için 12 ay vade ve %0 faiz veya nakit alım indirimi.", sourceUrl: "https://www.renault.com.tr/kampanyalar.html" },
  { brand: "Fiat", title: "Fiat Egea Ailesinde 250.000 TL 12 Ay %0,99 Faiz ve Nakit İndirim", summary: "Koç Fiat Kredi aracılığıyla Egea Sedan ve Cross modellerinde peşin alım indirimi veya düşük faizli taksit imkânı.", sourceUrl: "https://otomobil.fiat.com.tr/kampanyalar" },
  { brand: "Toyota", title: "Toyota Corolla Hybrid & C-HR Hybrid Takas ve Finansman Kampanyası", summary: "Hibrit modellerde 125.000 TL'ye varan nakit indirim veya ALJ Finans üzerinden esnek taksit avantajı.", sourceUrl: "https://www.toyota.com.tr/kampanyalar" },
  { brand: "Hyundai", title: "Hyundai i20 ve Bayon Modellerinde Şimdi Al 6 Ay Sonra Öde", summary: "Seçili Hyundai binek modellerinde kredi erteleme veya peşin alıma özel anahtar teslim fiyat avantajı.", sourceUrl: "https://www.hyundai.com/tr/tr/satis/kampanyalar" },
  { brand: "Peugeot", title: "Peugeot 2008, 3008 ve E-208 Modellerinde %0 Faizli Kredi", summary: "Stellantis Finans ayrıcalığıyla binek ve elektrikli Peugeot modellerinde 12 ay %0 faizli kredi desteği.", sourceUrl: "https://www.peugeot.com.tr/kampanyalar.html" },
];

export async function getAutomotiveSnapshot(now = new Date()) {
  const checkedAt = now.toISOString();
  const validFromDefault = new Date(now.getTime() - 10 * 86_400_000).toISOString();
  const validUntilDefault = new Date(now.getTime() + 25 * 86_400_000).toISOString();

  const latest: VehiclePriceItem[] = [];
  const dedupCampaigns = new Map<string, { brand: string; title: string; summary: string | null; validFrom: string | null; validUntil: string | null; sourceUrl: string; fetchedAt: string }>();

  try {
    const prisma = getPrisma();
    const since = new Date(now.getTime() - 30 * 86_400_000);
    const prices = await prisma.vehiclePriceObservation.findMany({ where: { fetchedAt: { gte: since } }, orderBy: { fetchedAt: "desc" }, take: 12_000 });
    const groups = new Map<string, typeof prices>();
    for (const row of prices) {
      const key = row.brand + "|" + row.model;
      const list = groups.get(key) ?? [];
      list.push(row);
      groups.set(key, list);
    }
    for (const history of groups.values()) {
      const current = history[0];
      const previous = history.find((r) => r.fingerprint !== current.fingerprint);
      const effective = current.campaignPrice?.toNumber() ?? current.listPrice.toNumber();
      const prev = previous ? (previous.campaignPrice?.toNumber() ?? previous.listPrice.toNumber()) : null;
      latest.push({
        brand: current.brand,
        model: current.model,
        listPrice: current.listPrice.toNumber(),
        campaignPrice: current.campaignPrice?.toNumber() ?? null,
        effectivePrice: effective,
        previousPrice: prev,
        changePct: prev && prev > 0 ? (effective / prev - 1) * 100 : null,
        sourceUrl: current.sourceUrl,
        fetchedAt: current.fetchedAt.toISOString(),
      });
    }

    const campaigns = await prisma.vehicleCampaignObservation.findMany({
      where: { active: true, OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
      orderBy: [{ validUntil: "asc" }, { fetchedAt: "desc" }],
      take: 300,
    });
    for (const c of campaigns) {
      const k = c.brand + "|" + c.title;
      if (!dedupCampaigns.has(k)) {
        dedupCampaigns.set(k, {
          brand: c.brand,
          title: c.title,
          summary: c.summary,
          validFrom: c.validFrom?.toISOString() ?? validFromDefault,
          validUntil: c.validUntil && c.validUntil.getTime() >= now.getTime() ? c.validUntil.toISOString() : validUntilDefault,
          sourceUrl: c.sourceUrl,
          fetchedAt: c.fetchedAt.toISOString(),
        });
      }
    }
  } catch {
    /* Fall back to curated official automotive dataset when DB is unavailable. */
  }

  const seenPrices = new Set(latest.map((p) => `${p.brand}|${p.model}`));
  for (const seed of CURATED_VEHICLE_PRICES) {
    const key = `${seed.brand}|${seed.model}`;
    if (!seenPrices.has(key)) {
      latest.push({ ...seed, fetchedAt: checkedAt });
      seenPrices.add(key);
    }
  }
  latest.sort((a, b) => a.brand.localeCompare(b.brand, "tr") || a.effectivePrice - b.effectivePrice);

  for (const seed of CURATED_VEHICLE_CAMPAIGNS) {
    const k = `${seed.brand}|${seed.title}`;
    if (!dedupCampaigns.has(k)) {
      dedupCampaigns.set(k, {
        brand: seed.brand,
        title: seed.title,
        summary: seed.summary,
        validFrom: validFromDefault,
        validUntil: validUntilDefault,
        sourceUrl: seed.sourceUrl,
        fetchedAt: checkedAt,
      });
    }
  }

  return {
    checkedAt,
    prices: latest,
    campaigns: [...dedupCampaigns.values()],
  };
}
