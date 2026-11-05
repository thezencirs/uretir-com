import Link from "next/link";
import { GalaxyIntro } from "@/components/galaxy-intro";
import { getPublishedContent } from "@/lib/site-content-store";

export default async function HomePage() {
  const content = await getPublishedContent();
  return (
    <div className="home-galaxy-only">
      <div className="sr-only">
        <h1>
          {content.home.title} — İşimiz dünyayı döndürmek. {content.home.description}
        </h1>
        <p>
          Üretir Evreni; Türkiye&apos;nin gündemini, finans piyasalarını, resmî banka kampanyalarını, gerçek e-ticaret
          indirimlerini, sıfır ve ikinci el otomobil piyasasını, konut ve kamu ihale taşınmazlarını, spor istatistiklerini
          ve oyun ekosistemini doğrulanmış kaynaklarla analiz eden 8 otonom yapay zekâ aracını tek bir 3B galaksi
          deneyiminde birleştirir.
        </p>
        <nav aria-label="Üretir 8 Otonom Yapay Zekâ Aracı">
          <ul>
            <li>
              <Link href="/puan-ai">
                PuanAI — Resmî Banka ve Kredi Kartı Kampanya Danışmanı (Kart bilgisi toplamadan hangi kartla ne kadar puan kazanılacağını hesaplar)
              </Link>
            </li>
            <li>
              <Link href="/haber-ai">
                HaberAI — 81 İl Türkiye Gündem Haritası ve Doğrulanmış Ajans Haber Özeti
              </Link>
            </li>
            <li>
              <Link href="/finans-ai">
                FinansAI — Canlı Döviz, Gram Altın, BIST 100, Kripto ve Emtia Piyasa Ekranı
              </Link>
            </li>
            <li>
              <Link href="/araba-ai">
                ArabaAI — Sıfır Araç Resmî Liste Fiyatları, Kampanyalar ve Haritalı 2. El Kıyaslama
              </Link>
            </li>
            <li>
              <Link href="/oyun-ai">
                OyunAI — Steam MENA-USD ve Epic Games İndirim Radarı, Türk Oyun Stüdyoları ve Hafıza Oyunu
              </Link>
            </li>
            <li>
              <Link href="/spor-ai">
                SporAI — Süper Lig xG Analizi, Canlı UEFA Ülke Puanı Simülatörü ve BIST Spor Ekonomisi
              </Link>
            </li>
            <li>
              <Link href="/indirim-ai">
                İndirimAI — 30/90/360 Günlük Fiyat Geçmişi Doğrulanmış Gerçek Dönem Dibi Kampanya Radarı
              </Link>
            </li>
            <li>
              <Link href="/ev-ai">
                EvAI — 81 İl Haritalı Konut, Arsa ve Resmî Kamu İhale Taşınmaz Analizi
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <GalaxyIntro />
    </div>
  );
}
