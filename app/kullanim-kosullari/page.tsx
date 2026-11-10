import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kullanım Koşulları, Yasal Uyarı ve Künye",
  description:
    "Üretir (uretir.com) kullanım koşulları, finansal ve yatırım tavsiyesi içermeme beyanı, çerez/reklam politikası ve kurumsal künye bilgileri.",
  alternates: { canonical: "/kullanim-kosullari" },
  openGraph: {
    title: "Kullanım Koşulları, Yasal Uyarı ve Künye — Üretir",
    description:
      "Üretir (uretir.com) kullanım koşulları, finansal ve yatırım tavsiyesi içermeme beyanı, çerez/reklam politikası ve kurumsal künye bilgileri.",
    url: `${SITE_URL}/kullanim-kosullari`,
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <article className="section-wrap py-16 md:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="border-b border-black/10 pb-8 dark:border-white/10">
          <p className="eyebrow text-muted">KURUMSAL &amp; YASAL BİLGİLENDİRME</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
            Kullanım Koşulları, Yasal Uyarı ve Künye
          </h1>
          <p className="mt-3 text-sm text-muted">Son güncelleme: 10 Kasım 2026 · Yürürlük alanı: www.uretir.com</p>
        </header>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">1. Hizmetin Kapsamı ve Veri Metodolojisi</h2>
          <p className="text-sm leading-relaxed text-muted">
            Üretir (<strong>uretir.com</strong>); Türkiye&apos;deki resmî banka kampanyalarını (PuanAI), piyasa göstergelerini (FinansAI),
            e-ticaret fiyat gözlemlerini (İndirimAI), konut ve kamu ihale taşınmaz ilanlarını (EvAI), otomobil liste/piyasa verilerini (ArabaAI),
            81 il gündemini (HaberAI), spor istatistiklerini (SporAI) ve oyun ekosistemini (OyunAI) birincil kaynak bağlantılarıyla derleyen
            bağımsız bir veri ve araştırma platformudur.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">2. Yatırım, Kredi ve Finansal Tavsiye İçermeme Beyanı (SPK &amp; BDDK Uyarısı)</h2>
          <p className="text-sm leading-relaxed text-muted">
            Bu sitede yer alan döviz kurları, altın fiyatları, Borsa İstanbul verileri, mevduat faizi hesaplamaları, kredi kartı kampanya
            karşılaştırmaları, kira çarpanı analizleri ve 2. el araç değerlemeleri <strong>yalnızca genel bilgilendirme ve hesaplama simülasyonu</strong>
            niteliğindedir. Sermaye Piyasası Kurulu (SPK) veya Bankacılık Düzenleme ve Denetleme Kurumu (BDDK) kapsamında
            <strong> yatırım danışmanlığı, kredi aracılığı veya finansal tavsiye değildir.</strong> Kullanıcılar işlem yapmadan önce ilgili
            bankanın, kurumun veya satıcının resmî sayfasındaki güncel şartları doğrulamakla yükümlüdür.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">3. Reklam, Google AdSense ve Çerez (Cookie) Kullanımı</h2>
          <p className="text-sm leading-relaxed text-muted">
            Üretir, platformun ücretsiz sürdürülebilirliğini sağlamak amacıyla Google AdSense ve doğrudan kurumsal sponsorluklar aracılığıyla
            reklam gösterebilir. Google ve üçüncü taraf reklam sağlayıcıları, kullanıcıların bu siteye ve internetteki diğer sitelere yaptığı
            önceki ziyaretlere dayalı reklamlar sunmak için çerezleri (DoubleClick DART çerezi dahil) kullanabilir. Kullanıcılar,
            <Link href="/gizlilik-politikasi" className="ml-1 font-semibold underline">
              Gizlilik Politikası
            </Link>{" "}
            sayfamızda açıklandığı üzere Google Reklam Ayarları üzerinden kişiselleştirilmiş reklamcılığı diledikleri zaman devre dışı bırakabilir.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-2xl font-bold">4. Fikri Mülkiyet ve Kaynak Gösterimi</h2>
          <p className="text-sm leading-relaxed text-muted">
            Platformda yer alan banka, mağaza ve otomobil markaları ilgili hak sahiplerinin tescilli markalarıdır; Üretir üzerinde yalnızca
            tüketici karşılaştırması ve haber/bilgi verme hakkı kapsamında kaynak gösterilerek referans verilir.
          </p>
        </section>

        <section className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="font-display text-xl font-bold">5. Kurumsal Künye &amp; İletişim</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><strong>Yayın Adı:</strong> Üretir — Otonom Veri ve Araştırma Platformu (www.uretir.com)</li>
            <li><strong>E-posta &amp; Hukuki Bildirim:</strong> <a href="mailto:merhaba@uretir.com" className="underline">merhaba@uretir.com</a></li>
            <li><strong>İletişim &amp; Reklam Masası:</strong> <Link href="/iletisim" className="underline">uretir.com/iletisim</Link></li>
          </ul>
        </section>
      </div>
    </article>
  );
}
