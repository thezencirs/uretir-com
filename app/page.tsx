import Link from "next/link";
import { GalaxyIntro } from "@/components/galaxy-intro";

export default function HomePage() {
  return (
    <div className="home-galaxy-only">
      <div className="sr-only">
        <h1>Üretir — İşimiz dünyayı döndürmek. Türkiye üretir, gençler yetişir.</h1>
        <p>
          Üretir Evreni; Türkiye&apos;nin gündemini, finans piyasalarını, resmî banka kampanyalarını, gerçek e-ticaret
          indirimlerini, sıfır ve ikinci el otomobil piyasasını, konut ve kamu ihale taşınmazlarını, spor istatistiklerini
          ve oyun ekosistemini doğrulanmış kaynaklarla analiz eden 8 otonom yapay zekâ aracını tek bir 3B galaksi
          deneyiminde birleştirir.
        </p>
        <nav aria-label="Üretir 8 Otonom Yapay Zekâ Aracı">
          <ul>
            <li><Link href="/puan-ai">PuanAI — Resmî Banka ve Kredi Kartı Kampanya Danışmanı</Link></li>
            <li><Link href="/haber-ai">HaberAI — 81 İl Türkiye Gündem Haritası</Link></li>
            <li><Link href="/finans-ai">FinansAI — Canlı Döviz, Gram Altın, BIST 100 ve Emtia Ekranı</Link></li>
            <li><Link href="/araba-ai">ArabaAI — Sıfır Araç Liste Fiyatları ve 2. El Kıyaslama</Link></li>
            <li><Link href="/oyun-ai">OyunAI — Steam MENA-USD İndirim Radarı ve Hafıza Oyunu</Link></li>
            <li><Link href="/spor-ai">SporAI — Süper Lig xG Analizi ve UEFA Ülke Puanı Radarı</Link></li>
            <li><Link href="/indirim-ai">İndirimAI — 30/90/360 Gün Fiyat Geçmişi ve Dönem Dibi Radarı</Link></li>
            <li><Link href="/ev-ai">EvAI — Haritalı Konut, Arsa ve Kamu İhale Taşınmaz Analizi</Link></li>
          </ul>
        </nav>
      </div>
      <GalaxyIntro />
    </div>
  );
}
